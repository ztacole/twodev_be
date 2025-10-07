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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
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
            let comment = (_j = (_h = (_g = body.comment) !== null && _g !== void 0 ? _g : params.comment) !== null && _h !== void 0 ? _h : query.comment) !== null && _j !== void 0 ? _j : headers['x-approval-comment'];
            const targetId = Number((_s = (_q = (_o = (_l = (_k = req.params.id) !== null && _k !== void 0 ? _k : req.body.id) !== null && _l !== void 0 ? _l : (_m = req.params) === null || _m === void 0 ? void 0 : _m.assessmentId) !== null && _o !== void 0 ? _o : (_p = req.params) === null || _p === void 0 ? void 0 : _p.assessment_id) !== null && _q !== void 0 ? _q : (_r = req.body) === null || _r === void 0 ? void 0 : _r.assessmentId) !== null && _s !== void 0 ? _s : (_t = req.body) === null || _t === void 0 ? void 0 : _t.assessment_id);
            if (!Number.isFinite(targetId) || targetId <= 0) {
                return res.status(400).json({ success: false, message: 'Target id wajib diisi dan valid' });
            }
            const approverAdminId = Number(approverAdminRaw);
            if (!approverAdminId || approverAdminId === admin.id) {
                return res.status(400).json({ success: false, message: 'Pilih admin lain sebagai approver' });
            }
            const firstApprover = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.id, approverAdminId) });
            if (!firstApprover) {
                return res.status(400).json({ success: false, message: 'Approver pertama tidak ditemukan (admin.id tidak valid)' });
            }
            if (!firstApprover.can_approve) {
                return res.status(400).json({ success: false, message: 'Approver ini tidak memiliki izin approve' });
            }
            if (req.file && targetTable === 'occupation' && method !== 'DELETE') {
                try {
                    const existing = comment ? JSON.parse(String(comment)) : {};
                    const merged = Object.assign(Object.assign({}, existing), { tempFilePath: req.file.path, tempDestination: req.file.destination, tempFileName: req.file.filename, name: (_u = body.name) !== null && _u !== void 0 ? _u : existing.name, scheme_id: body.scheme_id ? Number(body.scheme_id) : existing.scheme_id });
                    comment = JSON.stringify(merged);
                }
                catch (_y) {
                    comment = JSON.stringify({ tempFilePath: req.file.path, tempDestination: req.file.destination, tempFileName: req.file.filename, name: body.name, scheme_id: body.scheme_id ? Number(body.scheme_id) : undefined });
                }
            }
            let targetName = null;
            try {
                switch (targetTable) {
                    case 'user': {
                        const u = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, targetId) });
                        targetName = (_v = u === null || u === void 0 ? void 0 : u.full_name) !== null && _v !== void 0 ? _v : null;
                        break;
                    }
                    case 'occupation': {
                        const o = yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, targetId) });
                        targetName = (_w = o === null || o === void 0 ? void 0 : o.name) !== null && _w !== void 0 ? _w : null;
                        break;
                    }
                    case 'scheme': {
                        const s = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, targetId) });
                        targetName = s ? (s.code || s.name) : null;
                        break;
                    }
                    case 'assessment': {
                        const a = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, targetId) });
                        targetName = (_x = a === null || a === void 0 ? void 0 : a.code) !== null && _x !== void 0 ? _x : null;
                        break;
                    }
                    case 'schedule': {
                        const sch = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, targetId) });
                        targetName = sch ? `Schedule-${targetId}` : null;
                        break;
                    }
                    default:
                        targetName = null;
                }
            }
            catch (_z) { }
            const insertResult = yield drizzle_1.db.insert(schema_1.approvalRequest).values({
                requester_admin_id: admin.id,
                approver_admin_id: approverAdminId,
                target_table: targetTable,
                target_id: targetId,
                target_name: targetName !== null && targetName !== void 0 ? targetName : null,
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
                    where: (t, { and, eq: _eq }) => and(_eq(t.requester_admin_id, admin.id), _eq(t.approver_admin_id, approverAdminId), _eq(t.target_table, targetTable), _eq(t.target_id, targetId), _eq(t.status, 'pending')),
                });
            }
            return res.status(202).json({ success: true, message: 'Menunggu persetujuan admin lain', data: created });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || 'Gagal membuat approval request' });
        }
    });
}
