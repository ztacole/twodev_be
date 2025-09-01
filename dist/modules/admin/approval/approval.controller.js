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
exports.ApprovalController = void 0;
const approval_services_1 = require("./approval.services");
exports.ApprovalController = {
    approveApl01(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("REQ BODY:", req.body);
                const user = req.user;
                const { docId } = req.body;
                const result = yield approval_services_1.ApprovalService.approveApl01Document(Number(docId), user);
                res.json({
                    success: true,
                    message: 'Dokumen APL-01 approved',
                    data: result
                });
            }
            catch (error) {
                res.status(403).json({
                    success: false,
                    message: error.message || 'Gagal approve dokumen APL-01'
                });
            }
        });
    },
    approveCompetency(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { resultId } = req.body;
                yield approval_services_1.ApprovalService.approveCompetency(Number(resultId), user);
                res.json({ success: true, message: 'Kompetensi approved' });
            }
            catch (error) {
                res.status(403).json({
                    success: false,
                    message: error.message || 'Gagal approve kompetensi'
                });
            }
        });
    }
};
