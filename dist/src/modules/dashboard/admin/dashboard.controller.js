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
exports.DashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
class DashboardController {
    static getSummary(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield dashboard_service_1.DashboardService.getSummary();
                return res.status(200).json({
                    success: true,
                    message: 'Data summary dashboard berhasil diambil',
                    data,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    static getSchedules(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield dashboard_service_1.DashboardService.getSchedules();
                return res.status(200).json({
                    success: true,
                    message: 'Data jadwal assessment berhasil diambil',
                    data,
                });
            }
            catch (error) {
                return res.status(error.statusCode || 500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    static getVerificationDocs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield dashboard_service_1.DashboardService.getVerificationDocs();
                return res.status(200).json({
                    success: true,
                    message: 'Data verifikasi dokumen berhasil diambil',
                    data,
                });
            }
            catch (error) {
                return res.status(error.statusCode || 500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    static getDashboardData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield dashboard_service_1.DashboardService.getDashboardData();
                return res.status(200).json({
                    success: true,
                    message: 'Data dashboard berhasil diambil',
                    data,
                });
            }
            catch (error) {
                return res.status(error.statusCode || 500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
}
exports.DashboardController = DashboardController;
