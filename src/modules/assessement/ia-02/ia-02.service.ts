import { NotFoundError, AppError } from "../../../common/error";
import { GroupIA02Response } from "./ia-02.type";
import { db } from "../../../config/drizzle";
import {
    assessor as assessorTable,
    assessment as assessmentTable,
    groupIa02 as groupIa02Table,
    ucIa02 as ucIa02Table,
    ia02Tool as ia02ToolTable,
    ia02Pdf as ia02PdfTable,
    result as resultTable,
    resultIa02Header as ia02HeaderTable,
    assessee as assesseeTable,
    user as userTable,
    occupation as occupationTable,
    scheme as schemeTable,
} from "../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import fs from 'fs';
import path from "path";

export class IAO2Service {
    static async getIA02Groups(assessment_id: number): Promise<GroupIA02Response[]> {
        const existingAssessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, assessment_id) });
        if (!existingAssessment) throw new NotFoundError('Assessment');

        const groups = await db.select().from(groupIa02Table).where(eq(groupIa02Table.assessment_id, assessment_id));
        return Promise.all(groups.map(async (g) => {
            const units = await db.select().from(ucIa02Table).where(eq(ucIa02Table.group_id, g.id));
            const tools = await db.select().from(ia02ToolTable).where(eq(ia02ToolTable.group_id, g.id));
            const pdf = await db.query.ia02Pdf.findFirst({ where: eq(ia02PdfTable.assessment_id, g.id) });
            return {
                id: g.id,
                assessment_id: g.assessment_id,
                name: g.name,
                scenario: g.scenario,
                duration: g.duration,
                units,
                tools,
                pdfs: pdf ? [pdf] : [],
            } as any;
        }));
    }

    static async approveByAssessor(result_id: number) {
        const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
        if (!existingResult) throw new NotFoundError('Result');
        const header = await db.query.resultIa02Header.findFirst({ where: eq(ia02HeaderTable.result_id, result_id) });
        if (!header) throw new NotFoundError('IA02 header');

        await db.update(ia02HeaderTable).set({ approved_assessor: true }).where(eq(ia02HeaderTable.id, header.id));
        const updated = await db.query.resultIa02Header.findFirst({ where: eq(ia02HeaderTable.id, header.id) });
        if (!updated) throw new NotFoundError('IA02 header');

        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assessee_id) });
        const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;
        return {
            id: updated.id,
            result_id: updated.result_id,
            assessee: { id: assessee?.id, name: assesseeUser?.full_name, email: assesseeUser?.email },
            approved_assessee: updated.approved_assessee,
            approved_assessor: updated.approved_assessor,
        };
    }

    static async approveByAssessee(result_id: number) {
        const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
        if (!existingResult) throw new NotFoundError('Result');
        const header = await db.query.resultIa02Header.findFirst({ where: eq(ia02HeaderTable.result_id, result_id) });
        if (!header) throw new NotFoundError('IA02 header');

        await db.update(ia02HeaderTable).set({ approved_assessee: true }).where(eq(ia02HeaderTable.id, header.id));
        const updated = await db.query.resultIa02Header.findFirst({ where: eq(ia02HeaderTable.id, header.id) });
        if (!updated) throw new NotFoundError('IA02 header');

        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assessee_id) });
        const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;
        return {
            id: updated.id,
            result_id: updated.result_id,
            assessee: { id: assessee?.id, name: assesseeUser?.full_name, email: assesseeUser?.email },
            approved_assessee: updated.approved_assessee,
            approved_assessor: updated.approved_assessor,
        };
    }

    static async getResultDetails(result_id: number) {
        const result = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
        if (!result) throw new NotFoundError('Result');

        const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, result.assessment_id) });
        const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) }) : null;
        const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) }) : null;
        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assessee_id) });
        const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;
        const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, result.assessor_id) });
        const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) }) : null;
        const header = await db.query.resultIa02Header.findFirst({ where: eq(ia02HeaderTable.result_id, result_id) });
        if (!header) throw new NotFoundError('Result header');

        return {
            id: result.id,
            assessment: assessment ? { ...assessment, occupation: occupation ? { ...occupation, scheme } : null } : null,
            assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.full_name, email: assesseeUser.email } : null,
            assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.full_name, email: assessorUser.email, no_reg_met: assessor.no_reg_met } : null,
            tuk: result.tuk,
            is_competent: false,
            created_at: result.created_at,
            ia02_header: header,
        };
    }

    static async uploadPdf(assessment_id: number, _filePath: string, file_name: string) {
        try {
            const existing = await db.query.ia02Pdf.findFirst({ where: eq(ia02PdfTable.assessment_id, assessment_id) });
            if (existing) {
                const folderPath = path.dirname(_filePath);
                if (fs.existsSync(folderPath)) {
                    try {
                        fs.unlinkSync(path.join(folderPath, existing.file_name));
                    } catch {}
                }

                await db.update(ia02PdfTable)
                    .set({ file_name })
                    .where(eq(ia02PdfTable.assessment_id, assessment_id));
            } else {
                await db.insert(ia02PdfTable).values({ assessment_id: assessment_id, file_name: file_name });
            }

            const updated = await db.query.ia02Pdf.findFirst({ where: eq(ia02PdfTable.assessment_id, assessment_id) });
            if (!updated) throw new NotFoundError('IA02 PDF');
            
            return updated;
        } catch (error: any) {
            throw new AppError(`Gagal mengunggah file PDF: ${error.message}`, 500);
        }
    }

    static async getPdf(assessment_id: number) {
        try {
            const pdf = await db.query.ia02Pdf.findFirst({ where: eq(ia02PdfTable.assessment_id, assessment_id) });
            return pdf;
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Gagal mendapatkan file PDF: ${error.message}`, 500);
        }
    }
}