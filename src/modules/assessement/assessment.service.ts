import { DuplicateEntryError, NotFoundError } from "../../common/error";
import { db } from "../../config/drizzle";
import {
    user as userTable,
    assessment as assessmentTable,
    occupation as occupationTable,
    scheme as schemeTable,
    assessmentSchedule as assessmentScheduleTable,
    scheduleDetail as scheduleDetailTable,
    ucApl02 as ucApl02Table,
    elementApl02 as elementApl02Table,
    elementDetailsApl02 as elementDetailsApl02Table,
    groupIa01 as groupIa01Table,
    groupIa02 as groupIa02Table,
    groupIa03 as groupIa03Table,
    ucIa01 as ucIa01Table,
    ucIa02 as ucIa02Table,
    ucIa03 as ucIa03Table,
    elementIa as elementIaTable,
    elementDetailsIa as elementDetailsIaTable,
    ia02Tool as ia02ToolTable,
    ia03Question as ia03QuestionTable,
    ia05Question as ia05QuestionTable,
    ia07Question as ia07QuestionTable,
    questionOption as questionOptionTable,
    result as resultTable,
    assessor as assessorTable,
    assessee as assesseeTable,
    resultDoc as resultDocTable,
    resultApl02Header as resultApl02HeaderTable,
    resultIa01Header as resultIa01HeaderTable,
    resultIa02Header as resultIa02HeaderTable,
    resultIa03Header as resultIa03HeaderTable,
    resultIa05Header as resultIa05HeaderTable,
    resultIa07Header as resultIa07HeaderTable,
    resultAk01Header as resultAk01HeaderTable,
    resultAk02Header as resultAk02HeaderTable,
    resultAk03Header as resultAk03HeaderTable,
    resultAk04 as resultAk04Table,
    resultAk05 as resultAk05Table,
    ia02Pdf as ia02PdfTable,
    assessee,
    resultIa01Header,
    resultIa02Header,
    resultIa03Header,
    resultIa05Header,
    resultAk01Header,
    resultAk02Header,
    resultAk03Header,
    resultAk04,
    resultAk05,
    assessor,
    resultIa07Header,
    scheduleDetail,
    resultApl02,
    resultIa01,
    resultIa05,
} from "../../../drizzle/schema";
import { eq, and, desc, asc, is, sql } from "drizzle-orm";
import { AdminTab, AssesseeTab, AssessmentDetailsResponse, AssessmentRequest, AssessmentResponse, AssessorTab } from "./assessment.type";
import { AssessorResponse } from "../assessor/assessor.type";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { embedQrCode } from "../../helper/pdfAssets.helper";
import { drawParagraph, drawMixedParagraph } from "../../helper/pdfDraw.helper";
import { getAssessorUrl } from "../../helper/hashids";

export class AssessmentService {
    static async createAssessment(data: AssessmentRequest) {
        // Check if scheme exists
        const existingScheme = await db.query.scheme.findFirst({
            where: eq(schemeTable.id, data.scheme_id)
        });

        if (!existingScheme) {
            throw new NotFoundError("Scheme");
        }

        // Check for duplicate assessment code
        const existingAssessment = await db.query.assessment.findFirst({
            where: eq(assessmentTable.code, data.code)
        });

        if (existingAssessment) {
            throw new DuplicateEntryError("Assessment code", data.code);
        }

        // Find or create occupation
        let existingOccupation = await db.query.occupation.findFirst({
            where: and(
                eq(occupationTable.name, data.occupation_name),
                eq(occupationTable.scheme_id, data.scheme_id)
            )
        });

        if (!existingOccupation) {
            const [createdOccupation] = await db.insert(occupationTable).values({
                name: data.occupation_name,
                scheme_id: data.scheme_id
            }).$returningId();
            existingOccupation = await db.query.occupation.findFirst({
                where: eq(occupationTable.id, createdOccupation.id)
            });
        }

        return await db.transaction(async (tx) => {
            // Create occupation
            const [occupation] = await tx.insert(occupationTable).values({
                scheme_id: data.scheme_id,
                name: data.occupation_name,
            });

            // Create assessment
            const [assessment] = await tx.insert(assessmentTable).values({
                occupation_id: (occupation as any).insertId,
                code: data.code,
            });

            const assessment_id = (assessment as any).insertId;

            // Create UC APL02
            for (const uc of data.uc_apl02s) {
                const [ucApl02] = await tx.insert(ucApl02Table).values({
                    assessment_id,
                    unit_code: uc.unit_code,
                    title: uc.title,
                });

                for (const element of uc.elements) {
                    const [elementApl02] = await tx.insert(elementApl02Table).values({
                        uc_id: (ucApl02 as any).insertId,
                        title: element.title,
                    });

                    for (const detail of element.details) {
                        await tx.insert(elementDetailsApl02Table).values({
                            element_id: (elementApl02 as any).insertId,
                            description: detail.description,
                        });
                    }
                }
            }

            // Create Group IA01
            for (const group of data.groups_ia01) {
                const [groupIa01] = await tx.insert(groupIa01Table).values({
                    assessment_id,
                    name: group.name,
                });

                for (const unit of group.units) {
                    const [ucIa01] = await tx.insert(ucIa01Table).values({
                        group_id: (groupIa01 as any).insertId,
                        unit_code: unit.unit_code,
                        title: unit.title,
                    });

                    for (const element of unit.elements) {
                        const [elementIa] = await tx.insert(elementIaTable).values({
                            uc_id: (ucIa01 as any).insertId,
                            title: element.title,
                        });

                        for (const detail of element.details) {
                            await tx.insert(elementDetailsIaTable).values({
                                element_id: (elementIa as any).insertId,
                                description: detail.description,
                                benchmark: detail.benchmark,
                            });
                        }
                    }
                }
            }

            // Create Group IA03
            for (const group of data.groups_ia03) {
                const [groupIa03] = await tx.insert(groupIa03Table).values({
                    assessment_id,
                    name: group.name,
                });

                for (const unit of group.units) {
                    await tx.insert(ucIa03Table).values({
                        group_id: (groupIa03 as any).insertId,
                        unit_code: unit.unit_code,
                        title: unit.title,
                    });
                }

                for (const question of group.qa_ia03) {
                    await tx.insert(ia03QuestionTable).values({
                        group_id: (groupIa03 as any).insertId,
                        question: question.question,
                    });
                }
            }

            // Create IA05 Questions
            if (data.ia05_questions && data.ia05_questions.length > 0) {
                for (const question of data.ia05_questions) {
                    const [ia05Question] = await tx.insert(ia05QuestionTable).values({
                        assessment_id,
                        order: question.order,
                        question: question.question,
                    });

                    for (const option of question.options) {
                        await tx.insert(questionOptionTable).values({
                            question_id: (ia05Question as any).insertId,
                            option: option.option,
                            is_answer: option.is_answer,
                        });
                    }
                }
            }

            // Create IA07 Questions
            if (data.ia07_questions && data.ia07_questions.length > 0) {
                for (const question of data.ia07_questions) {
                    await tx.insert(ia07QuestionTable).values({
                        assessment_id,
                        question: question.question,
                        answer_key: question.answer_key,
                    });
                }
            }

            return { id: assessment_id };
        });
    }

    static async getAssessments(): Promise<AssessmentResponse[]> {
        const assessments = await db.select({
            id: assessmentTable.id,
            code: assessmentTable.code,
            occupation_id: assessmentTable.occupation_id,
        }).from(assessmentTable);

        const result = [];
        for (const assessment of assessments) {
            const [occupation] = await db
                .select()
                .from(occupationTable)
                .where(eq(occupationTable.id, assessment.occupation_id));

            if (!occupation) continue;

            const [scheme] = await db
                .select()
                .from(schemeTable)
                .where(eq(schemeTable.id, (occupation as any).scheme_id));

            result.push({
                id: assessment.id,
                code: assessment.code,
                occupation: {
                    id: (occupation as any).id,
                    name: (occupation as any).name,
                    scheme: scheme
                        ? {
                            id: (scheme as any).id,
                            code: (scheme as any).code,
                            name: (scheme as any).name,
                        }
                        : null,
                },
            });
        }

        return result as any;
    }

    static async getAssessmentById(id: number): Promise<AssessmentDetailsResponse> {
        const assessment = await db.query.assessment.findFirst({
            where: eq(assessmentTable.id, id)
        });

        if (!assessment) {
            throw new NotFoundError('Assessment');
        }

        // Get occupation and scheme manually (tanpa relations API)
        const [occupation] = await db
            .select()
            .from(occupationTable)
            .where(eq(occupationTable.id, assessment.occupation_id));

        let scheme: any = null;
        if (occupation) {
            const [sc] = await db
                .select()
                .from(schemeTable)
                .where(eq(schemeTable.id, (occupation as any).scheme_id));
            scheme = sc ?? null;
        }

        // Get all related data without complex relations
        const ucApl02s = await db.select().from(ucApl02Table).where(eq(ucApl02Table.assessment_id, id));
        const groupsIa01 = await db.select().from(groupIa01Table).where(eq(groupIa01Table.assessment_id, id));
        const groupsIa02 = await db.select().from(groupIa02Table).where(eq(groupIa02Table.assessment_id, id));
        const groupsIa03 = await db.select().from(groupIa03Table).where(eq(groupIa03Table.assessment_id, id));
        const ia05Questions = await db.select().from(ia05QuestionTable).where(eq(ia05QuestionTable.assessment_id, id));
        const ia07Questions = await db.select().from(ia07QuestionTable).where(eq(ia07QuestionTable.assessment_id, id));

        return {
            id: assessment.id,
            code: assessment.code,
            occupation: occupation
                ? {
                    ...(occupation as any),
                    scheme,
                }
                : null,
            uc_apl02s: ucApl02s as any,
            groups_ia01: groupsIa01 as any,
            groups_ia02: groupsIa02 as any,
            groups_ia03: groupsIa03 as any,
            ia05_questions: ia05Questions as any,
            ia07_questions: ia07Questions as any,
        };
    }

    static async deleteAssessment(id: number): Promise<any> {
        const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, id) });
        if (!assessment) {
            throw new NotFoundError('Assessment not found');
        }

        await db.delete(assessmentTable).where(eq(assessmentTable.id, id));
        return { message: 'Assessment deleted successfully' };
    }

    static async getAssessmentResultDetails(assessment_id: number, assessor_id: number, assessee_id: number) {
        const results = await db
            .select({
                id: resultTable.id,
                assessment: assessmentTable,
                assessee: assesseeTable,
                assessor: assessor,
                tuk: resultTable.tuk,
                is_competent: resultTable.is_competent,
                created_at: resultTable.created_at,
            })
            .from(resultTable)
            .innerJoin(assessmentTable, eq(resultTable.assessment_id, assessmentTable.id))
            .innerJoin(assesseeTable, eq(resultTable.assessee_id, assesseeTable.id))
            .innerJoin(assessor, eq(resultTable.assessor_id, assessor.id))
            .where(and(
                eq(assessmentTable.id, assessment_id),
                eq(assessor.id, assessor_id),
                eq(assesseeTable.id, assessee_id)
            ))
            .orderBy(desc(resultTable.created_at))
            .limit(1);

        if (results.length === 0) {
            throw new NotFoundError('Result');
        }

        const result = results[0];
        const doc = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.result_id, result.id) });
        const apl02Header = await db.query.resultApl02Header.findFirst({ where: eq(resultApl02HeaderTable.result_id, result.id) });
        const ia01Header = await db.query.resultIa01Header.findFirst({ where: eq(resultIa01Header.result_id, result.id) });
        const ia02Header = await db.query.resultIa02Header.findFirst({ where: eq(resultIa02Header.result_id, result.id) });
        const ia03Header = await db.query.resultIa03Header.findFirst({ where: eq(resultIa03Header.result_id, result.id) });
        const ia05Header = await db.query.resultIa05Header.findFirst({ where: eq(resultIa05Header.result_id, result.id) });
        const ak01Header = await db.query.resultAk01Header.findFirst({ where: eq(resultAk01Header.result_id, result.id) });
        const ak02Header = await db.query.resultAk02Header.findFirst({ where: eq(resultAk02Header.result_id, result.id) });
        const ak03Header = await db.query.resultAk03Header.findFirst({ where: eq(resultAk03Header.id, result.id) });
        const ak04 = await db.query.resultAk04.findFirst({ where: eq(resultAk04.id, result.id) });
        const ak05 = await db.query.resultAk05.findFirst({ where: eq(resultAk05.id, result.id) });

        return [
            {
                id: result.id,
                assessment: result.assessment,
                assessee: result.assessee,
                assessor: result.assessor,
                tuk: result.tuk,
                is_competent: result.is_competent,
                created_at: result.created_at,
                doc: doc,
                apl02_header: apl02Header,
                ia01_header: ia01Header,
                ia02_header: ia02Header,
                ia03_header: ia03Header,
                ia05_header: ia05Header,
                ak01_header: ak01Header,
                ak02_header: ak02Header,
                ak03_header: ak03Header,
                ak04: ak04,
                ak05: ak05
            }
        ];
    }

    static async findAssesseeByUserId(assessment_id: number, assessor_id: number, user_id: number): Promise<number> {
        const assessees = await db.query.assessee.findMany({ where: eq(assesseeTable.user_id, user_id), orderBy: desc(assesseeTable.created_at) });

        let result: any;
        for (const assesseeItem of assessees) {
            const results = await db.query.result.findMany({
                where: and(
                    eq(resultTable.assessment_id, assessment_id),
                    eq(resultTable.assessor_id, assessor_id),
                    eq(resultTable.assessee_id, assesseeItem.id)
                ),
                limit: 1,
                orderBy: desc(resultTable.created_at)
            });

            if (results.length > 0) {
                result = results[0];
                break;
            }
        }

        if (!result) return 0;
        return result.assessee_id;
    }

    static async assesseeNavigation(assessment_id: number, assessor_id: number, assessee_id: number) {
        const result = await db.select().from(resultTable)
            .where(and(
                eq(resultTable.assessment_id, assessment_id),
                eq(resultTable.assessor_id, assessor_id),
                eq(resultTable.assessee_id, assessee_id)
            ))
            .orderBy(desc(resultTable.created_at))
            .limit(1);
        if (result.length === 0 || !result[0]) throw new NotFoundError('Result');

        // Document
        const doc = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.result_id, result[0].id) });
        if (!doc) throw new NotFoundError('Result Document');

        // APL02
        const apl02Header = await db.query.resultApl02Header.findFirst({ where: eq(resultApl02HeaderTable.result_id, result[0].id) });
        if (!apl02Header) throw new NotFoundError('Result APL02 Header');
        const unitCompetencies = await db.select().from(ucApl02Table).where(eq(ucApl02Table.assessment_id, result[0].assessment_id));
        let finishedUcApl02Count = 0;
        for (const uc of unitCompetencies) {
            const elements = await db.select().from(elementApl02Table).where(eq(elementApl02Table.uc_id, uc.id));
            let completedElements = 0;
            for (const el of elements) {
                const row = await db.query.resultApl02.findFirst({ where: and(eq(resultApl02.result_apl02_id, apl02Header.id), eq(resultApl02.element_id, el.id)) });
                if (row) completedElements += 1;
            }
            if (elements.length > 0 && completedElements === elements.length) finishedUcApl02Count++;
        }
        const finishedApl02 = finishedUcApl02Count === unitCompetencies.length;

        // AK01
        const ak01Header = await db.query.resultAk01Header.findFirst({ where: eq(resultAk01HeaderTable.result_id, result[0].id) });
        if (!ak01Header) throw new NotFoundError('Result AK01 Header');

        // IA02
        const ia02Header = await db.query.resultIa02Header.findFirst({ where: eq(resultIa02HeaderTable.result_id, result[0].id) });
        if (!ia02Header) throw new NotFoundError('Result IA02 Header');

        // IA01
        const ia01Header = await db.query.resultIa01Header.findFirst({ where: eq(resultIa01HeaderTable.result_id, result[0].id) });
        if (!ia01Header) throw new NotFoundError('Result IA01 Header');

        const tabs: AssesseeTab[] = [
            { name: 'APL-01', status: "Tuntas" },
            { name: 'Data Sertifikasi', status: doc.approved ? "Tuntas" : "Menunggu" },
            { name: 'APL-02', status: (apl02Header.approved_assessor && apl02Header.approved_assessee && finishedApl02) ? "Tuntas" : (apl02Header.approved_assessor && finishedApl02) ? "Butuh Persetujuan" : finishedApl02 ? "Menunggu" : "Belum Tuntas" },
            { name: 'AK-01', status: (ak01Header.approved_assessor && ak01Header.approved_assessee) ? "Tuntas" : (ak01Header.approved_assessor) ? "Butuh Persetujuan" : "Menunggu" },
            { name: 'IA-02', status: (ia02Header.approved_assessor && ia02Header.approved_assessee) ? "Tuntas" : (ia02Header.approved_assessor) ? "Butuh Persetujuan" : "Menunggu" },
            { name: 'IA-01', status: (ia01Header.approved_assessor && ia01Header.approved_assessee) ? "Tuntas" : (ia01Header.approved_assessor) ? "Butuh Persetujuan" : "Menunggu" }
        ];

        const isAnyIa03 = await db.query.groupIa03.findFirst({ where: eq(groupIa03Table.assessment_id, assessment_id) });
        const isAnyIa05 = await db.query.ia05Question.findFirst({ where: eq(ia05QuestionTable.assessment_id, assessment_id) });
        // const isAnyIa07 = await db.query.ia07Question.findFirst({ where: eq(ia07QuestionTable.assessment_id, assessment_id) });

        if (isAnyIa03) {
            const ia03Header = await db.query.resultIa03Header.findFirst({ where: eq(resultIa03HeaderTable.result_id, result[0].id) });
            if (!ia03Header) throw new NotFoundError('Result IA03 Header');
            const status = (ia03Header.approved_assessor && ia03Header.approved_assessee) ? "Tuntas" : (ia03Header.approved_assessor) ? "Butuh Persetujuan" : "Menunggu";
            tabs.push({ name: 'IA-03', status: status });
        }
        if (isAnyIa05) {
            const ia05Header = await db.query.resultIa05Header.findFirst({ where: eq(resultIa05HeaderTable.result_id, result[0].id) });
            if (!ia05Header) throw new NotFoundError('Result IA05 Header');
            const ia05Result = await db.query.resultIa05.findFirst({ where: eq(resultIa05.header_id, ia05Header.id) });
            const status = (ia05Header.approved_assessor && ia05Header.approved_assessee) ? "Tuntas" : (ia05Header.approved_assessor) ? "Butuh Persetujuan" : (ia05Result) ? "Menunggu" : "Belum Tuntas";
            tabs.push({ name: 'IA-05', status: status });
        }
        // if (isAnyIa07) tabs.push({ name: 'IA-07', status: 'Belum Selesai' });

        const ak02Header = await db.query.resultAk02Header.findFirst({ where: eq(resultAk02HeaderTable.result_id, result[0].id) });
        if (!ak02Header) throw new NotFoundError('Result AK02 Header');

        const ak03Header = await db.query.resultAk03Header.findFirst({ where: eq(resultAk03HeaderTable.result_id, result[0].id) });
        if (!ak03Header) throw new NotFoundError('Result AK03 Header');

        const ak05Header = await db.query.resultAk05.findFirst({ where: eq(resultAk05Table.result_id, result[0].id) });
        if (!ak05Header) throw new NotFoundError('Result AK05');

        tabs.push(
            { name: 'AK-02', status: (ak02Header.approved_assessor && ak02Header.approved_assessee) ? "Tuntas" : (ak02Header.approved_assessor) ? "Butuh Persetujuan" : "Menunggu" },
            { name: 'AK-03', status: (ak03Header.comment) ? "Tuntas" : "Belum Tuntas" },
            { name: 'AK-05', status: (ak05Header.approved_assessor) ? "Tuntas" : "Menunggu" }
        );

        const enableOtherRoute = (doc.approved && (apl02Header.approved_assessor && apl02Header.is_continue))

        return {
            result_id: result[0].id,
            assessment_id: result[0].assessment_id,
            assessor_id: result[0].assessor_id,
            assessee_id: result[0].assessee_id,
            tuk: result[0].tuk,
            is_competent: result[0].is_competent,
            created_at: result[0].created_at,
            tabs: tabs,
            enable_other_route: enableOtherRoute,
        }
    }

    static async assessorNavigation(assessment_id: number, assessor_id: number) {
        const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, assessment_id) });
        if (!assessment) throw new NotFoundError('Assessment');

        const tabs: AssessorTab[] = [
            { name: 'APL-02', status: "Menunggu Asesi" },
            { name: 'AK-01', status: "Belum Tuntas" },
            { name: 'IA-02', status: "Belum Tuntas" },
            { name: 'IA-01', status: "Belum Tuntas" }
        ];

        const isAnyIa03 = await db.query.groupIa03.findFirst({ where: eq(groupIa03Table.assessment_id, assessment_id) });
        const isAnyIa05 = await db.query.ia05Question.findFirst({ where: eq(ia05QuestionTable.assessment_id, assessment_id) });
        const isAnyIa07 = await db.query.ia07Question.findFirst({ where: eq(ia07QuestionTable.assessment_id, assessment_id) });
        if (isAnyIa03) tabs.push({ name: 'IA-03', status: "Belum Tuntas" });
        if (isAnyIa05) tabs.push({ name: 'IA-05', status: "Menunggu Asesi" });
        if (isAnyIa07) tabs.push({ name: 'IA-07', status: "Belum Tuntas" });
        tabs.push(
            { name: 'AK-02', status: "Belum Tuntas" },
            { name: 'AK-03', status: "Menunggu Asesi" },
            { name: 'AK-05', status: "Belum Tuntas" }
        );

        const results = await db.select().from(resultTable)
            .where(and(
                eq(resultTable.assessment_id, assessment_id),
                eq(resultTable.assessor_id, assessor_id)
            ));
        if (results.length === 0) {
            return {
                assessment_id: assessment.id,
                assessment_code: assessment.code,
                tabs: tabs,
            };
        }

        for (const tab of tabs) {
            let status: AssessorTab["status"] = tab.status;
            for (const result of results) {
                let header: any = null;
                switch (tab.name) {
                    case 'APL-02':
                        header = await db.query.resultApl02Header.findFirst({ where: eq(resultApl02HeaderTable.result_id, result.id) });
                        if (header) {
                            const unitCompetencies = await db.select().from(ucApl02Table).where(eq(ucApl02Table.assessment_id, result.assessment_id));
                            let finishedUcApl02Count = 0;
                            for (const uc of unitCompetencies) {
                                const elements = await db.select().from(elementApl02Table).where(eq(elementApl02Table.uc_id, uc.id));
                                let completedElements = 0;
                                for (const el of elements) {
                                    const row = await db.query.resultApl02.findFirst({ where: and(eq(resultApl02.result_apl02_id, header.id), eq(resultApl02.element_id, el.id)) });
                                    if (row) completedElements += 1;
                                }
                                if (elements.length > 0 && completedElements === elements.length) finishedUcApl02Count++;
                            }
                            const finishedApl02 = finishedUcApl02Count === unitCompetencies.length;

                            if (!finishedApl02 && !header.approved_assessor && !header.approved_assessee) {
                                status = "Menunggu Asesi";
                            } else if (finishedApl02 && !header.approved_assessor && !header.approved_assessee) {
                                status = "Butuh Persetujuan";
                            } else if (header.approved_assessor && !header.approved_assessee) {
                                status = "Menunggu Asesi";
                            } else if (header.approved_assessor && header.approved_assessee) {
                                status = "Tuntas";
                            }
                        }
                        break;
                    case 'AK-01':
                        header = await db.query.resultAk01Header.findFirst({ where: eq(resultAk01HeaderTable.result_id, result.id) });
                        if (header) {
                            if (!header.approved_assessor && !header.approved_assessee) {
                                status = "Belum Tuntas";
                            } else if (header.approved_assessor && !header.approved_assessee) {
                                status = "Menunggu Asesi";
                            } else if (header.approved_assessor && header.approved_assessee) {
                                status = "Tuntas";
                            }
                        }
                        break;
                    case 'AK-02':
                        header = await db.query.resultAk02Header.findFirst({ where: eq(resultAk02HeaderTable.result_id, result.id) });
                        if (header) {
                            if (!header.approved_assessor && !header.approved_assessee) {
                                status = "Belum Tuntas";
                            } else if (header.approved_assessor && !header.approved_assessee) {
                                status = "Menunggu Asesi";
                            } else if (header.approved_assessor && header.approved_assessee) {
                                status = "Tuntas";
                            }
                        }
                        break;
                    case 'AK-03':
                        header = await db.query.resultAk03Header.findFirst({ where: eq(resultAk03HeaderTable.result_id, result.id) });
                        if (header) {
                            status = header.comment ? "Tuntas" : "Menunggu Asesi";
                        }
                        break;
                    case 'AK-05':
                        header = await db.query.resultAk05.findFirst({ where: eq(resultAk05Table.result_id, result.id) });
                        if (header) {
                            status = header.approved_assessor ? "Tuntas" : "Belum Tuntas";
                        }
                        break;
                    case 'IA-01':
                        header = await db.query.resultIa01Header.findFirst({ where: eq(resultIa01HeaderTable.result_id, result.id) });
                        if (header) {
                            if (!header.approved_assessor && !header.approved_assessee) {
                                status = "Belum Tuntas";
                            } else if (header.approved_assessor && !header.approved_assessee) {
                                status = "Menunggu Asesi";
                            } else if (header.approved_assessor && header.approved_assessee) {
                                status = "Tuntas";
                            }
                        }
                        break;
                    case 'IA-02':
                        header = await db.query.resultIa02Header.findFirst({ where: eq(resultIa02HeaderTable.result_id, result.id) });
                        if (header) {
                            if (!header.approved_assessor && !header.approved_assessee) {
                                status = "Butuh Persetujuan";
                            } else if (header.approved_assessor && !header.approved_assessee) {
                                status = "Menunggu Asesi";
                            } else if (header.approved_assessor && header.approved_assessee) {
                                status = "Tuntas";
                            }
                        }
                        break;
                    case 'IA-03':
                        header = await db.query.resultIa03Header.findFirst({ where: eq(resultIa03HeaderTable.result_id, result.id) });
                        if (header) {
                            if (!header.approved_assessor && !header.approved_assessee) {
                                status = "Belum Tuntas";
                            } else if (header.approved_assessor && !header.approved_assessee) {
                                status = "Menunggu Asesi";
                            } else if (header.approved_assessor && header.approved_assessee) {
                                status = "Tuntas";
                            }
                        }
                        break;
                    case 'IA-05':
                        header = await db.query.resultIa05Header.findFirst({ where: eq(resultIa05HeaderTable.result_id, result.id) });
                        if (header) {
                            const ia05Result = await db.query.resultIa05.findFirst({ where: eq(resultIa05.header_id, header.id) });
                            if (!ia05Result) {
                                status = "Menunggu Asesi";
                            } else if (ia05Result && !header.approved_assessor && !header.approved_assessee) {
                                status = "Butuh Persetujuan";
                            } else if (ia05Result && header.approved_assessor && !header.approved_assessee) {
                                status = "Menunggu Asesi";
                            } else if (ia05Result && header.approved_assessor && header.approved_assessee) {
                                status = "Tuntas";
                            }
                        }
                        break;
                    // case 'IA-07':
                    //     header = await db.query.resultIa07Header.findFirst({ where: eq(resultIa07HeaderTable.result_id, result.id) });
                    //     if (header) {
                    //         if (!header.approved_assessor && !header.approved_assessee) {
                    //             status = "Butuh Persetujuan";
                    //         } else if (header.approved_assessor && !header.approved_assessee) {
                    //             status = "Menunggu Asesi";
                    //         } else if (header.approved_assessor && header.approved_assessor) {
                    //             status = "Tuntas";
                    //         }
                    //     }
                    //     break;
                }
            }
            tab.status = status;
        }

        return {
            assessment_id: assessment.id,
            assessment_code: assessment.code,
            tabs: tabs,
        };
    }

    static async adminNavigation(result_id: number) {
        const result = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
        if (!result) throw new NotFoundError('Result');

        const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, result.assessment_id) });
        if (!assessment) throw new NotFoundError('Assessment');

        const doc = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.result_id, result.id) });
        if (!doc) throw new NotFoundError('Result Document');

        const tabs: AdminTab[] = [
            { name: 'APL-01', status: 'Tuntas' },
            { name: 'Data Sertifikasi', status: doc.approved ? 'Tuntas' : 'Belum Tuntas' },
            { name: 'APL-02', status: 'Belum Tuntas' },
            { name: 'AK-01', status: 'Belum Tuntas' },
            { name: 'IA-02', status: 'Belum Tuntas' },
            { name: 'IA-01', status: 'Belum Tuntas' }
        ];
        const isAnyIa03 = await db.query.groupIa03.findFirst({ where: eq(groupIa03Table.assessment_id, result.assessment_id) });
        const isAnyIa05 = await db.query.ia05Question.findFirst({ where: eq(ia05QuestionTable.assessment_id, result.assessment_id) });
        const isAnyIa07 = await db.query.ia07Question.findFirst({ where: eq(ia07QuestionTable.assessment_id, result.assessment_id) });
        if (isAnyIa03) tabs.push({ name: 'IA-03', status: 'Belum Tuntas' });
        if (isAnyIa05) tabs.push({ name: 'IA-05', status: 'Belum Tuntas' });
        if (isAnyIa07) tabs.push({ name: 'IA-07', status: 'Belum Tuntas' });
        tabs.push(
            { name: 'AK-02', status: 'Belum Tuntas' },
            { name: 'AK-03', status: 'Belum Tuntas' },
            { name: 'AK-05', status: 'Belum Tuntas' }
        );

        const headerConfigs = [
            { name: 'APL-02', findFirst: (args: any) => db.query.resultApl02Header.findFirst(args), col: resultApl02HeaderTable, completed: false },
            { name: 'IA-01', findFirst: (args: any) => db.query.resultIa01Header.findFirst(args), col: resultIa01HeaderTable, completed: false },
            { name: 'IA-02', findFirst: (args: any) => db.query.resultIa02Header.findFirst(args), col: resultIa02HeaderTable, completed: false },
            { name: 'IA-03', findFirst: (args: any) => db.query.resultIa03Header.findFirst(args), col: resultIa03HeaderTable, completed: false },
            { name: 'IA-05', findFirst: (args: any) => db.query.resultIa05Header.findFirst(args), col: resultIa05HeaderTable, completed: false },
            { name: 'IA-07', findFirst: (args: any) => db.query.resultIa07Header.findFirst(args), col: resultIa07HeaderTable, completed: false },
            { name: 'AK-01', findFirst: (args: any) => db.query.resultAk01Header.findFirst(args), col: resultAk01HeaderTable, completed: false },
            { name: 'AK-02', findFirst: (args: any) => db.query.resultAk02Header.findFirst(args), col: resultAk02HeaderTable, completed: false },
            { name: 'AK-03', findFirst: (args: any) => db.query.resultAk03Header.findFirst(args), col: resultAk03HeaderTable, completed: false },
            { name: 'AK-05', findFirst: (args: any) => db.query.resultAk05.findFirst(args), col: resultAk05Table, completed: false },
        ];

        for (const config of headerConfigs) {
            let header = await config.findFirst({ where: eq(config.col.result_id, result.id) });
            if (header) {
                if (config.name === 'AK-05') {
                    if ('approved_assessor' in header && header.approved_assessor) config.completed = true;
                } else if (config.name === 'AK-03') {
                    if ('comment' in header && header.comment) config.completed = true;
                } else {
                    if ('approved_assessor' in header && 'approved_assessee' in header && header.approved_assessor && header.approved_assessee) config.completed = true;
                }
            }
        }

        // Update tab status: only 'Belum Tuntas' or 'Tuntas' (AdminTab)
        for (const config of headerConfigs) {
            const tab = tabs.find((tab) => tab.name === config.name);
            if (tab) {
                tab.status = config.completed ? 'Tuntas' : 'Belum Tuntas';
            }
        }

        return {
            assessment_id: assessment.id,
            assessment_code: assessment.code,
            tabs: tabs,
        };
    }

    static async getAssessmentRecapt(schedule_detail_id: number, assessor: AssessorResponse) {
        const scheduleDetail = await db.query.scheduleDetail.findFirst({ where: and(eq(scheduleDetailTable.id, schedule_detail_id), eq(scheduleDetailTable.assessor_id, assessor.id)) });
        if (!scheduleDetail) throw new NotFoundError('Schedule Detail');

        const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(assessmentScheduleTable.id, scheduleDetail.schedule_id) });
        if (!schedule) throw new NotFoundError('Assessment Schedule');

        const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, schedule.assessment_id) });
        if (!assessment) throw new NotFoundError('Assessment');

        const occupation = await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) });
        if (!occupation) throw new NotFoundError('Occupation');

        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) });
        if (!scheme) throw new NotFoundError('Scheme');

        const results = await db.select({
            id: resultTable.id,
            assessment_id: resultTable.assessment_id,
            assessor_id: resultTable.assessor_id,
            assessee_id: resultTable.assessee_id,
            tuk: resultTable.tuk,
            is_competent: resultTable.is_competent,
        }).from(resultTable).where(
            and(
                eq(resultTable.assessment_id, schedule.assessment_id),
                eq(resultTable.assessor_id, assessor.id)
            )
        );

        let assessees: any[] = [];
        let tuk: string = (results.length > 0 && results[0].tuk) ? results[0].tuk : 'sewaktu';
        let summary = {
            total_assessees: 0,
            total_competent: 0,
            total_incompetent: 0,
            total_ongoing: 0,
        }

        const assessorUser = await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) });
        if (!assessorUser) throw new NotFoundError('Assessor User');

        for (const res of results) {
            const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, res.assessee_id) });
            if (!assessee) continue;

            const user = await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) });

            // Ambil semua header terkait
            const [resultAPL02, resultIA01, resultIA02, resultIA03, resultIA05, resultIA07, resultAK01, resultAK02, resultAK03, resultAK05] = await Promise.all([
                db.query.resultApl02Header.findFirst({ where: eq(resultApl02HeaderTable.result_id, res.id) }),
                db.query.resultIa01Header.findFirst({ where: eq(resultIa01HeaderTable.result_id, res.id) }),
                db.query.resultIa02Header.findFirst({ where: eq(resultIa02HeaderTable.result_id, res.id) }),
                db.query.resultIa03Header.findFirst({ where: eq(resultIa03HeaderTable.result_id, res.id) }),
                db.query.resultIa05Header.findFirst({ where: eq(resultIa05HeaderTable.result_id, res.id) }),
                db.query.resultIa07Header.findFirst({ where: eq(resultIa07HeaderTable.result_id, res.id) }),
                db.query.resultAk01Header.findFirst({ where: eq(resultAk01HeaderTable.result_id, res.id) }),
                db.query.resultAk02Header.findFirst({ where: eq(resultAk02HeaderTable.result_id, res.id) }),
                db.query.resultAk03Header.findFirst({ where: eq(resultAk03HeaderTable.result_id, res.id) }),
                db.query.resultAk05.findFirst({ where: eq(resultAk05Table.result_id, res.id) }),
            ]);

            // Penentuan status
            let status: string = "On Going";
            if (resultAPL02 && !resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) status = "Not Competent";
            if (resultIA01 && !resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) status = "Not Competent";
            if (
                (resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee) : true) &&
                (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                (resultAK05 && resultAK05.approved_assessor) &&
                !resultAK05.is_competent && !res.is_competent
            ) status = "Not Competent";
            if (
                (resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee && resultIA05.is_achieved) : true) &&
                (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                (resultAK05 && resultAK05.approved_assessor && resultAK05.is_competent) &&
                res.is_competent
            ) status = "Competent";

            assessees.push({ id: assessee.id, name: user?.full_name, status });

            summary.total_assessees++;
            if (status === 'Competent') summary.total_competent++;
            if (status === 'Not Competent') summary.total_incompetent++;
            if (status === 'On Going') summary.total_ongoing++;
        }

        return {
            assessment: {
                id: assessment.id,
                code: assessment.code,
                tuk: tuk,
                schedule: {
                    id: schedule.id,
                    start_date: schedule.start_date,
                    end_date: schedule.end_date,
                    location: scheduleDetail.location,
                    assessor: {
                        id: assessor.id,
                        full_name: assessorUser.full_name
                    }
                },
                assessees: assessees,
                summary: summary
            }
        };
    }

    static async getAssessmentResultsForAdmin() {
        const schedules = await db.select().from(assessmentScheduleTable).orderBy(desc(assessmentScheduleTable.created_at));
        const result = [];
        const now = new Date();
        for (const schedule of schedules) {
            const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, schedule.assessment_id) });
            if (!assessment) continue;
            const occupation = await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) });
            if (!occupation) continue;
            const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) });

            // Status schedule
            let status = '';
            if (schedule.start_date <= now && schedule.end_date >= now) {
                status = 'Sedang Berjalan';
            } else if (schedule.end_date < now) {
                status = 'Selesai';
            } else {
                status = 'Belum Mulai';
            }

            const details = await db.select().from(scheduleDetailTable).where(eq(scheduleDetailTable.schedule_id, schedule.id));
            const detailList = [];
            for (const detail of details) {
                const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, detail.assessor_id) });
                if (!assessor) continue;
                const user = await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) });
                detailList.push({
                    id: detail.id,
                    location: detail.location,
                    assessor: assessor ? {
                        id: assessor.id,
                        full_name: user?.full_name,
                        phone_no: assessor.phone_no
                    } : null
                });
            }
            result.push({
                id: schedule.id,
                start_date: schedule.start_date,
                end_date: schedule.end_date,
                status,
                assessment: {
                    id: assessment.id,
                    code: assessment.code,
                    occupation: {
                        id: occupation.id,
                        name: occupation.name,
                        scheme: scheme ? {
                            id: scheme.id,
                            code: scheme.code,
                            name: scheme.name
                        } : null
                    }
                },
                schedule_details: detailList
            });
        }
        return result;
    }

    static async getAssesseesByAssessmentAndAssessor(assessment_id: number, assessor_id: number) {
        const results = await db.select({
            id: resultTable.id,
            assessee_id: assesseeTable.id,
            is_competent: resultTable.is_competent,
            full_name: userTable.full_name,
            created_at: resultTable.created_at
        }).from(resultTable)
            .innerJoin(assesseeTable, eq(resultTable.assessee_id, assesseeTable.id))
            .innerJoin(userTable, eq(assesseeTable.user_id, userTable.id))
            .where(and(
                eq(resultTable.assessment_id, assessment_id),
                eq(resultTable.assessor_id, assessor_id)
            ))
            .orderBy(asc(userTable.full_name), asc(resultTable.created_at));

        let finalResults: any[] = [];

        for (const res of results) {
            const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, res.assessee_id) });
            if (!assessee) continue;

            const [resultAPL02, resultIA01, resultIA02, resultIA03, resultIA05, resultIA07, resultAK01, resultAK02, resultAK03, resultAK05] = await Promise.all([
                db.query.resultApl02Header.findFirst({ where: eq(resultApl02HeaderTable.result_id, res.id) }),
                db.query.resultIa01Header.findFirst({ where: eq(resultIa01HeaderTable.result_id, res.id) }),
                db.query.resultIa02Header.findFirst({ where: eq(resultIa02HeaderTable.result_id, res.id) }),
                db.query.resultIa03Header.findFirst({ where: eq(resultIa03HeaderTable.result_id, res.id) }),
                db.query.resultIa05Header.findFirst({ where: eq(resultIa05HeaderTable.result_id, res.id) }),
                db.query.resultIa07Header.findFirst({ where: eq(resultIa07HeaderTable.result_id, res.id) }),
                db.query.resultAk01Header.findFirst({ where: eq(resultAk01HeaderTable.result_id, res.id) }),
                db.query.resultAk02Header.findFirst({ where: eq(resultAk02HeaderTable.result_id, res.id) }),
                db.query.resultAk03Header.findFirst({ where: eq(resultAk03HeaderTable.result_id, res.id) }),
                db.query.resultAk05.findFirst({ where: eq(resultAk05Table.result_id, res.id) }),
            ]);

            let status: string = "Sedang Berjalan";
            if (resultAPL02 && !resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) status = "Belum Kompeten";
            if (resultIA01 && !resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) status = "Belum Kompeten";
            if (
                (resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee) : true) &&
                (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                (resultAK05 && resultAK05.approved_assessor) &&
                !resultAK05.is_competent && !res.is_competent
            ) status = "Belum Kompeten";
            if (
                (resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee && resultIA05.is_achieved) : true) &&
                (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                (resultAK05 && resultAK05.approved_assessor && resultAK05.is_competent) &&
                res.is_competent
            ) status = "Kompeten";

            finalResults.push({
                id: res.id,
                assessee_id: res.assessee_id,
                full_name: res.full_name,
                status: status,
                created_at: res.created_at,
            });
        }

        return finalResults;
    }

    static async generateRecaptPDF(assessment: any) {
        const schedule = assessment.schedule;

        // Format date
        const start = new Date(schedule.start_date);
        const end = new Date(schedule.end_date);

        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        const startDay = days[start.getDay()];
        const startDate = start.getDate();
        const startMonth = months[start.getMonth()];
        const startYear = start.getFullYear();

        const startHour = (`0${start.getHours()}`).slice(-2);
        const startMinute = (`0${start.getMinutes()}`).slice(-2);
        const endHour = (`0${end.getHours()}`).slice(-2);
        const endMinute = (`0${end.getMinutes()}`).slice(-2);

        // === Create a new PDF document ===
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([612, 936]);

        // === Fonts ===
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const iconFont = await pdfDoc.embedFont(StandardFonts.ZapfDingbats);

        let y = page.getHeight() - 50;
        const fontSizeSmall = 11;

        const lineGap = 4;
        const lLineGap = 12;
        const xlLineGap = 20;

        // === TITLE ===
        const headerText = [
            "BERITA ACARA",
            "HASIL REKOMENDASI PENILAIAN",
            "UJI KOMPETENSI KEAHLIAN",
        ];
        headerText.forEach(text => {
            y = drawParagraph(page, text, 40, y, fontBold, fontSizeSmall, "center");
        });

        // === INTRODUCTION PARAGRAPH ===
        const textParts = [
            { text: "Pada hari ini ", font },
            { text: `${startDay}, `, font: fontBold },
            { text: "tanggal ", font },
            { text: `${startDate} `, font: fontBold },
            { text: "bulan ", font },
            { text: `${startMonth} `, font: fontBold },
            { text: "tahun ", font },
            { text: `${startYear}, `, font: fontBold },
            { text: "jam ", font },
            { text: `${startHour}:${startMinute} `, font: fontBold },
            { text: "sampai dengan jam ", font },
            { text: `${endHour}:${endMinute}, `, font: fontBold },
            { text: "bertempat TUK ", font },
            { text: `${assessment.tuk}, `, font: fontBold },
            { text: "ruang ", font },
            { text: `${assessment.schedule.location}, `, font: fontBold },
            { text: "telah dilaksanakan pemberian rekomendasi penilaian terhadap peserta yang namanya tercantum dibawah ini:", font }
        ];
        y = drawMixedParagraph(page, textParts, 40, y - lLineGap, 12, rgb(0, 0, 0), 540, 18);
        y -= xlLineGap;

        // === TABLE CONTENT ===
        const tableData = (assessment.assessees as { name: string; status: string }[]).map(
            (assessee, index) => ({
                no: index + 1,
                name: assessee.name,
                k: assessee.status === "Competent" ? "✓" : "",
                bk: assessee.status === "Not Competent" ? "✓" : "",
            })
        );

        const tableTop = y + 7;
        const rowHeight = 25;
        const colWidths: any = [30, 260, 110, 110];
        const headerColor = rgb(1, 0.95, 0.7);

        // === TABLE HEADER ===
        let x = 50;

        // Column No
        page.drawRectangle({
            x, y: tableTop - rowHeight * 2,
            width: colWidths[0], height: rowHeight * 3 - 11,
            color: headerColor, borderColor: rgb(0, 0, 0), borderWidth: 1
        });
        page.drawText("No", { x: x + 8, y: tableTop - rowHeight + 2, size: fontSizeSmall, font: fontBold });
        x += colWidths[0];

        // Column Name
        page.drawRectangle({
            x, y: tableTop - rowHeight * 2,
            width: colWidths[1], height: rowHeight * 3 - 11,
            color: headerColor, borderColor: rgb(0, 0, 0), borderWidth: 1
        });
        page.drawText("Nama Peserta", { x: x + colWidths[1] / 2 - 40, y: tableTop - rowHeight + 2, size: fontSizeSmall, font: fontBold });
        x += colWidths[1];

        // Kolom Rekomendasi (gabungan K & BK)
        page.drawRectangle({
            x, y: tableTop - rowHeight * 2 + 11,
            width: colWidths[2] + colWidths[3],
            height: rowHeight * 3 - 22,
            color: headerColor, borderColor: rgb(0, 0, 0), borderWidth: 1
        });
        page.drawText("REKOMENDASI", { x: x + (colWidths[2] + colWidths[3]) / 2 - 45, y: tableTop - 5, size: fontSizeSmall, font: fontBold });
        page.drawText("ASISTEN PEMROGRAMAN JUNIOR", { x: x + 15, y: tableTop - rowHeight + 7, size: fontSizeSmall, font: fontBold });
        // Subkolom K
        page.drawRectangle({
            x, y: tableTop - rowHeight * 2,
            width: colWidths[2],
            height: rowHeight,
            color: headerColor,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1
        });
        page.drawText("K", { x: x + colWidths[2] / 2 - 2, y: tableTop - rowHeight * 2 + 7, size: fontSizeSmall, font: fontBold });
        // Subkolom BK
        page.drawRectangle({
            x: x + colWidths[2],
            y: tableTop - rowHeight * 2,
            width: colWidths[3],
            height: rowHeight,
            color: headerColor,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1
        });
        page.drawText("BK", { x: x + colWidths[2] + colWidths[3] / 2 - 6, y: tableTop - rowHeight * 2 + 7, size: fontSizeSmall, font: fontBold });

        // === TABLE CONTENT ===
        let currentY = tableTop - rowHeight * 3;

        for (let i = 0; i < 4; i++) {
            tableData.forEach(row => {
                let x = 50;
                page.drawRectangle({ x, y: currentY, width: colWidths[0], height: rowHeight, borderColor: rgb(0, 0, 0), borderWidth: 1 });
                page.drawText(String(row.no), { x: x + 8, y: currentY + 7, size: fontSizeSmall, font });
                x += colWidths[0];

                page.drawRectangle({ x, y: currentY, width: colWidths[1], height: rowHeight, borderColor: rgb(0, 0, 0), borderWidth: 1 });
                page.drawText(row.name, { x: x + 5, y: currentY + 7, size: fontSizeSmall, font });
                x += colWidths[1];

                page.drawRectangle({ x, y: currentY, width: colWidths[2], height: rowHeight, borderColor: rgb(0, 0, 0), borderWidth: 1 });
                page.drawText(row.k, { x: x + colWidths[2] / 2 - 2, y: currentY + 7, size: fontSizeSmall, font: iconFont });
                x += colWidths[2];

                page.drawRectangle({ x, y: currentY, width: colWidths[3], height: rowHeight, borderColor: rgb(0, 0, 0), borderWidth: 1 });
                page.drawText(row.bk, { x: x + colWidths[3] / 2 - 2, y: currentY + 7, size: fontSizeSmall, font: iconFont });

                currentY -= rowHeight;
            });
        }
        y = currentY;

        // === NOTE ===
        drawParagraph(page, "Selama pelaksanaan rekomendasi telah terjadi hal penting sebagai berikut :", 50, y, font, fontSizeSmall);

        const boxSize = 12;
        const boxX = 50;
        let boxY = y - boxSize * 2 + 10 - 6;

        page.drawRectangle({ x: boxX, y: boxY - boxSize + 10, width: boxSize, height: boxSize, borderColor: rgb(0, 0, 0), borderWidth: 1, color: rgb(1, 1, 1) });
        drawParagraph(page, "Tertib dan lancar dengan", boxX + boxSize + 5, boxY, font, fontSizeSmall);
        boxY -= lineGap;
        page.drawRectangle({ x: boxX, y: boxY - boxSize * 2 + 10, width: boxSize, height: boxSize, borderColor: rgb(0, 0, 0), borderWidth: 1, color: rgb(1, 1, 1) });
        drawParagraph(page, "Tertib dan lancar dengan", boxX + boxSize + 5, boxY - boxSize, font, fontSizeSmall);
        boxY -= lineGap;
        drawParagraph(page, "catatan : ...........................................................................................................................................", boxX + boxSize + 5, boxY - boxSize * 2, font, fontSizeSmall);
        drawParagraph(page, "................................................................................................................................................................", 50, boxY - boxSize * 3, font, fontSizeSmall);

        y = boxY - boxSize * 4;
        drawParagraph(page, "Demikianlah, berita acara ini dibuat sesuai dengan kejadian yang sebenernya, untuk digunakan sebagaimana mestinya.", 50, y, font, fontSizeSmall);

        // === SIGNATURE ===
        const signatureX = 50;
        let signatureY = y - 50;
        const signatureWidth = 60;

        const signatureDate = `Jakarta, ${startDate + " " + startMonth + " " + startYear}`;
        const assessor_name = assessment.schedule.assessor.full_name;
        drawParagraph(page, `${signatureDate}`, signatureX, signatureY, font, fontSizeSmall, "right");
        drawParagraph(page, `${assessor_name}`, signatureX, signatureY - 15, font, fontSizeSmall, "right");
        signatureY -= 20;

        const signatureNameLength = font.widthOfTextAtSize(assessor_name, fontSizeSmall);

        const qrData = getAssessorUrl(assessment.schedule.assessor.id);
        const qrCode = await embedQrCode(pdfDoc, qrData);
        page.drawImage(qrCode,
            { x: page.getWidth() - signatureWidth * 2 - (signatureNameLength / 2) + (signatureWidth / 2) + 9, y: signatureY - signatureWidth, width: signatureWidth, height: signatureWidth }
        );

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    }
}