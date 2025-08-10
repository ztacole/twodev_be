"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleController = void 0;
const schedule_service_1 = require("./schedule.service");
class ScheduleController {
    constructor() {
        this.scheduleService = new schedule_service_1.ScheduleService();
    }
    createSchedule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schedule = yield this.scheduleService.createSchedule(req.body);
                res.status(201).json({
                    success: true,
                    message: 'Schedule created successfully',
                    data: schedule
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    getSchedules(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schedules = yield this.scheduleService.getSchedules();
                res.status(200).json({
                    success: true,
                    message: 'Schedules retrieved successfully',
                    data: schedules
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    getScheduleById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schedule = yield this.scheduleService.getScheduleById(Number(req.params.id));
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
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    getActiveSchedules(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schedules = yield this.scheduleService.getActiveSchedules();
                res.status(200).json({
                    success: true,
                    message: 'Active schedules retrieved successfully',
                    data: schedules
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    getCompletedSchedules(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schedules = yield this.scheduleService.getCompletedSchedules();
                res.status(200).json({
                    success: true,
                    message: 'Completed schedules retrieved successfully',
                    data: schedules
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    getCompletedSchedulesByAssesseeId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schedules = yield this.scheduleService.getCompletedSchedulesByAssesseeId(Number(req.params.assesseeId));
                res.status(200).json({
                    success: true,
                    message: 'Completed schedules retrieved successfully',
                    data: schedules
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
}
exports.ScheduleController = ScheduleController;
