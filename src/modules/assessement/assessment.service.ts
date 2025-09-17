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
} from "../../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { AssessmentDetailsResponse, AssessmentRequest, AssessmentResponse, AssessorTab } from "./assessment.type";
import { Result } from "drizzle-orm/sqlite-core";

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

        const doc = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.result_id, result[0].id) });
        if (!doc) throw new NotFoundError('Result Document');
        const apl02Header = await db.query.resultApl02Header.findFirst({ where: eq(resultApl02HeaderTable.result_id, result[0].id) });
        if (!apl02Header) throw new NotFoundError('Result APL02 Header');

        const tabs = ['APL-01', 'Data Sertifikasi', 'APL-02', 'AK-04', 'AK-01']

        const isAnyIa01 = await db.query.groupIa01.findFirst({ where: eq(groupIa01Table.assessment_id, assessment_id) });
        const isAnyIa02 = await db.query.ia02Pdf.findFirst({ where: eq(ia02PdfTable.assessment_id, assessment_id) });
        const isAnyIa03 = await db.query.groupIa03.findFirst({ where: eq(groupIa03Table.assessment_id, assessment_id) });
        const isAnyIa05 = await db.query.ia05Question.findFirst({ where: eq(ia05QuestionTable.assessment_id, assessment_id) });
        const isAnyIa07 = await db.query.ia07Question.findFirst({ where: eq(ia07QuestionTable.assessment_id, assessment_id) });

        if (isAnyIa01) tabs.push('IA-01');
        if (isAnyIa02) tabs.push('IA-02');
        if (isAnyIa03) tabs.push('IA-03');
        if (isAnyIa05) tabs.push('IA-05');
        if (isAnyIa07) tabs.push('IA-07');

        tabs.push('AK-02', 'AK-03', 'AK-05');

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
            { name: 'APL-02', status: "Not Started" },
            { name: 'AK-01', status: "Not Started" },
            { name: 'IA-01', status: "Not Started" },
            { name: 'IA-02', status: "Not Started" }
        ]

        const isAnyIa03 = await db.query.groupIa03.findFirst({ where: eq(groupIa03Table.assessment_id, assessment_id) });
        const isAnyIa05 = await db.query.ia05Question.findFirst({ where: eq(ia05QuestionTable.assessment_id, assessment_id) });
        const isAnyIa07 = await db.query.ia07Question.findFirst({ where: eq(ia07QuestionTable.assessment_id, assessment_id) });

        if (isAnyIa03) tabs.push({ name: 'IA-03', status: "Not Started" });
        if (isAnyIa05) tabs.push({ name: 'IA-05', status: "Not Started" });
        if (isAnyIa07) tabs.push({ name: 'IA-07', status: "Not Started" });

        tabs.push(
            { name: 'AK-02', status: "Not Started" },
            { name: 'AK-03', status: "Not Started" },
            { name: 'AK-05', status: "Not Started" }
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


        // Config header dan tab
        const headerConfigs = [
            { name: 'APL-02', findFirst: (args: any) => db.query.resultApl02Header.findFirst(args), col: resultApl02HeaderTable, notYet: 0, waiting: 0 },
            { name: 'IA-01', findFirst: (args: any) => db.query.resultIa01Header.findFirst(args), col: resultIa01HeaderTable, notYet: 0, waiting: 0 },
            { name: 'IA-02', findFirst: (args: any) => db.query.resultIa02Header.findFirst(args), col: resultIa02HeaderTable, notYet: 0, waiting: 0 },
            { name: 'IA-03', findFirst: (args: any) => db.query.resultIa03Header.findFirst(args), col: resultIa03HeaderTable, notYet: 0, waiting: 0, isSpecial: true },
            { name: 'IA-05', findFirst: (args: any) => db.query.resultIa05Header.findFirst(args), col: resultIa05HeaderTable, notYet: 0, waiting: 0 },
            { name: 'IA-07', findFirst: (args: any) => db.query.resultIa07Header.findFirst(args), col: resultIa07HeaderTable, notYet: 0, waiting: 0 },
            { name: 'AK-01', findFirst: (args: any) => db.query.resultAk01Header.findFirst(args), col: resultAk01HeaderTable, notYet: 0, waiting: 0 },
            { name: 'AK-02', findFirst: (args: any) => db.query.resultAk02Header.findFirst(args), col: resultAk02HeaderTable, notYet: 0, waiting: 0 },
            { name: 'AK-03', findFirst: (args: any) => db.query.resultAk03Header.findFirst(args), col: resultAk03HeaderTable, notYet: 0, waiting: 0, isSpecial: true },
            { name: 'AK-05', findFirst: (args: any) => db.query.resultAk05.findFirst(args), col: resultAk05Table, notYet: 0, waiting: 0, onlyApproved: true },
        ];

        for (const result of results) {
            for (const config of headerConfigs) {
                let header = await config.findFirst({ where: eq(config.col.result_id, result.id) });
                if (config.name === 'AK-03') {
                    if (!header) config.notYet++;
                } else if (config.name === 'AK-05') {
                    if (header && 'approved_assessor' in header && !header.approved_assessor) config.notYet++;
                } else {
                    if (header) {
                        if ('approved_assessor' in header && !header.approved_assessor) config.notYet++;
                        if ('approved_assessor' in header && 'approved_assessee' in header && header.approved_assessor && !header.approved_assessee) config.waiting++;
                    }
                }
            }
        }

        // Update status tab
        for (const config of headerConfigs) {
            const tab = tabs.find((tab) => tab.name === config.name);
            if (tab) {
                tab.status = (config.notYet > 0)
                    ? 'Not Started'
                    : (config.notYet === 0 && config.waiting > 0)
                        ? 'Waiting'
                        : 'Completed';
            }
        }

        return {
            assessment_id: assessment.id,
            assessment_code: assessment.code,
            tabs: tabs,
        };
    }

    static async getAssessmentRecapt(schedule_id: number) {
        const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(assessmentScheduleTable.id, schedule_id) });
        if (!schedule) throw new NotFoundError('Assessment Schedule');
        
        const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, schedule.assessment_id) });
        if (!assessment) throw new NotFoundError('Assessment');
    
        const occupation = await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) });
        if (!occupation) throw new NotFoundError('Occupation');
        
        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) });
        if (!scheme) throw new NotFoundError('Scheme');
    
        const scheduleDetail = await db.query.scheduleDetail.findFirst({ where: eq(scheduleDetailTable.schedule_id, schedule_id) });
        if (!scheduleDetail) throw new NotFoundError('Schedule Detail');
    
        let assessor: any = null;
        if(scheduleDetail) {
            assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, scheduleDetail.assessor_id) });
            if (!assessor) throw new NotFoundError('Assessor');
        }
    
        const results = await db.select({
            id: resultTable.id,
            assessment_id: resultTable.assessment_id,
            assessor_id: resultTable.assessor_id,
            assessee_id: resultTable.assessee_id,
            tuk: resultTable.tuk,
            is_competent: resultTable.is_competent,
        }).from(resultTable).where(eq(resultTable.assessment_id, schedule.assessment_id));
    
        let assessees: any[] = [];
        let tuk: string | null = results[0].tuk ?? null;
        let summary = {
            total_assessees: 0,
            total_competent: 0,
            total_incompetent: 0,
            total_ongoing: 0,
        }
    
        for (const res of results) {
            const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, res.assessee_id) });
            if (!assessee) continue;
    
            const user = await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) });
    
            // Ambil semua header terkait
            const [apl02, ia01, ia02, ia03, ia05, ia07, ak01, ak02, ak03, ak04, ak05] = await Promise.all([
                db.query.resultApl02Header.findFirst({ where: eq(resultApl02HeaderTable.result_id, res.id) }),
                db.query.resultIa01Header.findFirst({ where: eq(resultIa01HeaderTable.result_id, res.id) }),
                db.query.resultIa02Header.findFirst({ where: eq(resultIa02HeaderTable.result_id, res.id) }),
                db.query.resultIa03Header.findFirst({ where: eq(resultIa03HeaderTable.result_id, res.id) }),
                db.query.resultIa05Header.findFirst({ where: eq(resultIa05HeaderTable.result_id, res.id) }),
                db.query.resultIa07Header.findFirst({ where: eq(resultIa07HeaderTable.result_id, res.id) }),
                db.query.resultAk01Header.findFirst({ where: eq(resultAk01HeaderTable.result_id, res.id) }),
                db.query.resultAk02Header.findFirst({ where: eq(resultAk02HeaderTable.result_id, res.id) }),
                db.query.resultAk03Header.findFirst({ where: eq(resultAk03HeaderTable.result_id, res.id) }),
                db.query.resultAk04.findFirst({ where: eq(resultAk04Table.result_id, res.id) }),
                db.query.resultAk05.findFirst({ where: eq(resultAk05Table.result_id, res.id) }),
            ]);
    
            // Tentukan status
            const headers = [apl02, ia01, ia02, ia03, ia05, ia07, ak01, ak02, ak03, ak04, ak05];
            const anyHeaderMissing = headers.some(header => header === null || header === undefined);
    
            let status: string;
            if (anyHeaderMissing) {
                status = "On Going";
            } else {
                status = res.is_competent ? "Competent" : "Not Competent";
            }
    
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
                        full_name: assessor.full_name
                    }
                },
                assessees: assessees,
                summary: summary
            }
        }
    }
}