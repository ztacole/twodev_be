import { NotFoundError, AppError } from "../../../common/error";
import { GroupIA02Response } from "./ia-02.type";
import { db } from "../../../config/drizzle";
import {
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

export class IAO2Service {
    static async getIA02Groups(assessmentId: number): Promise<GroupIA02Response[]> {
        const existingAssessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, assessmentId) });
        if (!existingAssessment) throw new NotFoundError('Assessment');

        const groups = await db.select().from(groupIa02Table).where(eq(groupIa02Table.assessmentId, assessmentId));
        return Promise.all(groups.map(async (g) => {
            const units = await db.select().from(ucIa02Table).where(eq(ucIa02Table.groupId, g.id));
            const tools = await db.select().from(ia02ToolTable).where(eq(ia02ToolTable.groupId, g.id));
            const pdf = await db.query.ia02Pdf.findFirst({ where: eq(ia02PdfTable.groupId, g.id) });
            return {
                id: g.id,
                assessment_id: g.assessmentId,
                name: g.name,
                scenario: g.scenario,
                duration: g.duration,
                units,
                tools,
                pdfs: pdf ? [pdf] : [],
            } as any;
        }));
    }

    static async approveByAssessor(resultId: number) {
        const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, resultId) });
        if (!existingResult) throw new NotFoundError('Result');
        const header = await db.query.resultIa02Header.findFirst({ where: eq(ia02HeaderTable.resultId, resultId) });
        if (!header) throw new NotFoundError('IA02 header');

        await db.update(ia02HeaderTable).set({ approvedAssessor: true }).where(eq(ia02HeaderTable.id, header.id));
        const updated = await db.query.resultIa02Header.findFirst({ where: eq(ia02HeaderTable.id, header.id) });
        if (!updated) throw new NotFoundError('IA02 header');

        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assesseeId) });
        const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;
        return {
            id: updated.id,
            result_id: updated.resultId,
            assessee: { id: assessee?.id, name: assesseeUser?.fullName, email: assesseeUser?.email },
            approved_assessee: updated.approvedAssessee,
            approved_assessor: updated.approvedAssessor,
        };
    }

    static async approveByAssessee(resultId: number) {
        const existingResult = await db.query.result.findFirst({ where: eq(resultTable.id, resultId) });
        if (!existingResult) throw new NotFoundError('Result');
        const header = await db.query.resultIa02Header.findFirst({ where: eq(ia02HeaderTable.resultId, resultId) });
        if (!header) throw new NotFoundError('IA02 header');

        await db.update(ia02HeaderTable).set({ approvedAssessee: true }).where(eq(ia02HeaderTable.id, header.id));
        const updated = await db.query.resultIa02Header.findFirst({ where: eq(ia02HeaderTable.id, header.id) });
        if (!updated) throw new NotFoundError('IA02 header');

        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, existingResult.assesseeId) });
        const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;
        return {
            id: updated.id,
            result_id: updated.resultId,
            assessee: { id: assessee?.id, name: assesseeUser?.fullName, email: assesseeUser?.email },
            approved_assessee: updated.approvedAssessee,
            approved_assessor: updated.approvedAssessor,
        };
    }

    static async getResultDetails(resultId: number) {
        const result = await db.query.result.findFirst({ where: eq(resultTable.id, resultId) });
        if (!result) throw new NotFoundError('Result');

        const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, result.assessmentId) });
        const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupationId) }) : null;
        const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.schemeId) }) : null;
        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assesseeId) });
        const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;
        const header = await db.query.resultIa02Header.findFirst({ where: eq(ia02HeaderTable.resultId, resultId) });
        if (!header) throw new NotFoundError('Result header');

        return {
            id: result.id,
            assessment: assessment ? { ...assessment, occupation: occupation ? { ...occupation, scheme } : null } : null,
            assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.fullName, email: assesseeUser.email } : null,
            assessor: null,
            tuk: result.tuk,
            is_competent: false,
            created_at: result.createdAt,
            ia02_header: header,
        };
    }
    
    static async uploadPdf(groupId: number, _filePath: string, fileName: string) {
        try {
            const existing = await db.query.ia02Pdf.findFirst({ where: eq(ia02PdfTable.groupId, groupId) });
            if (existing) {
                await db.update(ia02PdfTable).set({ name: fileName }).where(eq(ia02PdfTable.groupId, groupId));
                return await db.query.ia02Pdf.findFirst({ where: eq(ia02PdfTable.groupId, groupId) });
            }
            await db.insert(ia02PdfTable).values({ groupId, name: fileName });
            return await db.query.ia02Pdf.findFirst({ where: eq(ia02PdfTable.groupId, groupId) });
        } catch (error: any) {
            throw new AppError(`Gagal mengunggah file PDF: ${error.message}`, 500);
        }
    }

    static async getPdf(groupId: number) {
        try {
            const pdf = await db.query.ia02Pdf.findFirst({ where: eq(ia02PdfTable.groupId, groupId) });
            return pdf;
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Gagal mendapatkan file PDF: ${error.message}`, 500);
        }
    }
}