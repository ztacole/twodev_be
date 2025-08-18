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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OccupationController = void 0;
const occupation_service_1 = require("./occupation.service");
const async_handler_1 = require("../../common/async.handler");
class OccupationController {
}
exports.OccupationController = OccupationController;
_a = OccupationController;
OccupationController.createOccupation = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const occupationData = req.body;
    const occupation = yield occupation_service_1.OccupationService.createOccupation(occupationData);
    res.status(201).json({
        success: true,
        message: 'Occupation berhasil dibuat',
        data: occupation,
    });
}));
OccupationController.getOccupations = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const occupations = yield occupation_service_1.OccupationService.getOccupations();
    res.json({
        success: true,
        message: 'Data occupation berhasil diambil',
        data: occupations,
    });
}));
OccupationController.getOccupationById = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const occupation = yield occupation_service_1.OccupationService.getOccupationById(Number(req.params.id));
    res.json({
        success: true,
        message: 'Data occupation berhasil diambil',
        data: occupation,
    });
}));
OccupationController.updateOccupation = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const occupation = yield occupation_service_1.OccupationService.updateOccupation(Number(req.params.id), req.body);
    res.json({
        success: true,
        message: 'Occupation berhasil diperbarui',
        data: occupation,
    });
}));
OccupationController.deleteOccupation = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const occupation = yield occupation_service_1.OccupationService.deleteOccupation(Number(req.params.id));
    res.json({
        success: true,
        message: 'Occupation berhasil dihapus',
    });
}));
OccupationController.exportOccupationsToExcel = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const buffer = yield occupation_service_1.OccupationService.exportOccupationsToExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=occupations.xlsx');
    res.send(buffer);
}));
