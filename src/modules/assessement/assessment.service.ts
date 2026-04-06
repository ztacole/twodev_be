import type { AssessmentResultGrouped, UpdateAssessmentRequest } from './assessment.type';
import { DuplicateEntryError, NotFoundError } from "../../common/error";
import { db } from "../../config/drizzle";
import {
    user as userTable,
    assessment as assessmentTable,
    occupation as occupationTable,
    scheme as schemeTable,
    assessmentSchedule as assessmentScheduleTable,
    assessmentReport as assessmentReportTable,
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
    approvalRequest,
} from "../../../drizzle/schema";
import { eq, and, desc, asc, is, sql, max } from "drizzle-orm";
import { AdminTab, AssesseeTab, AssessmentDetailsResponse, AssessmentRequest, AssessmentResponse, AssessorTab } from "./assessment.type";
import { AssessorResponse } from "../assessor/assessor.type";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { embedQrCode, kopSurat } from "../../helper/pdfAssets.helper";
import { drawParagraph, drawMixedParagraph, loadAndEmbedImage } from "../../helper/pdfDraw.helper";
import { getAssessorUrl } from "../../helper/hashids";
import { createNewPage, drawCellText, drawSignatureOrQR, drawTable } from './result-pdf/helper';
import { formatDate, formatDay } from '../../helper/date.helper';

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
            where: eq(occupationTable.id, data.occupation_id)
        });

        if (!existingOccupation) new NotFoundError("Occupation");

        return await db.transaction(async (tx) => {
            // Create assessment
            const [assessment] = await tx.insert(assessmentTable).values({
                occupation_id: data.occupation_id,
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

    static async updateAssessment(id: number, data: UpdateAssessmentRequest) {
        // Validate before transaction
        const existingAssessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, id) });
        if (!existingAssessment) throw new NotFoundError('Assessment');

        const occupation = await db.query.occupation.findFirst({
            where: eq(occupationTable.id, data.occupation_id)
        });
        if (!occupation) throw new NotFoundError('Occupation');

        // Perform all updates in a transaction
        return await db.transaction(async (tx) => {
            // 1. Update assessment utama
            await tx.update(assessmentTable).set({
                code: data.code,
                occupation_id: occupation.id
            }).where(eq(assessmentTable.id, id));

            // === UCAPL02 ===
            const oldUCs = await tx.select().from(ucApl02Table).where(eq(ucApl02Table.assessment_id, id));
            const oldUCIds = new Set(oldUCs.map(u => u.id));
            const newUCIds = new Set((data.uc_apl02s || []).filter(u => u.id).map(u => u.id));

            for (const old of oldUCs) {
                if (!newUCIds.has(old.id)) {
                    const elements = await tx.select().from(elementApl02Table).where(eq(elementApl02Table.uc_id, old.id));
                    for (const el of elements) {
                        await tx.delete(elementDetailsApl02Table).where(eq(elementDetailsApl02Table.element_id, el.id));
                    }
                    await tx.delete(elementApl02Table).where(eq(elementApl02Table.uc_id, old.id));
                    await tx.delete(ucApl02Table).where(eq(ucApl02Table.id, old.id));
                }
            }

            for (const uc of data.uc_apl02s || []) {
                let ucId = uc.id;
                if (uc.id) {
                    await tx.update(ucApl02Table).set({
                        unit_code: uc.unit_code,
                        title: uc.title
                    }).where(eq(ucApl02Table.id, uc.id));
                } else {
                    const [ucRow] = await tx.insert(ucApl02Table).values({
                        assessment_id: id,
                        unit_code: uc.unit_code,
                        title: uc.title
                    }).$returningId();
                    ucId = ucRow.id;
                }

                const oldEls = await tx.select().from(elementApl02Table).where(eq(elementApl02Table.uc_id, ucId!));
                const newElIds = new Set((uc.elements || []).filter(e => e.id).map(e => e.id));
                for (const old of oldEls) {
                    if (!newElIds.has(old.id)) {
                        await tx.delete(elementDetailsApl02Table).where(eq(elementDetailsApl02Table.element_id, old.id));
                        await tx.delete(elementApl02Table).where(eq(elementApl02Table.id, old.id));
                    }
                }

                for (const el of uc.elements || []) {
                    let elId = el.id;
                    if (el.id) {
                        await tx.update(elementApl02Table).set({
                            title: el.title
                        }).where(eq(elementApl02Table.id, el.id));
                    } else {
                        const [elRow] = await tx.insert(elementApl02Table).values({
                            uc_id: ucId!,
                            title: el.title
                        }).$returningId();
                        elId = elRow.id;
                    }

                    const oldDets = await tx.select().from(elementDetailsApl02Table).where(eq(elementDetailsApl02Table.element_id, elId!));
                    const newDetIds = new Set((el.details || []).filter(d => d.id).map(d => d.id));
                    for (const old of oldDets) {
                        if (!newDetIds.has(old.id)) {
                            await tx.delete(elementDetailsApl02Table).where(eq(elementDetailsApl02Table.id, old.id));
                        }
                    }

                    for (const det of el.details || []) {
                        if (det.id) {
                            await tx.update(elementDetailsApl02Table).set({
                                description: det.description
                            }).where(eq(elementDetailsApl02Table.id, det.id));
                        } else {
                            await tx.insert(elementDetailsApl02Table).values({
                                element_id: elId!,
                                description: det.description
                            }).execute();
                        }
                    }
                }
            }

            // === GROUP IA01 ===
            const oldGroupsIa01 = await tx.select().from(groupIa01Table).where(eq(groupIa01Table.assessment_id, id));
            const newGroupsIa01Ids = new Set((data.groups_ia01 || []).filter(g => g.id).map(g => g.id));
            for (const old of oldGroupsIa01) {
                if (!newGroupsIa01Ids.has(old.id)) {
                    const units = await tx.select().from(ucIa01Table).where(eq(ucIa01Table.group_id, old.id));
                    for (const unit of units) {
                        const elements = await tx.select().from(elementIaTable).where(eq(elementIaTable.uc_id, unit.id));
                        for (const el of elements) {
                            await tx.delete(elementDetailsIaTable).where(eq(elementDetailsIaTable.element_id, el.id));
                        }
                        await tx.delete(elementIaTable).where(eq(elementIaTable.uc_id, unit.id));
                        await tx.delete(ucIa01Table).where(eq(ucIa01Table.id, unit.id));
                    }
                    await tx.delete(groupIa01Table).where(eq(groupIa01Table.id, old.id));
                }
            }

            for (const group of data.groups_ia01 || []) {
                let groupId = group.id;
                if (group.id) {
                    await tx.update(groupIa01Table).set({ name: group.name }).where(eq(groupIa01Table.id, group.id));
                } else {
                    const [groupRow] = await tx.insert(groupIa01Table).values({ assessment_id: id, name: group.name }).$returningId();
                    groupId = groupRow.id;
                }
                if (!groupId) continue;

                const oldUnits = await tx.select().from(ucIa01Table).where(eq(ucIa01Table.group_id, groupId));
                const newUnitIds = new Set((group.units || []).filter(u => u.id).map(u => u.id));
                for (const old of oldUnits) {
                    if (!newUnitIds.has(old.id)) {
                        const elements = await tx.select().from(elementIaTable).where(eq(elementIaTable.uc_id, old.id));
                        for (const el of elements) {
                            await tx.delete(elementDetailsIaTable).where(eq(elementDetailsIaTable.element_id, el.id));
                        }
                        await tx.delete(elementIaTable).where(eq(elementIaTable.uc_id, old.id));
                        await tx.delete(ucIa01Table).where(eq(ucIa01Table.id, old.id));
                    }
                }

                for (const unit of group.units || []) {
                    let unitId = unit.id;
                    if (unit.id) {
                        await tx.update(ucIa01Table).set({ unit_code: unit.unit_code, title: unit.title }).where(eq(ucIa01Table.id, unit.id));
                    } else {
                        if (!groupId) continue;
                        const [unitRow] = await tx.insert(ucIa01Table).values({ group_id: groupId, unit_code: unit.unit_code, title: unit.title }).$returningId();
                        unitId = unitRow.id;
                    }
                    if (!unitId) continue;

                    const oldEls = await tx.select().from(elementIaTable).where(eq(elementIaTable.uc_id, unitId));
                    const newElIds = new Set((unit.elements || []).filter(e => e.id).map(e => e.id));
                    for (const old of oldEls) {
                        if (!newElIds.has(old.id)) {
                            await tx.delete(elementDetailsIaTable).where(eq(elementDetailsIaTable.element_id, old.id));
                            await tx.delete(elementIaTable).where(eq(elementIaTable.id, old.id));
                        }
                    }

                    for (const el of unit.elements || []) {
                        let elId = el.id;
                        if (el.id) {
                            await tx.update(elementIaTable).set({ title: el.title }).where(eq(elementIaTable.id, el.id));
                        } else {
                            if (!unitId) continue;
                            const [elRow] = await tx.insert(elementIaTable).values({ uc_id: unitId, title: el.title }).$returningId();
                            elId = elRow.id;
                        }
                        if (!elId) continue;

                        const oldDets = await tx.select().from(elementDetailsIaTable).where(eq(elementDetailsIaTable.element_id, elId));
                        const newDetIds = new Set((el.details || []).filter(d => d.id).map(d => d.id));
                        for (const old of oldDets) {
                            if (!newDetIds.has(old.id)) {
                                await tx.delete(elementDetailsIaTable).where(eq(elementDetailsIaTable.id, old.id));
                            }
                        }

                        for (const det of el.details || []) {
                            if (det.id) {
                                await tx.update(elementDetailsIaTable).set({ description: det.description, benchmark: det.benchmark }).where(eq(elementDetailsIaTable.id, det.id));
                            } else {
                                if (!elId) continue;
                                await tx.insert(elementDetailsIaTable).values({ element_id: elId, description: det.description, benchmark: det.benchmark }).execute();
                            }
                        }
                    }
                }
            }

            // === GROUP IA02 ===
            const oldGroupsIa02 = await tx.select().from(groupIa02Table).where(eq(groupIa02Table.assessment_id, id));
            const newGroupsIa02Ids = new Set((data.groups_ia02 || []).filter(g => g.id).map(g => g.id));
            for (const old of oldGroupsIa02) {
                if (!newGroupsIa02Ids.has(old.id)) {
                    await tx.delete(ucIa02Table).where(eq(ucIa02Table.group_id, old.id));
                    await tx.delete(ia02ToolTable).where(eq(ia02ToolTable.group_id, old.id));
                    await tx.delete(groupIa02Table).where(eq(groupIa02Table.id, old.id));
                }
            }

            for (const group of data.groups_ia02 || []) {
                let groupId = group.id;
                if (group.id) {
                    await tx.update(groupIa02Table).set({ name: group.name, scenario: group.scenario, duration: group.duration }).where(eq(groupIa02Table.id, group.id));
                } else {
                    const [groupRow] = await tx.insert(groupIa02Table).values({ assessment_id: id, name: group.name, scenario: group.scenario, duration: group.duration }).$returningId();
                    groupId = groupRow.id;
                }
                if (!groupId) continue;

                const oldUnits = await tx.select().from(ucIa02Table).where(eq(ucIa02Table.group_id, groupId));
                const newUnitIds = new Set((group.units || []).filter(u => u.id).map(u => u.id));
                for (const old of oldUnits) {
                    if (!newUnitIds.has(old.id)) {
                        await tx.delete(ucIa02Table).where(eq(ucIa02Table.id, old.id));
                    }
                }

                for (const unit of group.units || []) {
                    if (unit.id) {
                        await tx.update(ucIa02Table).set({ unit_code: unit.unit_code, title: unit.title }).where(eq(ucIa02Table.id, unit.id));
                    } else {
                        if (!groupId) continue;
                        await tx.insert(ucIa02Table).values({ group_id: groupId, unit_code: unit.unit_code, title: unit.title });
                    }
                }

                const oldTools = await tx.select().from(ia02ToolTable).where(eq(ia02ToolTable.group_id, groupId));
                const newToolIds = new Set((group.tools || []).filter(t => t.id).map(t => t.id));
                for (const old of oldTools) {
                    if (!newToolIds.has(old.id)) {
                        await tx.delete(ia02ToolTable).where(eq(ia02ToolTable.id, old.id));
                    }
                }

                for (const tool of group.tools || []) {
                    if (tool.id) {
                        await tx.update(ia02ToolTable).set({ name: tool.name }).where(eq(ia02ToolTable.id, tool.id));
                    } else {
                        if (!groupId) continue;
                        await tx.insert(ia02ToolTable).values({ group_id: groupId, name: tool.name });
                    }
                }
            }

            // === GROUP IA03 ===
            const oldGroupsIa03 = await tx.select().from(groupIa03Table).where(eq(groupIa03Table.assessment_id, id));
            const newGroupsIa03Ids = new Set((data.groups_ia03 || []).filter(g => g.id).map(g => g.id));
            for (const old of oldGroupsIa03) {
                if (!newGroupsIa03Ids.has(old.id)) {
                    await tx.delete(ucIa03Table).where(eq(ucIa03Table.group_id, old.id));
                    await tx.delete(ia03QuestionTable).where(eq(ia03QuestionTable.group_id, old.id));
                    await tx.delete(groupIa03Table).where(eq(groupIa03Table.id, old.id));
                }
            }

            for (const group of data.groups_ia03 || []) {
                let groupId = group.id;
                if (group.id) {
                    await tx.update(groupIa03Table).set({ name: group.name }).where(eq(groupIa03Table.id, group.id));
                } else {
                    const [groupRow] = await tx.insert(groupIa03Table).values({ assessment_id: id, name: group.name }).$returningId();
                    groupId = groupRow.id;
                }
                if (!groupId) continue;

                const oldUnits = await tx.select().from(ucIa03Table).where(eq(ucIa03Table.group_id, groupId));
                const newUnitIds = new Set((group.units || []).filter(u => u.id).map(u => u.id));
                for (const old of oldUnits) {
                    if (!newUnitIds.has(old.id)) {
                        await tx.delete(ucIa03Table).where(eq(ucIa03Table.id, old.id));
                    }
                }

                for (const unit of group.units || []) {
                    if (unit.id) {
                        await tx.update(ucIa03Table).set({ unit_code: unit.unit_code, title: unit.title }).where(eq(ucIa03Table.id, unit.id));
                    } else {
                        if (!groupId) continue;
                        await tx.insert(ucIa03Table).values({ group_id: groupId, unit_code: unit.unit_code, title: unit.title });
                    }
                }

                const oldQas = await tx.select().from(ia03QuestionTable).where(eq(ia03QuestionTable.group_id, groupId));
                const newQaIds = new Set((group.qa_ia03 || []).filter(q => q.id).map(q => q.id));
                for (const old of oldQas) {
                    if (!newQaIds.has(old.id)) {
                        await tx.delete(ia03QuestionTable).where(eq(ia03QuestionTable.id, old.id));
                    }
                }

                for (const qa of group.qa_ia03 || []) {
                    if (qa.id) {
                        await tx.update(ia03QuestionTable).set({ question: qa.question }).where(eq(ia03QuestionTable.id, qa.id));
                    } else {
                        if (!groupId) continue;
                        await tx.insert(ia03QuestionTable).values({ group_id: groupId, question: qa.question });
                    }
                }
            }

            // === IA05 ===
            if (data.ia05_questions) {
                const oldQ5s = await tx.select().from(ia05QuestionTable).where(eq(ia05QuestionTable.assessment_id, id));
                const newQ5Ids = new Set((data.ia05_questions || []).filter(q => q.id).map(q => q.id));
                for (const old of oldQ5s) {
                    if (!newQ5Ids.has(old.id)) {
                        await tx.delete(questionOptionTable).where(eq(questionOptionTable.question_id, old.id));
                        await tx.delete(ia05QuestionTable).where(eq(ia05QuestionTable.id, old.id));
                    }
                }

                for (const q of data.ia05_questions || []) {
                    let qId = q.id;
                    if (q.id) {
                        await tx.update(ia05QuestionTable).set({ order: q.order, question: q.question }).where(eq(ia05QuestionTable.id, q.id));
                    } else {
                        const [qRow] = await tx.insert(ia05QuestionTable).values({ assessment_id: id, order: q.order, question: q.question }).$returningId();
                        qId = qRow.id;
                    }
                    if (!qId) continue;

                    const oldOpts = await tx.select().from(questionOptionTable).where(eq(questionOptionTable.question_id, qId));
                    const newOptIds = new Set((q.options || []).filter(o => o.id).map(o => o.id));
                    for (const old of oldOpts) {
                        if (!newOptIds.has(old.id)) {
                            await tx.delete(questionOptionTable).where(eq(questionOptionTable.id, old.id));
                        }
                    }

                    for (const opt of q.options || []) {
                        if (opt.id) {
                            await tx.update(questionOptionTable).set({ option: opt.option, is_answer: opt.is_answer }).where(eq(questionOptionTable.id, opt.id));
                        } else {
                            if (!qId) continue;
                            await tx.insert(questionOptionTable).values({ question_id: qId, option: opt.option, is_answer: opt.is_answer }).execute();
                        }
                    }
                }
            }

            // === IA07 ===
            if (data.ia07_questions) {
                const oldQ7s = await tx.select().from(ia07QuestionTable).where(eq(ia07QuestionTable.assessment_id, id));
                const newQ7Ids = new Set((data.ia07_questions || []).filter(q => q.id).map(q => q.id));
                for (const old of oldQ7s) {
                    if (!newQ7Ids.has(old.id)) {
                        await tx.delete(ia07QuestionTable).where(eq(ia07QuestionTable.id, old.id));
                    }
                }

                for (const q of data.ia07_questions || []) {
                    if (q.id) {
                        await tx.update(ia07QuestionTable).set({ question: q.question, answer_key: q.answer_key }).where(eq(ia07QuestionTable.id, q.id));
                    } else {
                        await tx.insert(ia07QuestionTable).values({ assessment_id: id, question: q.question, answer_key: q.answer_key }).execute();
                    }
                }
            }

            return { id: id };
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
        if (!assessment) throw new NotFoundError('Assessment');

        // Get occupation and scheme
        const [occupation] = await db
            .select({
                id: occupationTable.id,
                name: occupationTable.name,
                scheme_id: occupationTable.scheme_id,
                created_at: occupationTable.created_at,
                updated_at: occupationTable.updated_at,
                scheme: schemeTable
            })
            .from(occupationTable)
            .innerJoin(schemeTable, eq(schemeTable.id, occupationTable.scheme_id))
            .where(eq(occupationTable.id, assessment.occupation_id));

        // === UCAPL02 ===
        const ucApl02sRaw = await db.select().from(ucApl02Table).where(eq(ucApl02Table.assessment_id, id));
        const uc_apl02s = await Promise.all(
            ucApl02sRaw.map(async (uc) => {
                const elementsRaw = await db.select().from(elementApl02Table).where(eq(elementApl02Table.uc_id, uc.id));
                const elements = await Promise.all(
                    elementsRaw.map(async (el) => {
                        const details = await db.select().from(elementDetailsApl02Table).where(eq(elementDetailsApl02Table.element_id, el.id));
                        return {
                            id: el.id,
                            title: el.title,
                            details: details.map((d) => ({ id: d.id, description: d.description }))
                        };
                    })
                );
                return {
                    id: uc.id,
                    unit_code: uc.unit_code,
                    title: uc.title,
                    elements
                };
            })
        );

        // === GROUP IA01 ===
        const groupsIa01Raw = await db.select().from(groupIa01Table).where(eq(groupIa01Table.assessment_id, id));
        const groups_ia01 = await Promise.all(
            groupsIa01Raw.map(async (group) => {
                const unitsRaw = await db.select().from(ucIa01Table).where(eq(ucIa01Table.group_id, group.id));
                const units = await Promise.all(
                    unitsRaw.map(async (unit) => {
                        const elementsRaw = await db.select().from(elementIaTable).where(eq(elementIaTable.uc_id, unit.id));
                        const elements = await Promise.all(
                            elementsRaw.map(async (el) => {
                                const details = await db.select().from(elementDetailsIaTable).where(eq(elementDetailsIaTable.element_id, el.id));
                                return {
                                    id: el.id,
                                    title: el.title,
                                    details: details.map((d) => ({ id: d.id, description: d.description, benchmark: d.benchmark }))
                                };
                            })
                        );
                        return {
                            id: unit.id,
                            unit_code: unit.unit_code,
                            title: unit.title,
                            elements
                        };
                    })
                );
                return {
                    id: group.id,
                    name: group.name,
                    units
                };
            })
        );

        // === GROUP IA02 ===
        const groupsIa02Raw = await db.select().from(groupIa02Table).where(eq(groupIa02Table.assessment_id, id));
        const groups_ia02 = await Promise.all(
            groupsIa02Raw.map(async (group) => {
                const units = await db.select().from(ucIa02Table).where(eq(ucIa02Table.group_id, group.id));
                const tools = await db.select().from(ia02ToolTable).where(eq(ia02ToolTable.group_id, group.id));
                return {
                    id: group.id,
                    name: group.name,
                    scenario: group.scenario,
                    duration: group.duration,
                    units: units.map((u) => ({ id: u.id, unit_code: u.unit_code, title: u.title })),
                    tools: tools.map((t) => ({ id: t.id, name: t.name }))
                };
            })
        );

        // === GROUP IA03 ===
        const groupsIa03Raw = await db.select().from(groupIa03Table).where(eq(groupIa03Table.assessment_id, id));
        const groups_ia03 = await Promise.all(
            groupsIa03Raw.map(async (group) => {
                const units = await db.select().from(ucIa03Table).where(eq(ucIa03Table.group_id, group.id));
                const qa_ia03 = await db.select().from(ia03QuestionTable).where(eq(ia03QuestionTable.group_id, group.id));
                return {
                    id: group.id,
                    name: group.name,
                    units: units.map((u) => ({ id: u.id, unit_code: u.unit_code, title: u.title })),
                    qa_ia03: qa_ia03.map((q) => ({ id: q.id, question: q.question }))
                };
            })
        );

        // === IA05 ===
        const ia05QuestionsRaw = await db.select().from(ia05QuestionTable).where(eq(ia05QuestionTable.assessment_id, id));
        const ia05_questions = await Promise.all(
            ia05QuestionsRaw.map(async (q) => {
                const options = await db.select().from(questionOptionTable).where(eq(questionOptionTable.question_id, q.id));
                return {
                    id: q.id,
                    order: q.order,
                    question: q.question,
                    options: options.map((o) => ({ id: o.id, option: o.option, is_answer: o.is_answer }))
                };
            })
        );

        // === IA07 ===
        const ia07QuestionsRaw = await db.select().from(ia07QuestionTable).where(eq(ia07QuestionTable.assessment_id, id));
        const ia07_questions = ia07QuestionsRaw.map((q) => ({ id: q.id, question: q.question, answer_key: q.answer_key }));

        // === IA02 PDF ===
        const [ia02_pdf] = await db.select().from(ia02PdfTable).where(eq(ia02PdfTable.assessment_id, id));

        return {
            id: assessment.id,
            code: assessment.code,
            occupation: occupation,
            uc_apl02s,
            groups_ia01,
            ia02_pdf,
            groups_ia03,
            ia05_questions,
            ia07_questions,
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

    static async getAssessmentResultDetails(schedule_id: number, assessor_id: number, assessee_id: number) {
        const [result] = await db
            .select({
                id: resultTable.id,
                schedule: assessmentScheduleTable,
                assessment: assessmentTable,
                assessee: assesseeTable,
                assessor: assessor,
                tuk: resultTable.tuk,
                score: resultTable.score,
                is_competent: resultTable.is_competent,
                created_at: resultTable.created_at,
            })
            .from(resultTable)
            .innerJoin(assessmentScheduleTable, eq(resultTable.schedule_id, assessmentScheduleTable.id))
            .innerJoin(assessmentTable, eq(assessmentScheduleTable.assessment_id, assessmentTable.id))
            .innerJoin(assesseeTable, eq(resultTable.assessee_id, assesseeTable.id))
            .innerJoin(assessor, eq(resultTable.assessor_id, assessor.id))
            .where(and(
                eq(assessmentScheduleTable.id, schedule_id),
                eq(assessor.id, assessor_id),
                eq(assesseeTable.id, assessee_id)
            ))

        if (!result) {
            throw new NotFoundError('Result');
        }

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

        let ia05Options: boolean | null = null;
        if (ia05Header) {
            const ia05 = await db.query.resultIa05.findFirst({
                where: eq(resultIa05.header_id, ia05Header.id),
            });
    
            ia05Options = !!ia05;
        }

        return [
            {
                id: result.id,
                schedule: result.schedule,
                assessment: result.assessment,
                assessee: result.assessee,
                assessor: result.assessor,
                tuk: result.tuk,
                score: result.score,
                is_competent: result.is_competent,
                created_at: result.created_at,
                doc: doc,
                apl02_header: apl02Header,
                ia01_header: ia01Header,
                ia02_header: ia02Header,
                ia03_header: ia03Header,
                ia05_header: ia05Header,
                ia05_options: ia05Options,
                ak01_header: ak01Header,
                ak02_header: ak02Header,
                ak03_header: ak03Header,
                ak04: ak04,
                ak05: ak05
            }
        ];
    }

    static async findAssesseeByUserId(schedule_id: number, assessor_id: number, user_id: number): Promise<number> {
        const assessees = await db.query.assessee.findMany({ where: eq(assesseeTable.user_id, user_id), orderBy: desc(assesseeTable.created_at) });

        let result: any;
        for (const assesseeItem of assessees) {
            const results = await db.query.result.findMany({
                where: and(
                    eq(resultTable.schedule_id, schedule_id),
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

    static async assesseeNavigation(schedule_id: number, assessor_id: number, assessee_id: number) {
        const [result] = await db.select().from(resultTable)
            .where(and(
                eq(resultTable.schedule_id, schedule_id),
                eq(resultTable.assessor_id, assessor_id),
                eq(resultTable.assessee_id, assessee_id)
            ))
            .orderBy(desc(resultTable.created_at))
            .limit(1);
        if (!result) throw new NotFoundError('Result');

        const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(assessmentScheduleTable.id, result.schedule_id) });
        if (!schedule) throw new NotFoundError('Schedule');

        // Document
        const doc = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.result_id, result.id) });
        if (!doc) throw new NotFoundError('Result Document');

        // APL02
        const apl02Header = await db.query.resultApl02Header.findFirst({ where: eq(resultApl02HeaderTable.result_id, result.id) });
        if (!apl02Header) throw new NotFoundError('Result APL02 Header');
        const unitCompetencies = await db.select().from(ucApl02Table).where(eq(ucApl02Table.assessment_id, schedule.assessment_id));
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
        const ak01Header = await db.query.resultAk01Header.findFirst({ where: eq(resultAk01HeaderTable.result_id, result.id) });
        if (!ak01Header) throw new NotFoundError('Result AK01 Header');

        // IA02
        const ia02Header = await db.query.resultIa02Header.findFirst({ where: eq(resultIa02HeaderTable.result_id, result.id) });
        if (!ia02Header) throw new NotFoundError('Result IA02 Header');

        // IA01
        const ia01Header = await db.query.resultIa01Header.findFirst({ where: eq(resultIa01HeaderTable.result_id, result.id) });
        if (!ia01Header) throw new NotFoundError('Result IA01 Header');

        const tabs: AssesseeTab[] = [
            { name: 'APL-01', status: "Tuntas" },
            { name: 'Data Sertifikasi', status: doc.approved ? "Tuntas" : "Menunggu" },
            { name: 'APL-02', status: (apl02Header.approved_assessor && apl02Header.approved_assessee && finishedApl02) ? "Tuntas" : (apl02Header.approved_assessor && finishedApl02) ? "Butuh Persetujuan" : finishedApl02 ? "Menunggu" : "Belum Tuntas" },
            { name: 'AK-01', status: (ak01Header.approved_assessor && ak01Header.approved_assessee) ? "Tuntas" : (ak01Header.approved_assessor) ? "Butuh Persetujuan" : "Menunggu" },
            { name: 'IA-02', status: (ia02Header.approved_assessor && ia02Header.approved_assessee) ? "Tuntas" : (ia02Header.approved_assessor) ? "Butuh Persetujuan" : "Menunggu" },
            { name: 'IA-01', status: (ia01Header.approved_assessor && ia01Header.approved_assessee) ? "Tuntas" : (ia01Header.approved_assessor) ? "Butuh Persetujuan" : "Menunggu" }
        ];

        const isAnyIa03 = await db.query.groupIa03.findFirst({ where: eq(groupIa03Table.assessment_id, schedule.assessment_id) });
        const isAnyIa05 = await db.query.ia05Question.findFirst({ where: eq(ia05QuestionTable.assessment_id, schedule.assessment_id) });
        // const isAnyIa07 = await db.query.ia07Question.findFirst({ where: eq(ia07QuestionTable.assessment_id, assessment_id) });

        if (isAnyIa03) {
            const ia03Header = await db.query.resultIa03Header.findFirst({ where: eq(resultIa03HeaderTable.result_id, result.id) });
            if (!ia03Header) throw new NotFoundError('Result IA03 Header');
            const status = (ia03Header.approved_assessor && ia03Header.approved_assessee) ? "Tuntas" : (ia03Header.approved_assessor) ? "Butuh Persetujuan" : "Menunggu";
            tabs.push({ name: 'IA-03', status: status });
        }
        if (isAnyIa05) {
            const ia05Header = await db.query.resultIa05Header.findFirst({ where: eq(resultIa05HeaderTable.result_id, result.id) });
            if (!ia05Header) throw new NotFoundError('Result IA05 Header');
            const ia05Result = await db.query.resultIa05.findFirst({ where: eq(resultIa05.header_id, ia05Header.id) });
            const status = (ia05Header.approved_assessor && ia05Header.approved_assessee) ? "Tuntas" : (ia05Header.approved_assessor) ? "Butuh Persetujuan" : (ia05Result) ? "Menunggu" : "Belum Tuntas";
            tabs.push({ name: 'IA-05', status: status });
        }
        // if (isAnyIa07) tabs.push({ name: 'IA-07', status: 'Belum Selesai' });

        const ak02Header = await db.query.resultAk02Header.findFirst({ where: eq(resultAk02HeaderTable.result_id, result.id) });
        if (!ak02Header) throw new NotFoundError('Result AK02 Header');

        const ak03Header = await db.query.resultAk03Header.findFirst({ where: eq(resultAk03HeaderTable.result_id, result.id) });
        if (!ak03Header) throw new NotFoundError('Result AK03 Header');

        const ak05Header = await db.query.resultAk05.findFirst({ where: eq(resultAk05Table.result_id, result.id) });
        if (!ak05Header) throw new NotFoundError('Result AK05');

        tabs.push(
            { name: 'AK-02', status: (ak02Header.approved_assessor && ak02Header.approved_assessee) ? "Tuntas" : (ak02Header.approved_assessor) ? "Butuh Persetujuan" : "Menunggu" },
            { name: 'AK-03', status: (ak03Header.comment) ? "Tuntas" : "Belum Tuntas" },
            { name: 'AK-05', status: (ak05Header.approved_assessor) ? "Tuntas" : "Menunggu" }
        );

        const enableOtherRoute = (doc.approved && (apl02Header.approved_assessor && apl02Header.is_continue))

        return {
            result_id: result.id,
            assessment_id: schedule.assessment_id,
            schedule_id: result.schedule_id,
            assessor_id: result.assessor_id,
            assessee_id: result.assessee_id,
            tuk: result.tuk,
            score: result.score,
            is_competent: result.is_competent,
            created_at: result.created_at,
            tabs: tabs,
            enable_other_route: true,
        }
    }

    static async assessorNavigation(schedule_id: number, assessor_id: number) {
        const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(assessmentScheduleTable.id, schedule_id) });
        if (!schedule) throw new NotFoundError('Schedule');

        const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, schedule.assessment_id) });
        if (!assessment) throw new NotFoundError('Assessment');

        const tabs: AssessorTab[] = [
            { name: 'APL-02', status: "Menunggu Asesi" },
            { name: 'AK-01', status: "Belum Tuntas" },
            { name: 'IA-02', status: "Belum Tuntas" },
            { name: 'IA-01', status: "Belum Tuntas" }
        ];

        const isAnyIa03 = await db.query.groupIa03.findFirst({ where: eq(groupIa03Table.assessment_id, schedule.assessment_id) });
        const isAnyIa05 = await db.query.ia05Question.findFirst({ where: eq(ia05QuestionTable.assessment_id, schedule.assessment_id) });
        const isAnyIa07 = await db.query.ia07Question.findFirst({ where: eq(ia07QuestionTable.assessment_id, schedule.assessment_id) });
        if (isAnyIa03) tabs.push({ name: 'IA-03', status: "Belum Tuntas" });
        if (isAnyIa05) tabs.push({ name: 'IA-05', status: "Menunggu Asesi" });
        if (isAnyIa07) tabs.push({ name: 'IA-07', status: "Belum Tuntas" });
        tabs.push(
            { name: 'AK-02', status: "Belum Tuntas" },
            { name: 'AK-03', status: "Menunggu Asesi" },
            { name: 'AK-05', status: "Belum Tuntas" },
            { name: 'Penilaian', status: "Belum Tuntas" }
        );

        const results = await db.select().from(resultTable)
            .where(and(
                eq(resultTable.schedule_id, schedule_id),
                eq(resultTable.assessor_id, assessor_id)
            ));
        if (results.length === 0) {
            return {
                schedule_id: schedule_id,
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
                            const unitCompetencies = await db.select().from(ucApl02Table).where(eq(ucApl02Table.assessment_id, schedule.assessment_id));
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
                    case 'Penilaian':
                        header = await db.query.resultAk05.findFirst({ where: eq(resultAk05Table.result_id, result.id) });
                        if (header && !header.approved_assessor) {
                            status = "Butuh Persetujuan";
                        }
                        else if (header && header.approved_assessor && result.score === -1) {
                            status = "Belum Tuntas";
                        } else {
                            status = "Tuntas";
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
            schedule_id: schedule.id,
            assessment_id: assessment.id,
            assessment_code: assessment.code,
            tabs: tabs,
        };
    }

    static async adminNavigation(result_id: number) {
        const result = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
        if (!result) throw new NotFoundError('Result');

        const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(assessmentScheduleTable.id, result.schedule_id) });
        if (!schedule) throw new NotFoundError('Schedule');

        const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, schedule.assessment_id) });
        if (!assessment) throw new NotFoundError('Assessment');

        const doc = await db.query.resultDoc.findFirst({ where: eq(resultDocTable.result_id, result.id) });
        if (!doc) throw new NotFoundError('Result Document');

        const tabs: AdminTab[] = [
            { name: 'APL-01', status: 'Tuntas' },
            // { name: 'Data Sertifikasi', status: doc.approved ? 'Tuntas' : 'Belum Tuntas' },
            { name: 'APL-02', status: 'Belum Tuntas' },
            { name: 'AK-01', status: 'Belum Tuntas' },
            { name: 'IA-02', status: 'Belum Tuntas' },
            { name: 'IA-01', status: 'Belum Tuntas' }
        ];
        const isAnyIa03 = await db.query.groupIa03.findFirst({ where: eq(groupIa03Table.assessment_id, schedule.assessment_id) });
        const isAnyIa05 = await db.query.ia05Question.findFirst({ where: eq(ia05QuestionTable.assessment_id, schedule.assessment_id) });
        const isAnyIa07 = await db.query.ia07Question.findFirst({ where: eq(ia07QuestionTable.assessment_id, schedule.assessment_id) });
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
            schedule_id: schedule.id,
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

        const objReport = await db.query.assessmentReport.findFirst({ 
            where: eq(assessmentReportTable.assessment_id, assessment.id) 
        });

        const results = await db.select({
            id: resultTable.id,
            schedule_id: assessmentScheduleTable.id,
            assessment_id: assessmentScheduleTable.assessment_id,
            assessor_id: resultTable.assessor_id,
            assessee_id: resultTable.assessee_id,
            tuk: resultTable.tuk,
            score: resultTable.score,
            is_competent: resultTable.is_competent,
        }).from(resultTable)
            .innerJoin(assessmentScheduleTable, eq(resultTable.schedule_id, assessmentScheduleTable.id))
            .where(
            and(
                eq(resultTable.schedule_id, schedule.id),
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

            assessees.push({ id: assessee.id, name: user?.full_name, status, score: res.score ?? null });

            summary.total_assessees++;
            if (status === 'Competent') summary.total_competent++;
            if (status === 'Not Competent') summary.total_incompetent++;
            if (status === 'On Going') summary.total_ongoing++;
        }

        assessees.sort((a, b) => a.name.localeCompare(b.name));

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
                        full_name: assessorUser.full_name,
                        signature: assessor.signature
                    }
                },
                assessees: assessees,
                summary: summary,
                report: objReport ?? null
            },
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

    static async getAssesseesByScheduleAndAssessor(schedule_id: number, assessor_id: number) {
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
                eq(resultTable.schedule_id, schedule_id),
                eq(resultTable.assessor_id, assessor_id)
            ))
            .orderBy(asc(userTable.full_name), asc(resultTable.created_at));

        let finalResults: any[] = [];

        for (const res of results) {
            const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, res.assessee_id) });
            if (!assessee) continue;
            const isPending = await db.query.approvalRequest.findFirst({ where: and(eq(approvalRequest.target_id, assessee.id), eq(approvalRequest.target_table, 'assessee'), eq(approvalRequest.status, 'pending')) }) ? true : false;

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
            if (
                (resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee && resultIA05.is_achieved) : true) &&
                (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                (resultAK05 && resultAK05.approved_assessor && resultAK05.is_competent)
            ) {
                if (res.is_competent && resultAK05.is_competent) status = "Kompeten";
                else status = "Belum Kompeten";
            }

            finalResults.push({
                id: res.id,
                assessee_id: res.assessee_id,
                full_name: res.full_name,
                status: status,
                created_at: res.created_at,
                is_pending: isPending
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
        const startDay = days[end.getDay()];
        const startDate = end.getDate();
        const startMonth = months[end.getMonth()];
        const startYear = end.getFullYear();
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
        
        // === HEADER ===
        const image = "../../public/images/kop-surat-lsp-smkn24j.png";
        y = await kopSurat(pdfDoc, page, image);
        
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
        
        page.drawRectangle({
            x, y: tableTop - rowHeight * 2,
            width: colWidths[0], height: rowHeight * 3 - 11,
            color: headerColor, borderColor: rgb(0, 0, 0), borderWidth: 1
        });
        page.drawText("No", { x: x + 8, y: tableTop - rowHeight + 2, size: fontSizeSmall, font: fontBold });
        x += colWidths[0];
        
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
        y = currentY;
        
        // === NOTE ===
        y = drawParagraph(page, "Selama pelaksanaan rekomendasi telah terjadi hal penting sebagai berikut :", 50, y, font, fontSizeSmall) + lLineGap;
        
        const boxSize = 12;
        const boxX = 50;
        let boxY = y - boxSize * 2 + 10 - 6;
        
        const report = assessment.report;
        let isFirstChecked = false;
        let isSecondChecked = false;
        let noteText = "";
        
        if (!report) {
            isFirstChecked = true;
        } else {
            if (report.is_competent && report.statement) {
                isSecondChecked = true
                noteText = report.statement || "";
            } else {
                isSecondChecked = true;
                noteText = report.statement || "";
            }
        }
        
        // Checkbox 1: Tertib dan lancar
        page.drawRectangle({ 
            x: boxX, 
            y: boxY - boxSize + 10, 
            width: boxSize, 
            height: boxSize, 
            borderColor: rgb(0, 0, 0), 
            borderWidth: 1, 
            color: rgb(1, 1, 1) 
        });
        if (isFirstChecked) {
            page.drawText("✓", { 
                x: boxX + 2, 
                y: boxY - boxSize + 11, 
                size: fontSizeSmall, 
                font: iconFont 
            });
        }
        drawParagraph(page, "Tertib dan lancar", boxX + boxSize + 5, boxY, font, fontSizeSmall);
        boxY -= lineGap;
        
        // Checkbox 2: Tertib dan lancar dengan catatan
        page.drawRectangle({ 
            x: boxX, 
            y: boxY - boxSize * 2 + 10, 
            width: boxSize, 
            height: boxSize, 
            borderColor: rgb(0, 0, 0), 
            borderWidth: 1, 
            color: rgb(1, 1, 1) 
        });
        if (isSecondChecked) {
            page.drawText("✓", { 
                x: boxX + 2, 
                y: boxY - boxSize * 2 + 11, 
                size: fontSizeSmall, 
                font: iconFont 
            });
        }
        drawParagraph(page, "Tertib dan lancar dengan", boxX + boxSize + 5, boxY - boxSize, font, fontSizeSmall);
        boxY -= lineGap;
        
        const catatanLine = noteText 
            ? `catatan : ${noteText}`
            : "catatan : ...........................................................................................................................................";
        drawParagraph(page, catatanLine, boxX + boxSize + 5, boxY - boxSize * 2, font, fontSizeSmall);
        
        if (!noteText) {
            drawParagraph(page, "................................................................................................................................................................", 50, boxY - boxSize * 3, font, fontSizeSmall);
        }
        
        y = boxY - boxSize * 4 - lineGap;
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
        
        await drawSignatureOrQR(
            pdfDoc,
            page,
            assessment.schedule.assessor?.signature,
            getAssessorUrl(assessment.schedule.assessor.id),
            page.getWidth() - signatureWidth * 2 - (signatureNameLength / 2) + (signatureWidth / 2) + 9,
            signatureY - signatureWidth,
            signatureWidth
        );
        
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    }

    static async getResultsByAssessmentGroupedByAssessor(
        scheduleId: number
    ): Promise<AssessmentResultGrouped | null> {
        // Query untuk mendapatkan semua data yang dibutuhkan
        const results = await db
            .select({
                // Schedule fields
                schedule_id: assessmentScheduleTable.id,
                schedule_start_date: assessmentScheduleTable.start_date,
                schedule_end_date: assessmentScheduleTable.end_date,

                // Assessment fields
                assessment_id: assessmentTable.id,
                assessment_code: assessmentTable.code,
                assessment_created_at: assessmentTable.created_at,
                assessment_updated_at: assessmentTable.updated_at,

                // Occupation fields
                occupation_id: occupationTable.id,
                occupation_name: occupationTable.name,
                occupation_scheme_id: occupationTable.scheme_id,

                // Scheme fields
                scheme_id: schemeTable.id,
                scheme_code: schemeTable.code,
                scheme_name: schemeTable.name,

                // Assessor fields
                assessor_id: assessor.id,
                assessor_no_reg_met: assessor.no_reg_met,
                assessor_signature: assessor.signature,

                // Assessor user fields
                assessor_user_full_name: userTable.full_name,

                // Result fields
                result_id: resultTable.id,
                result_score: resultTable.score,
                result_is_competent: resultTable.is_competent,
                result_tuk: resultTable.tuk,
                result_created_at: resultTable.created_at,
                result_updated_at: resultTable.updated_at,

                // Assessee fields
                assessee_id: assessee.id,

                // Assessee user fields (untuk nama assessee)
                assessee_user_id: assessee.user_id,
            })
            .from(resultTable)
            .innerJoin(assessmentScheduleTable, eq(resultTable.schedule_id, assessmentScheduleTable.id))
            .innerJoin(assessmentTable, eq(assessmentScheduleTable.assessment_id, assessmentTable.id))
            .innerJoin(occupationTable, eq(assessmentTable.occupation_id, occupationTable.id))
            .innerJoin(schemeTable, eq(occupationTable.scheme_id, schemeTable.id))
            .innerJoin(assessorTable, eq(resultTable.assessor_id, assessorTable.id))
            .innerJoin(userTable, eq(assessorTable.user_id, userTable.id))
            .innerJoin(assesseeTable, eq(resultTable.assessee_id, assesseeTable.id))
            .where(eq(assessmentScheduleTable.id, scheduleId));

        if (results.length === 0) {
            return null;
        }

        const assesseeUserIds = [...new Set(results.map(r => r.assessee_user_id))];
        const assesseeUsers = await db
            .select({
                id: userTable.id,
                full_name: userTable.full_name,
            })
            .from(userTable)
            .where(
                eq(userTable.id, assesseeUserIds[0]) // akan di-map manual di bawah
            );

        const assesseeUserMap = new Map<number, string>();
        for (const userId of assesseeUserIds) {
            const user = await db
                .select({ full_name: userTable.full_name })
                .from(userTable)
                .where(eq(userTable.id, userId))
                .limit(1);
            if (user[0]) {
                assesseeUserMap.set(userId, user[0].full_name);
            }
        }

        const assessorMap = new Map<number, {
            id: number;
            full_name: string;
            signature: string | null;
            no_reg_met: string;
            assessees: {
                result_id: number;
                score: number | null;
                is_competent: boolean;
                tuk: 'sewaktu' | 'tempat_kerja' | 'mandiri';
                created_at: Date;
                updated_at: Date;
                assessee_id: number;
                assessee_name: string;
            }[];
        }>();

        results.forEach(row => {
            if (!assessorMap.has(row.assessor_id)) {
                assessorMap.set(row.assessor_id, {
                    id: row.assessor_id,
                    full_name: row.assessor_user_full_name,
                    signature: row.assessor_signature,
                    no_reg_met: row.assessor_no_reg_met,
                    assessees: [],
                });
            }

            assessorMap.get(row.assessor_id)!.assessees.push({
                result_id: row.result_id,
                score: row.result_score,
                is_competent: row.result_is_competent,
                tuk: row.result_tuk,
                created_at: row.result_created_at,
                updated_at: row.result_updated_at,
                assessee_id: row.assessee_id,
                assessee_name: assesseeUserMap.get(row.assessee_user_id) || '',
            });
        });

        const firstRow = results[0];
        const finalResult: AssessmentResultGrouped = {
            id: firstRow.assessment_id,
            schedule_id: firstRow.schedule_id,
            schedule_start_date: firstRow.schedule_start_date,
            schedule_end_date: firstRow.schedule_end_date,
            code: firstRow.assessment_code,
            occupation_id: firstRow.occupation_id,
            created_at: firstRow.assessment_created_at,
            updated_at: firstRow.assessment_updated_at,
            occupation: {
                id: firstRow.occupation_id,
                name: firstRow.occupation_name,
                scheme_id: firstRow.occupation_scheme_id,
                scheme: {
                    id: firstRow.scheme_id,
                    code: firstRow.scheme_code,
                    name: firstRow.scheme_name,
                },
            },
            assessors: Array.from(assessorMap.values()),
        };

        return finalResult;
    }

    static async generateUkkEvaluationPdf(schedule_id: number) {
        const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(assessmentScheduleTable.id, schedule_id) });
        if (!schedule) {
            throw new NotFoundError('Schedule not found');
        }
        const existingAssessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, schedule.assessment_id) });
        if (!existingAssessment) {
            throw new NotFoundError('Assessment not found');
        }
        
        // Ambil data report untuk assessment ini
        const objReport = await db.query.assessmentReport.findFirst({ 
            where: eq(assessmentReportTable.assessment_id, existingAssessment.id) 
        });
        
        const results = await this.getResultsByAssessmentGroupedByAssessor(schedule_id);
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const image = "../../public/images/kop-surat-lsp-smkn24j.png";
        
        for (let assessorIdx = 0; assessorIdx < (!results ? 0 : results?.assessors.length); assessorIdx++) {
            let { page, y } = await createNewPage(pdfDoc, image, fontBold);
            // === Fonts === 
            const iconFont = await pdfDoc.embedFont(StandardFonts.ZapfDingbats);
            const fontSizeSmall = 11;
            const fontSizeLarge = 14;
            const rowHeight = 24;
            
            // === TITLE ===
            const headerText = [
                "FORM PENILAIAN",
                "UJI KOMPETENSI KEAHLIAN",
            ];
            headerText.forEach(text => {
                y = drawParagraph(page, text, 40, y, fontBold, fontSizeLarge, "center");
            });
            y += 8;
            
            const colWidths: any = [30, 265, 75, 75, 75];
            const headerColor = rgb(1, 0.95, 0.7);
            let startX = 40;
            const scoreHeaderTexts = [`SKOR PENILAIAN`, results?.occupation.name.toUpperCase() ?? "OKUPASI"];
            const scoreHeaderHeights = scoreHeaderTexts.map((cell: string) => {
                const words = cell.split(" ");
                let line = "";
                let lines: string[] = [];
                for (const word of words) {
                    const testLine = line ? line + " " + word : word;
                    const testWidth = font.widthOfTextAtSize(testLine, fontSizeSmall);
                    if (testWidth > colWidths[2] + colWidths[3] + colWidths[4] - 8) {
                        lines.push(line);
                        line = word;
                    } else {
                        line = testLine;
                    }
                }
                if (line) lines.push(line);
                return Math.max(rowHeight, lines.length * (9 + 4) + 6);
            });
            
            const scoreHeaderWidth = colWidths[2] + colWidths[3] + colWidths[4];
            let scoreHeaderX = startX + colWidths[0] + colWidths[1];
            let scoreHeaderY = y;
            
            // === Kolom Gabungan Rekomendasi (K, BK, SK) ===
            let scoreTextY = scoreHeaderY;
            page.drawRectangle({
                x: scoreHeaderX, y: scoreHeaderY - scoreHeaderHeights.reduce((a, b) => a + b, 0),
                width: scoreHeaderWidth,
                height: scoreHeaderHeights.reduce((a, b) => a + b, 0) + fontSizeSmall / 2 - 16,
                color: headerColor, borderColor: rgb(0, 0, 0), borderWidth: 1
            });
            drawCellText(page, scoreHeaderTexts[0], scoreHeaderX, scoreTextY - scoreHeaderHeights.reduce((a, b) => a + b, 0) / 2 + fontSizeSmall / 2 + 10, scoreHeaderWidth, scoreHeaderHeights[0], fontBold, fontSizeSmall, "center");
            scoreTextY -= scoreHeaderHeights[0] - fontSizeSmall / 2 - 4;
            drawCellText(page, scoreHeaderTexts[1], scoreHeaderX, scoreTextY - scoreHeaderHeights.reduce((a, b) => a + b, 0) / 2 + fontSizeSmall / 2 + 10, scoreHeaderWidth, scoreHeaderHeights[1], fontBold, fontSizeSmall, "center");
            scoreHeaderY -= scoreHeaderHeights.reduce((a, b) => a + b, 0) + fontSizeSmall / 2 - 8;
            
            const subColumnScoreTexts = ['< 85   BELUM KOMPETEN', '85 - 90 KOMPETEN', '91 - 100 SANGAT KOMPETEN'];
            const subColumnScoreHeights = subColumnScoreTexts.map((cell: string, idx: number) => {
                const words = cell.split(" ");
                let line = "";
                let lines: string[] = [];
                for (const word of words) {
                    const testLine = line ? line + " " + word : word;
                    const testWidth = font.widthOfTextAtSize(testLine, fontSizeSmall);
                    if (testWidth > colWidths[idx] - 8) {
                        lines.push(line);
                        line = word;
                    } else {
                        line = testLine;
                    }
                }
                if (line) lines.push(line);
                return lines.length * (9 + 4) + 6;
            });
            
            const maxSubColumnScoreHeight = Math.max(rowHeight, ...subColumnScoreHeights);
            subColumnScoreTexts.forEach((cell, idx) => {
                const w = colWidths[idx + 2];
                page.drawRectangle({
                    x: scoreHeaderX,
                    y: scoreHeaderY - maxSubColumnScoreHeight + fontSizeSmall / 2,
                    width: w,
                    height: maxSubColumnScoreHeight - fontSizeSmall / 2,
                    color: headerColor,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });
                drawCellText(page, cell, scoreHeaderX, scoreHeaderY - 2, w, maxSubColumnScoreHeight - fontSizeSmall / 2 - 16, fontBold, fontSizeSmall, "center");
                scoreHeaderX += w;
            });
            scoreHeaderY -= maxSubColumnScoreHeight - fontSizeSmall / 2;
            
            const headerTexts = ['NO', 'NAMA PESERTA'];
            headerTexts.forEach((cell, idx) => {
                const w = colWidths[idx];
                page.drawRectangle({
                    x: startX,
                    y: scoreHeaderY,
                    width: w,
                    height: y - scoreHeaderY + fontSizeSmall / 2 - 16,
                    color: headerColor, borderColor: rgb(0, 0, 0), borderWidth: 1
                });
                drawCellText(page, cell, startX, scoreHeaderY + (y - scoreHeaderY + fontSizeSmall / 2) / 2 + 4, w, rowHeight - fontSizeSmall / 2 - 16, fontBold, fontSizeSmall, "center");
                startX += w;
            });
            y = scoreHeaderY;
            startX = 40;
            
            const data: string[][] = results?.assessors[assessorIdx].assessees.map((assessee: any, idx: number) => {
                return [`${idx + 1}.`, assessee.assessee_name, assessee.score < 85 && assessee.score >= 0 ? assessee.score.toString() : assessee.score < 0 ? "" : "", assessee.score >= 85 && assessee.score <= 90 ? assessee.score.toString() : "", assessee.score > 90 ? assessee.score.toString() : ""];
            }) ?? [];
            
            for (let i = 0; i < (data.length < 12 ? 12 : data.length); i++) {
                let row = data[i];
                if (!row) row = [`${i + 1}.`, '', '', '', ''];
                let x = startX;
                let maxRowHeight = rowHeight;
                
                const cellHeights = row.map((cell, idx) => {
                    const safeCell = cell ?? "";
                    const words = safeCell.split(" ");
                    let line = "";
                    let lines: string[] = [];
                    for (const word of words) {
                        const testLine = line ? line + " " + word : word;
                        const testWidth = font.widthOfTextAtSize(testLine, fontSizeSmall);
                        if (testWidth > colWidths[idx] - 8) {
                            lines.push(line);
                            line = word;
                        } else {
                            line = testLine;
                        }
                    }
                    if (line) lines.push(line);
                    return lines.length * (9 + 4) + 6;
                });
                maxRowHeight = Math.max(rowHeight, ...cellHeights);
                
                // draw cell
                row.forEach((cell, idx) => {
                    const w = colWidths[idx];
                    page.drawRectangle({
                        x,
                        y: y - maxRowHeight,
                        width: w,
                        height: maxRowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1,
                    });
                    const align = idx === 0 || idx === 1 ? "left" : "center";
                    drawCellText(page, cell, x, y, w, maxRowHeight, font, fontSizeSmall, align);
                    x += w;
                });
                y -= maxRowHeight;
            }
            y -= 24;
            
            const l2LineGap = 8;
            const lLineGap = 12;
            
            // === NOTE ===
            y = drawParagraph(page, "Selama pelaksanaan uji kompetensi keahlian telah terjadi hal penting sebagai berikut :", 50, y, font, fontSizeSmall) + lLineGap;
            
            const boxSize = 12;
            const boxX = 50;
            let boxY = y - boxSize * 2 + 10 - 6;
            
            let isFirstChecked = false;
            let isSecondChecked = false;
            let noteText = "";
            
            if (!objReport) {
                isFirstChecked = true;
            } else {
                if (objReport.is_competent) {
                    isSecondChecked = true
                    noteText = objReport.statement || "";
                } else {
                    isSecondChecked = true;
                    noteText = objReport.statement || "";
                }
            }
            
            // Checkbox 1: Tertib dan lancar
            page.drawRectangle({ 
                x: boxX, 
                y: boxY - boxSize + 10, 
                width: boxSize, 
                height: boxSize, 
                borderColor: rgb(0, 0, 0), 
                borderWidth: 1, 
                color: rgb(1, 1, 1) 
            });
            if (isFirstChecked) {
                page.drawText("✓", { 
                    x: boxX + 2, 
                    y: boxY - boxSize + 11, 
                    size: fontSizeSmall, 
                    font: iconFont 
                });
            }
            drawParagraph(page, "Tertib dan lancar", boxX + boxSize + 5, boxY, font, fontSizeSmall);
            boxY -= l2LineGap;
            
            // Checkbox 2: Tertib dan lancar dengan catatan
            page.drawRectangle({ 
                x: boxX, 
                y: boxY - boxSize * 2 + 10, 
                width: boxSize, 
                height: boxSize, 
                borderColor: rgb(0, 0, 0), 
                borderWidth: 1, 
                color: rgb(1, 1, 1) 
            });
            if (isSecondChecked) {
                page.drawText("✓", { 
                    x: boxX + 2, 
                    y: boxY - boxSize * 2 + 11, 
                    size: fontSizeSmall, 
                    font: iconFont 
                });
            }
            drawParagraph(page, "Tertib dan lancar dengan", boxX + boxSize + 5, boxY - boxSize, font, fontSizeSmall);
            boxY -= l2LineGap;
            
            const catatanLine = noteText 
                ? `catatan : ${noteText}`
                : "catatan : ....................................................................................................................................";
            y = drawParagraph(page, catatanLine, boxX + boxSize + 5, boxY - boxSize * 2, font, fontSizeSmall);
            boxY -= l2LineGap;
            
            if (!noteText) {
                y = drawParagraph(page, "............................................................................................................................................................", boxX + boxSize + 5, boxY - boxSize * 3, font, fontSizeSmall);
            }
            
            drawParagraph(page, "Demikian, form penilaian ini dibuat sesuai dengan kejadian yang sebenarnya, untuk digunakan sebagaimana mestinya.", 50, y, font, fontSizeSmall);
            
            // === SIGNATURE ===
            const signatureX = 50;
            let signatureY = y - 50;
            const signatureWidth = 60;
            const date = `${formatDay(results!.schedule_end_date)} ${formatDate(results!.schedule_end_date)}`;
            const signatureDate = `Jakarta, ${date}`;
            const assessor_name = results?.assessors[assessorIdx].full_name;
            const signatureNameLength = font.widthOfTextAtSize(results?.assessors[assessorIdx].full_name ?? "", fontSizeSmall);
            
            drawParagraph(page, `${signatureDate}`, signatureX, signatureY, font, fontSizeSmall, "right");
            y = drawParagraph(page, `Assessor`, signatureX + (signatureNameLength / 2) - (signatureWidth / 2), signatureY - 15, font, fontSizeSmall, "right");
            signatureY -= 20;
            
            await drawSignatureOrQR(
                pdfDoc,
                page,
                results?.assessors[assessorIdx].signature ?? "",
                getAssessorUrl(results?.assessors[assessorIdx].id ?? 0),
                page.getWidth() - signatureWidth * 2 - (signatureNameLength / 2) + (signatureWidth / 2) + 9,
                signatureY - signatureWidth,
                signatureWidth
            );
            drawParagraph(page, `${assessor_name}`, signatureX, signatureY - signatureWidth - 12, font, fontSizeSmall, "right");
        }
        return await pdfDoc.save();
    }
    
    static async inputScore(result_id: number, score: number) {
        const existingResults = await db.query.result.findFirst({
            where: eq(resultTable.id, result_id),
        });

        if (!existingResults) throw new NotFoundError('Result');

        await db
            .update(resultTable)
            .set({ score })
            .where(eq(resultTable.id, result_id));

        const resultUpdated = await db.query.result.findFirst({
            where: eq(resultTable.id, result_id),
        });

        return resultUpdated;
    }
}