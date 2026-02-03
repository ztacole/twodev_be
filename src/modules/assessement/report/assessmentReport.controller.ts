import { Request, Response } from "express";
import { asyncHandler } from "../../../common/async.handler";
import { AssessmentReportService } from "./assessmentReport.service";
import { AssessmentReportRequest } from "./assessmentReport.types";

export class AssessmentReportController {
  static getAssessmentReport = asyncHandler(async (req: Request, res: Response) => {
    const assessmentId = Number(req.params.assessmentId);
    if (!assessmentId) return res.status(400).json({ success: false, message: "ID assessment harus diisi", });

    const result = await AssessmentReportService.getAssessmentReport(assessmentId);
    res.status(200).json({ 
      success: true, 
      message: "Report berhasil diambil", 
      data: result, 
    });
  })

  static createAssessmentReport = asyncHandler(async (req: Request, res: Response) => {
    const data: AssessmentReportRequest = req.body;
    const result = await AssessmentReportService.createAssessmentReport(data);
    res.status(200).json({ 
      success: true, 
      message: "Report berhasil dibuat", 
      data: result, 
    });
  })

  static updateAssessmentReport = asyncHandler(async (req: Request, res: Response) => {
    const assessmentId = Number(req.params.assessmentId);
    if (!assessmentId) return res.status(400).json({ success: false, message: "ID assessment harus diisi", });
    
    const data: AssessmentReportRequest = req.body;
    const result = await AssessmentReportService.updateAssessmentReport(assessmentId, data);
    res.status(200).json({ 
      success: true, 
      message: "Report berhasil diupdate", 
      data: result, 
    });
  })
}