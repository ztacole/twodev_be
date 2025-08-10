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
                message: 'Schedule created successfully',
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

            res.status(200).json({
                success: true,
                message: 'Schedules retrieved successfully',
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
                    message: 'Schedule not found',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Schedule retrieved successfully',
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

            res.status(200).json({
                success: true,
                message: 'Active schedules retrieved successfully',
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

            res.status(200).json({
                success: true,
                message: 'Completed schedules retrieved successfully',
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
            res.status(200).json({
                success: true,
                message: 'Completed schedules retrieved successfully',
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