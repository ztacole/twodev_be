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
exports.AssesseeController = void 0;
const asseessee_service_1 = require("./asseessee.service");
const async_handler_1 = require("../../common/async.handler");
class AssesseeController {
}
exports.AssesseeController = AssesseeController;
_a = AssesseeController;
AssesseeController.createAssessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredFields = [
        'user_id', 'identity_number', 'birth_date', 'birth_location', 'gender',
        'nationality', 'phone_no', 'address', 'educational_qualifications'
    ];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                success: false,
                message: `Field ${field} diperlukan`,
            });
        }
    }
    const assessee = yield asseessee_service_1.AssesseeService.createAssessee(req.body);
    res.status(201).json({
        success: true,
        message: 'Data assessee berhasil dibuat',
        data: assessee,
    });
}));
AssesseeController.getAssessees = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assesses = yield asseessee_service_1.AssesseeService.getAssessees();
    res.json({
        success: true,
        message: 'Data assessee berhasil diambil',
        data: assesses,
    });
}));
AssesseeController.getAssesseeById = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessee = yield asseessee_service_1.AssesseeService.getAssesseeById(Number(req.params.id));
    res.json({
        success: true,
        message: 'Data assessee berhasil diambil',
        data: assessee,
    });
}));
AssesseeController.updateAssessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessee = yield asseessee_service_1.AssesseeService.updateAssessee(Number(req.params.id), req.body);
    res.json({
        success: true,
        message: 'Data assessee berhasil diubah',
        data: assessee,
    });
}));
AssesseeController.deleteAssessee = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield asseessee_service_1.AssesseeService.deleteAssessee(Number(req.params.id));
    res.json({
        success: true,
        message: 'Data assessee berhasil dihapus',
    });
}));
