import { Request, Response } from "express";
import { ScheduleService } from "./schedule.service";
import ExcelJS from 'exceljs';
import { Readable } from "stream";

export class ScheduleController {
    private scheduleService: ScheduleService;

    constructor() {
        this.scheduleService = new ScheduleService();
    }

    async createSchedule(req: Request, res: Response) {
        try {
            const schedule = await this.scheduleService.createSchedule(req.body);

            res.status(201).json({
                success: true,
                message: 'Jadwal berhasil dibuat',
                data: schedule
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getSchedules(req: Request, res: Response) {
        try {
            const schedules = await this.scheduleService.getSchedules();

            if (!schedules) {
                return res.status(404).json({
                    success: false,
                    message: 'Tidak ada jadwal ditemukan',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Jadwal berhasil diambil',
                data: schedules
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getScheduleById(req: Request, res: Response) {
        try {
            const schedule = await this.scheduleService.getScheduleById(Number(req.params.id));

            if (!schedule) {
                return res.status(404).json({
                    success: false,
                    message: `Jadwal dengan id ${req.params.id} tidak ditemukan`,
                });
            }

            res.status(200).json({
                success: true,
                message: 'Jadwal berhasil diambil',
                data: schedule
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getActiveSchedules(req: Request, res: Response) {
        try {
            const schedules = await this.scheduleService.getActiveSchedules();

            if (!schedules || schedules.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Tidak ada jadwal aktif ditemukan',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Jadwal aktif berhasil diambil',
                data: schedules
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getCompletedSchedules(req: Request, res: Response) {
        try {
            const schedules = await this.scheduleService.getCompletedSchedules();

            if (!schedules || schedules.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Tidak ada jadwal yang selesai ditemukan',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Jadwal yang selesai berhasil diambil',
                data: schedules
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getCompletedSchedulesByAssesseeId(req: Request, res: Response) {
        try {
            const schedules = await this.scheduleService.getCompletedSchedulesByAssesseeId(Number(req.params.assesseeId));

            if (!schedules || schedules.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Tidak ada jadwal yang selesai ditemukan untuk assessee dengan id ${req.params.assesseeId}`,
                });
            }

            res.status(200).json({
                success: true,
                message: 'Jadwal yang selesai berhasil diambil',
                data: schedules
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    async exportScheduleToExcel(req: Request, res: Response) {
        try {
            const scheduleData = await this.scheduleService.getScheduleDataForExcel();

            if (!scheduleData?.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Tidak ada jadwal ditemukan untuk diekspor',
                });
            }

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
        } catch (err: any) {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
}