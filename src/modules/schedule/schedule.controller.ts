import { Request, Response } from "express";
import { ScheduleService } from "./schedule.service";
import ExcelJS from 'exceljs';
import { asyncHandler } from "../../common/async.handler";
import { JwtPayload } from "jsonwebtoken";
import { LetterAssignmentRequest, updateScheduleRequest } from "./schedule.type";
import { AssessmentService } from "../assessement/assessment.service";
import { APL02Service } from "../assessement/apl-02/apl-02.service";
export class ScheduleController {
    static createSchedule = asyncHandler(async (req: Request, res: Response) => {
        const schedule = await ScheduleService.createSchedule(req.body);
        res.status(201).json({
            success: true,
            message: 'Jadwal berhasil dibuat',
            data: schedule
        });
    });

    static getSchedules = asyncHandler(async (req: Request, res: Response) => {
        const schedules = await ScheduleService.getSchedules();

        res.status(200).json({
            success: true,
            message: 'Jadwal berhasil diambil',
            data: schedules
        });
    });

    static getScheduleById = asyncHandler(async (req: Request, res: Response) => {
        const user = req.user as JwtPayload;
        const schedule = await ScheduleService.getScheduleById(Number(req.params.id), user);
        
        res.status(200).json({
            success: true,
            message: 'Jadwal berhasil diambil',
            data: schedule
        });
    });

    static updateSchedule = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID jadwal harus diisi',
            });
        }
        const body: updateScheduleRequest = req.body;
        if (!body.start_date) {
            return res.status(400).json({
                success: false,
                message: 'Tanggal mulai harus diisi',
            });
        }
        if (!body.end_date) {
            return res.status(400).json({
                success: false,
                message: 'Tanggal selesai harus diisi',
            });
        }
        const schedule = await ScheduleService.updateSchedule(id, body);
        res.status(200).json({
            success: true,
            message: 'Jadwal berhasil diupdate',
            data: schedule
        });
    });

    static deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID jadwal harus diisi',
            });
        }
        await ScheduleService.deleteSchedule(id);
        res.status(200).json({
            success: true,
            message: 'Jadwal berhasil dihapus',
        });
    });

    static getActiveSchedules = asyncHandler(async (req: Request, res: Response) => {
        const user = req.user as JwtPayload;
        const schedules = await ScheduleService.getActiveSchedules(user);
        
        res.status(200).json({
            success: true,
            message: 'Jadwal aktif berhasil diambil',
            data: schedules
        });
    });

    static getActiveSchedulesAssessor = asyncHandler(async (req: Request, res: Response) => {
        const user = req.user as JwtPayload;
        const schedules = await ScheduleService.getActiveSchedulesAssessor(user);
        
        res.status(200).json({
            success: true,
            message: 'Jadwal aktif berhasil diambil',
            data: schedules
        });
    });

    static getCompletedSchedules = asyncHandler(async (req: Request, res: Response) => {
        const user = req.user as JwtPayload;
        const schedules = await ScheduleService.getCompletedSchedules(user);
        
        res.status(200).json({
            success: true,
            message: 'Jadwal yang selesai berhasil diambil',
            data: schedules
        });
    });

    static exportScheduleToExcel = asyncHandler(async (req: Request, res: Response) => {
        const scheduleData = await ScheduleService.getScheduleDataForExcel();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Jadwal Assessment');

        const headerRow = worksheet.addRow([
            'ID', 'Skema', 'Okupasi', 'Tanggal Mulai', 'Tanggal Selesai'
        ]);
        headerRow.eachCell(cell => {
            cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE77D35' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        scheduleData.forEach(item => {
            const row = worksheet.addRow([
                item.assessment_id,
                item.scheme_code,
                item.occupation_name,
                item.start_date,
                item.end_date
            ]);
            row.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        worksheet.columns = [
            { width: 12 }, // ID
            { width: 18 }, // Skema
            { width: 35 }, // Okupasi
            { width: 22 }, // Tanggal Mulai
            { width: 22 }, // Tanggal Selesai
        ];

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=jadwal_assessment.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    });

    static generateLetterAssignment = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { type } = req.query;
            const body: LetterAssignmentRequest = req.body;
            const assessment_id = Number(req.body.assessment_id);
            const result_id = Number(req.body.result_id);            

            const data_assessment = await AssessmentService.getAssessmentById(assessment_id);
            if(!data_assessment) {
                return res.status(404).json({
                    success: false,
                    message: "Assessment tidak ditemukan"
                });
            }
            const data_result = await APL02Service.getUnitsAPL02(result_id);
            if(!data_result) {
                return res.status(404).json({
                    success: false,
                    message: "Hasil assessment tidak ditemukan"
                });
            }
        
            let letter: any;
            let filename = '';
            if (type !== 'assessor') {
                letter = await ScheduleService.generateLetterAssignment({
                    ...body,
                    type: type as 'assignments' | 'verifications'
                });

                if(type === 'verifications') {
                    filename = `Surat Tugas Verifikasi TUK dan PraUK_${body.location || 'Jakarta'}`;
                } else if(type === 'assignments') {
                    filename = `Surat Tugas Asesor_${body.location || 'Jakarta'}`;
                }
                filename = `Surat Tugas Verifikasi TUK dan PraUK_${body.location || 'Jakarta'}`;
            } else if(type === 'assessor') {
                letter = await ScheduleService.generateLetterAssignmentAssessor(data_assessment, data_result, body);
                filename = `Surat Tugas Asesor_${body.location || 'Jakarta'}`;
            } else {
                res.status(400).json({
                    success: false,
                    message: "Tipe surat tugas tidak valid. Gunakan 'assignments', 'verifications', atau 'assessor'."
                });
                return;
            }
        
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${filename}.pdf"`
            );
            res.send(Buffer.from(letter));
            } catch (error: any) {
            res.status(500).json({
                success: false,
                message: "Terjadi kesalahan dalam menghasilkan PDF",
                error: error.message
            });
        }
    });      
}