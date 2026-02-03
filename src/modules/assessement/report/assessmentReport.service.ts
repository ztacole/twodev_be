import { db } from "../../../config/drizzle";
import {
  assessment as assessmentTable,
  assessmentReport as assessmentReportTable,
} from "../../../../drizzle/schema";
import { NotFoundError } from "../../../common/error";
import { AssessmentReportRequest } from "./assessmentReport.types";
import { eq } from "drizzle-orm";

export class AssessmentReportService {
  
  static async getAssessmentReport(iAssessmentID: number) {
    const assessment = await db.query.assessment.findFirst({ 
      where: eq(assessmentTable.id, iAssessmentID) 
    });
    if (!assessment) throw new NotFoundError('Assessment');

    const report = await db.query.assessmentReport.findFirst({ 
      where: eq(assessmentReportTable.assessment_id, iAssessmentID) 
    });
    
    if (!report) throw new NotFoundError('Assessment Report');

    return report;
  }

  static async createAssessmentReport(objReport: AssessmentReportRequest) {
    const existing = await db.query.assessmentReport.findFirst({
        where: eq(assessmentReportTable.assessment_id, objReport.assessment_id)
    });
    
    if (existing) {
        return this.updateAssessmentReport(objReport.assessment_id, objReport);
    }

    await db.insert(assessmentReportTable).values({
        assessment_id: objReport.assessment_id,
        statement: objReport.statement || null,
        is_competent: objReport.is_competent ? 1 : 0
    });

    return await this.getAssessmentReport(objReport.assessment_id);
  }

  static async updateAssessmentReport(iAssessmentID: number, objReport: AssessmentReportRequest) {
    const existingReport = await db.query.assessmentReport.findFirst({ 
      where: eq(assessmentReportTable.assessment_id, iAssessmentID) 
    });
    
    if (!existingReport) throw new NotFoundError('Assessment Report');

    await db.update(assessmentReportTable)
      .set({
        statement: objReport.statement || null,
        is_competent: objReport.is_competent ? 1 : 0
      })
      .where(eq(assessmentReportTable.assessment_id, iAssessmentID));
      
    return await this.getAssessmentReport(iAssessmentID);
  }
}