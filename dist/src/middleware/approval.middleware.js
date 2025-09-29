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
exports.requireApproval = requireApproval;
const drizzle_1 = require("../config/drizzle");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
function requireApproval(targetTable) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
        try {
            const user = req.user;
            const admin = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, user.id) });
            if (!admin)
                return res.status(403).json({ success: false, message: 'Hanya admin yang dapat melakukan aksi ini' });
            const method = req.method.toUpperCase();
            const isMutating = method === 'PUT' || method === 'PATCH' || method === 'DELETE';
            if (!isMutating)
                return next();
            const body = req.body || {};
            const params = req.params || {};
            const query = req.query || {};
            const headers = req.headers || {};
            const approverAdminRaw = (_f = (_e = (_d = (_c = (_b = (_a = body.approverAdminId) !== null && _a !== void 0 ? _a : body.approver_admin_id) !== null && _b !== void 0 ? _b : params.approverAdminId) !== null && _c !== void 0 ? _c : params.approver_admin_id) !== null && _d !== void 0 ? _d : query.approverAdminId) !== null && _e !== void 0 ? _e : query.approver_admin_id) !== null && _f !== void 0 ? _f : headers['x-approver-admin-id'];
            const secondApproverAdminRaw = (_m = (_l = (_k = (_j = (_h = (_g = body.secondApproverAdminId) !== null && _g !== void 0 ? _g : body.second_approver_admin_id) !== null && _h !== void 0 ? _h : params.secondApproverAdminId) !== null && _j !== void 0 ? _j : params.second_approver_admin_id) !== null && _k !== void 0 ? _k : query.secondApproverAdminId) !== null && _l !== void 0 ? _l : query.second_approver_admin_id) !== null && _m !== void 0 ? _m : headers['x-second-approver-admin-id'];
            let comment = (_q = (_p = (_o = body.comment) !== null && _o !== void 0 ? _o : params.comment) !== null && _p !== void 0 ? _p : query.comment) !== null && _q !== void 0 ? _q : headers['x-approval-comment'];
            const targetId = Number((_y = (_w = (_u = (_s = (_r = req.params.id) !== null && _r !== void 0 ? _r : req.body.id) !== null && _s !== void 0 ? _s : (_t = req.params) === null || _t === void 0 ? void 0 : _t.assessmentId) !== null && _u !== void 0 ? _u : (_v = req.params) === null || _v === void 0 ? void 0 : _v.assessment_id) !== null && _w !== void 0 ? _w : (_x = req.body) === null || _x === void 0 ? void 0 : _x.assessmentId) !== null && _y !== void 0 ? _y : (_z = req.body) === null || _z === void 0 ? void 0 : _z.assessment_id);
            if (!Number.isFinite(targetId) || targetId <= 0) {
                return res.status(400).json({ success: false, message: 'Target id wajib diisi dan valid' });
            }
            if (!approverAdminRaw || Number(approverAdminRaw) === admin.id) {
                return res.status(400).json({ success: false, message: 'Pilih admin lain sebagai approver pertama' });
            }
            if (!secondApproverAdminRaw || Number(secondApproverAdminRaw) === admin.id || Number(secondApproverAdminRaw) === Number(approverAdminRaw)) {
                return res.status(400).json({ success: false, message: 'Pilih admin lain (berbeda) sebagai approver kedua' });
            }
            // Validate approver existence in admin table to avoid FK constraint errors
            const firstApprover = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.id, Number(approverAdminRaw)) });
            if (!firstApprover) {
                return res.status(400).json({ success: false, message: 'Approver pertama tidak ditemukan (admin.id tidak valid)' });
            }
            const secondApprover = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.id, Number(secondApproverAdminRaw)) });
            if (!secondApprover) {
                return res.status(400).json({ success: false, message: 'Approver kedua tidak ditemukan (admin.id tidak valid)' });
            }
            // For occupation update with multipart, capture temp file info to move on approve
            if (req.file && targetTable === 'occupation' && method !== 'DELETE') {
                try {
                    const existing = comment ? JSON.parse(String(comment)) : {};
                    const merged = Object.assign(Object.assign({}, existing), { tempFilePath: req.file.path, tempDestination: req.file.destination, tempFileName: req.file.filename, name: (_0 = body.name) !== null && _0 !== void 0 ? _0 : existing.name, scheme_id: body.scheme_id ? Number(body.scheme_id) : existing.scheme_id });
                    comment = JSON.stringify(merged);
                }
                catch (_1) {
                    comment = JSON.stringify({ tempFilePath: req.file.path, tempDestination: req.file.destination, tempFileName: req.file.filename, name: body.name, scheme_id: body.scheme_id ? Number(body.scheme_id) : undefined });
                }
            }
            const insertResult = yield drizzle_1.db.insert(schema_1.approvalRequest).values({
                requester_admin_id: admin.id,
                approver_admin_id: Number(approverAdminRaw),
                second_approver_admin_id: Number(secondApproverAdminRaw),
                target_table: targetTable,
                target_id: targetId,
                action: method === 'DELETE' ? 'delete' : 'update',
                status: 'pending',
                comment: comment !== null && comment !== void 0 ? comment : null,
            }).execute();
            const createdId = Number(insertResult === null || insertResult === void 0 ? void 0 : insertResult.insertId);
            let created = null;
            if (Number.isFinite(createdId) && createdId > 0) {
                created = yield drizzle_1.db.query.approvalRequest.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, createdId) });
            }
            else {
                created = yield drizzle_1.db.query.approvalRequest.findFirst({
                    where: (t, { and, eq: _eq }) => and(_eq(t.requester_admin_id, admin.id), _eq(t.approver_admin_id, Number(approverAdminRaw)), _eq(t.target_table, targetTable), _eq(t.target_id, targetId), _eq(t.status, 'pending')),
                });
            }
            return res.status(202).json({ success: true, message: 'Menunggu persetujuan admin lain', data: created });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || 'Gagal membuat approval request' });
        }
    });
}
