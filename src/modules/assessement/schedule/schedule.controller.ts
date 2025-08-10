import { Request, Response } from "express";
import { ScheduleService } from "./schedule.service";

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
}