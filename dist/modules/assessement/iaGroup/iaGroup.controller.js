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
exports.IAGroupController = void 0;
const iaGroup_service_1 = require("./iaGroup.service");
const async_handler_1 = require("../../../common/async.handler");
class IAGroupController {
}
exports.IAGroupController = IAGroupController;
_a = IAGroupController;
IAGroupController.createIAGroup = (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const iaGroup = yield iaGroup_service_1.IAGroupService.createIAGroup(req.body);
    res.status(201).json({ success: true, message: 'Group IA berhasil dibuat', data: iaGroup });
}));
