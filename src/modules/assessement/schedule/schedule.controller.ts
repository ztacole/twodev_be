import { Request, Response } from "express";
import { ScheduleService } from "./schedule.service";
import ExcelJS from 'exceljs';
import { asyncHandler } from "../../../common/async.handler";
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
        const schedule = await ScheduleService.getScheduleById(Number(req.params.id));
        
        res.status(200).json({
            success: true,
            message: 'Jadwal berhasil diambil',
            data: schedule
        });
    });

    static getActiveSchedules = asyncHandler(async (req: Request, res: Response) => {
        const schedules = await ScheduleService.getActiveSchedules();
        
        res.status(200).json({
            success: true,
            message: 'Jadwal aktif berhasil diambil',
            data: schedules
        });
    });

    static getCompletedSchedules = asyncHandler(async (req: Request, res: Response) => {
        const schedules = await ScheduleService.getCompletedSchedules();
        
        res.status(200).json({
            success: true,
            message: 'Jadwal yang selesai berhasil diambil',
            data: schedules
        });
    });

    static getCompletedSchedulesByAssesseeId = asyncHandler(async (req: Request, res: Response) => {
        const schedules = await ScheduleService.getCompletedSchedulesByAssesseeId(Number(req.params.assesseeId));
        
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
}