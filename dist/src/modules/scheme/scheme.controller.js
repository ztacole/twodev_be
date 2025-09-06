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
exports.SchemeController = void 0;
const scheme_service_1 = require("./scheme.service");
const async_handler_1 = require("../../common/async.handler");
class SchemeController {
}
exports.SchemeController = SchemeController;
SchemeController.createScheme = (0, async_handler_1.asyncHandler)(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const scheme = yield scheme_service_1.SchemeService.createScheme(req.body);
        res.status(201).json({
            success: true,
            message: 'Skema berhasil dibuat',
            data: scheme,
        });
    });
});
SchemeController.getSchemes = (0, async_handler_1.asyncHandler)(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const schemes = yield scheme_service_1.SchemeService.getSchemes();
        res.json({
            success: true,
            message: 'Skema berhasil diambil',
            data: schemes,
        });
    });
});
SchemeController.getSchemeById = (0, async_handler_1.asyncHandler)(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const scheme = yield scheme_service_1.SchemeService.getSchemeById(Number(req.params.id));
        res.json({
            success: true,
            message: 'Skema berhasil diambil',
            data: scheme,
        });
    });
});
SchemeController.updateScheme = (0, async_handler_1.asyncHandler)(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const scheme = yield scheme_service_1.SchemeService.updateScheme(Number(req.params.id), req.body);
        res.json({
            success: true,
            message: 'Skema berhasil diperbarui',
            data: scheme,
        });
    });
});
SchemeController.deleteScheme = (0, async_handler_1.asyncHandler)(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const scheme = yield scheme_service_1.SchemeService.deleteScheme(Number(req.params.id));
        res.json({
            success: true,
            message: 'Skema berhasil dihapus',
        });
    });
});
SchemeController.exportSchemesToExcel = (0, async_handler_1.asyncHandler)(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const buffer = yield scheme_service_1.SchemeService.exportSchemesToExcel();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=schemes.xlsx');
        res.send(buffer);
    });
});
