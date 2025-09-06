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
exports.AssessorDetailController = void 0;
const assessor_detail_service_1 = require("./assessor-detail.service");
const async_handler_1 = require("../../common/async.handler");
class AssessorDetailController {
}
exports.AssessorDetailController = AssessorDetailController;
_a = AssessorDetailController;
AssessorDetailController.getByAssessorId = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessorId = Number(req.params.assessorId);
    const detail = yield assessor_detail_service_1.AssessorDetailService.getByAssessorId(assessorId);
    res.json({ success: true, data: detail });
}));
AssessorDetailController.upsertByAssessorId = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessorId = Number(req.params.assessorId);
    const payload = req.body;
    const detail = yield assessor_detail_service_1.AssessorDetailService.upsertByAssessorId(assessorId, payload);
    res.json({ success: true, data: detail });
}));
