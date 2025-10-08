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
const assessment_service_1 = require("../assessement/assessment.service");
const apl_02_service_1 = require("../assessement/apl-02/apl-02.service");
const assessor_service_1 = require("../assessor/assessor.service");
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
    const schedule = yield schedule_service_1.ScheduleService.getScheduleById(Number(req.params.id));
    res.status(200).json({
        success: true,
        message: 'Jadwal berhasil diambil',
        data: schedule
    });
}));
ScheduleController.updateSchedule = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'ID jadwal harus diisi',
        });
    }
    const body = req.body;
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
    const schedule = yield schedule_service_1.ScheduleService.updateSchedule(id, body);
    res.status(200).json({
        success: true,
        message: 'Jadwal berhasil diupdate',
        data: schedule
    });
}));
ScheduleController.deleteSchedule = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'ID jadwal harus diisi',
        });
    }
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
ScheduleController.getScheduleDetailById = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'ID jadwal harus diisi',
        });
    }
    const schedule = yield schedule_service_1.ScheduleService.getScheduleDetailById(id);
    if (schedule) {
        res.status(200).json({
            success: true,
            message: 'Detail jadwal berhasil diambil',
            data: schedule
        });
    }
    else {
        res.status(404).json({
            success: false,
            message: 'Detail jadwal tidak ditemukan',
        });
    }
}));
ScheduleController.generateLetterAssignment = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type } = req.query;
        const body = req.body;
        let letter;
        let filename = '';
        if (type !== 'assessor') {
            // letter = await ScheduleService.generateLetterAssignment({
            //     ...body,
            //     type: type as 'assignments' | 'verifications'
            // });
            // if(type === 'verifications') {
            //     filename = `Surat Tugas Verifikasi TUK dan PraUK_${body.location || 'Jakarta'}`;
            // } else if(type === 'assignments') {
            //     filename = `Surat Tugas Asesor_${body.location || 'Jakarta'}`;
            // }
            // filename = `Surat Tugas Verifikasi TUK dan PraUK_${body.location || 'Jakarta'}`;
            res.status(400).json({
                success: false,
                message: "Tipe surat tugas sedang dalam pengembangan. Gunakan 'assessor' untuk tipe surat tugas asesor.",
            });
        }
        else if (type === 'assessor') {
            const schedule_detail_id = Number(body.schedule_detail_id);
            const data_schedule_detail = yield schedule_service_1.ScheduleService.getScheduleDetailById(schedule_detail_id);
            if (!data_schedule_detail) {
                return res.status(404).json({
                    success: false,
                    message: "Jadwal assessment tidak ditemukan"
                });
            }
            const data_schedule = yield schedule_service_1.ScheduleService.getScheduleById(data_schedule_detail.schedule_id);
            if (!data_schedule) {
                return res.status(404).json({
                    success: false,
                    message: "Jadwal assessment tidak ditemukan"
                });
            }
            const assessor_id = Number(data_schedule_detail.assessor_id);
            const data_assessor = yield assessor_service_1.AssessorService.getAssessorById(assessor_id);
            if (!data_assessor) {
                return res.status(404).json({
                    success: false,
                    message: "Asesor tidak ditemukan"
                });
            }
            const assessment_id = Number(data_schedule.assessment.id);
            const data_assessment = yield assessment_service_1.AssessmentService.getAssessmentById(assessment_id);
            if (!data_assessment) {
                return res.status(404).json({
                    success: false,
                    message: "Assessment tidak ditemukan"
                });
            }
            const data_result = yield apl_02_service_1.APL02Service.getUnitsWithoutResult(assessment_id);
            if (!data_result) {
                return res.status(404).json({
                    success: false,
                    message: "Hasil assessment tidak ditemukan"
                });
            }
            letter = yield schedule_service_1.ScheduleService.generateLetterAssignmentAssessor(data_assessment, data_schedule, data_schedule_detail, data_assessor, data_result, body);
            filename = `Surat Tugas Asesor_${data_assessor.name}`;
        }
        else {
            res.status(400).json({
                success: false,
                message: "Tipe surat tugas tidak valid. Gunakan 'assignments', 'verifications', atau 'assessor'."
            });
            return;
        }
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}.pdf"`);
        res.send(Buffer.from(letter));
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan dalam menghasilkan PDF",
            error: error.message
        });
    }
}));
