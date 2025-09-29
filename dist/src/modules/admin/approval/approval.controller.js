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
    },
    createApprovalRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const user = req.user;
                const { targetTable, targetId, action } = req.body;
                const approverAdminRaw = (_a = req.body.approverAdminId) !== null && _a !== void 0 ? _a : req.body.approver_admin_id;
                const secondApproverAdminRaw = (_b = req.body.secondApproverAdminId) !== null && _b !== void 0 ? _b : req.body.second_approver_admin_id;
                const comment = (_c = req.body.comment) !== null && _c !== void 0 ? _c : null;
                const data = yield approval_services_1.ApprovalService.createApprovalRequest({
                    user,
                    approverAdminId: Number(approverAdminRaw),
                    secondApproverAdminId: Number(secondApproverAdminRaw),
                    targetTable,
                    targetId: Number(targetId),
                    action,
                    comment,
                });
                res.json({ success: true, message: 'Approval request created', data });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message || 'Gagal membuat approval request' });
            }
        });
    },
    approveRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const id = Number(req.params.id);
                const data = yield approval_services_1.ApprovalService.resolveApprovalRequest({ id, user, decision: 'approved' });
                res.json({ success: true, message: 'Approval request disetujui', data });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message || 'Gagal menyetujui approval request' });
            }
        });
    },
    rejectRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const user = req.user;
                const id = Number(req.params.id);
                const comment = (_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.comment) !== null && _b !== void 0 ? _b : null;
                const data = yield approval_services_1.ApprovalService.resolveApprovalRequest({ id, user, decision: 'rejected', comment });
                res.json({ success: true, message: 'Approval request ditolak', data });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message || 'Gagal menolak approval request' });
            }
        });
    },
    listApprovalRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const scopeParam = req.params.scope || req.query.scope || 'all';
                const scope = ['all', 'to-approve', 'requested-by-me'].includes(scopeParam) ? scopeParam : 'all';
                const data = yield approval_services_1.ApprovalService.listApprovalRequests(user, scope);
                res.json({ success: true, data });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message || 'Gagal mengambil daftar approval requests' });
            }
        });
    }
};
