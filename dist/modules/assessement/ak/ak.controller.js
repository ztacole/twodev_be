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
exports.AKController = void 0;
const async_handler_1 = require("../../../common/async.handler");
const ak_service_1 = require("./ak.service");
class AKController {
}
exports.AKController = AKController;
_a = AKController;
// ========= AK01 Controllers =========
AKController.createAK01 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield ak_service_1.AKService.createAK01(data);
    res.status(201).json({
        success: true,
        message: 'AK01 created successfully',
        data: result
    });
}));
AKController.getAK01ById = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const result = yield ak_service_1.AKService.getAK01ById(id);
    res.status(200).json({
        success: true,
        message: 'AK01 retrieved successfully',
        data: result
    });
}));
AKController.getAK01ByResultId = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = parseInt(req.params.resultId);
    const result = yield ak_service_1.AKService.getAK01ByResultId(resultId);
    res.status(200).json({
        success: true,
        message: 'AK01 retrieved successfully',
        data: result
    });
}));
AKController.updateAK01 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const data = req.body;
    const result = yield ak_service_1.AKService.updateAK01(id, data);
    res.status(200).json({
        success: true,
        message: 'AK01 updated successfully',
        data: result
    });
}));
AKController.deleteAK01 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    yield ak_service_1.AKService.deleteAK01(id);
    res.status(200).json({
        success: true,
        message: 'AK01 deleted successfully'
    });
}));
// ========= AK02 Controllers =========
AKController.createAK02 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield ak_service_1.AKService.createAK02(data);
    res.status(201).json({
        success: true,
        message: 'AK02 created successfully',
        data: result
    });
}));
AKController.getAK02ById = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const result = yield ak_service_1.AKService.getAK02ById(id);
    res.status(200).json({
        success: true,
        message: 'AK02 retrieved successfully',
        data: result
    });
}));
AKController.getAK02ByResultId = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = parseInt(req.params.resultId);
    const result = yield ak_service_1.AKService.getAK02ByResultId(resultId);
    res.status(200).json({
        success: true,
        message: 'AK02 retrieved successfully',
        data: result
    });
}));
AKController.updateAK02 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const data = req.body;
    const result = yield ak_service_1.AKService.updateAK02(id, data);
    res.status(200).json({
        success: true,
        message: 'AK02 updated successfully',
        data: result
    });
}));
AKController.deleteAK02 = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    yield ak_service_1.AKService.deleteAK02(id);
    res.status(200).json({
        success: true,
        message: 'AK02 deleted successfully'
    });
}));
// ========= Combined Controllers =========
AKController.getAKByResultId = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultId = parseInt(req.params.resultId);
    const result = yield ak_service_1.AKService.getAKByResultId(resultId);
    res.status(200).json({
        success: true,
        message: 'AK data retrieved successfully',
        data: result
    });
}));
AKController.getAllAK = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield ak_service_1.AKService.getAllAK();
    res.status(200).json({
        success: true,
        message: 'All AK data retrieved successfully',
        data: result
    });
}));
