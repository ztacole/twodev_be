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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleController = void 0;
const schedule_service_1 = require("./schedule.service");
const exceljs_1 = __importDefault(require("exceljs"));
const async_handler_1 = require("../../common/async.handler");
class ScheduleController {
}
exports.ScheduleController = ScheduleController;
_a = ScheduleController;
ScheduleController.createSchedule = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schedule = yield schedule_service_1.ScheduleService.createSchedule(req.body);
    res.status(201).json({
        success: true,
        message: 'Jadwal berhasil dibuat',
        data: schedule
    });
}));
ScheduleController.getSchedules = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schedules = yield schedule_service_1.ScheduleService.getSchedules();
    res.status(200).json({
        success: true,
        message: 'Jadwal berhasil diambil',
        data: schedules
    });
}));
ScheduleController.getScheduleById = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const schedule = yield schedule_service_1.ScheduleService.getScheduleById(Number(req.params.id), user);
    res.status(200).json({
        success: true,
        message: 'Jadwal berhasil diambil',
        data: schedule
    });
}));
ScheduleController.deleteSchedule = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    yield schedule_service_1.ScheduleService.deleteSchedule(id);
    res.status(200).json({
        success: true,
        message: 'Jadwal berhasil dihapus',
    });
}));
ScheduleController.getActiveSchedules = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const schedules = yield schedule_service_1.ScheduleService.getActiveSchedules(user);
    res.status(200).json({
        success: true,
        message: 'Jadwal aktif berhasil diambil',
        data: schedules
    });
}));
ScheduleController.getActiveSchedulesAssessor = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const schedules = yield schedule_service_1.ScheduleService.getActiveSchedulesAssessor(user);
    res.status(200).json({
        success: true,
        message: 'Jadwal aktif berhasil diambil',
        data: schedules
    });
}));
ScheduleController.getCompletedSchedules = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const schedules = yield schedule_service_1.ScheduleService.getCompletedSchedules(user);
    res.status(200).json({
        success: true,
        message: 'Jadwal yang selesai berhasil diambil',
        data: schedules
    });
}));
ScheduleController.exportScheduleToExcel = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const scheduleData = yield schedule_service_1.ScheduleService.getScheduleDataForExcel();
    const workbook = new exceljs_1.default.Workbook();
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
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=jadwal_assessment.xlsx');
    yield workbook.xlsx.write(res);
    res.end();
}));
