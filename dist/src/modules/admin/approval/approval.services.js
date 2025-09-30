"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.ApprovalService = void 0;
const drizzle_1 = require("../../../config/drizzle");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
exports.ApprovalService = {
    approveApl01Document(docId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield drizzle_1.db.query.admin.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, user.id),
            });
            if (!admin) {
                throw new Error("Hanya admin yang dapat melakukan approval dokumen APL-01");
            }
            yield drizzle_1.db.update(schema_1.resultDoc).set({ approved: true }).where((0, drizzle_orm_1.eq)(schema_1.resultDoc.id, docId));
            const resultDoc = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.id, docId) });
            return resultDoc;
        });
    },
    approveCompetency(resultId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.role_id !== 1) {
                throw new Error("Hanya admin yang dapat melakukan approval kompetensi");
            }
            yield drizzle_1.db.update(schema_1.result).set({ is_competent: true }).where((0, drizzle_orm_1.eq)(schema_1.result.id, resultId));
        });
    },
    createApprovalRequest(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const requester = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, input.user.id) });
            if (!requester)
                throw new Error("Hanya admin yang dapat membuat approval request");
            if (!input.approverAdminId || input.approverAdminId === requester.id) {
                throw new Error("Pilih admin lain sebagai approver pertama");
            }
            if (!input.secondApproverAdminId || input.secondApproverAdminId === requester.id || input.secondApproverAdminId === input.approverAdminId) {
                throw new Error("Pilih admin lain (berbeda) sebagai approver kedua");
            }
            const insertResult = yield drizzle_1.db.insert(schema_1.approvalRequest).values({
                requester_admin_id: requester.id,
                approver_admin_id: input.approverAdminId,
                second_approver_admin_id: input.secondApproverAdminId,
                target_table: input.targetTable,
                target_id: input.targetId,
                action: input.action,
                status: 'pending',
                comment: (_a = input.comment) !== null && _a !== void 0 ? _a : null,
                approved_at: null,
                approved_by_first_at: null,
                approved_by_second_at: null,
            }).execute();
            const created = yield drizzle_1.db.query.approvalRequest.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, Number(insertResult.insertId)),
            });
            return created;
        });
    },
    listApprovalRequests(user_1) {
        return __awaiter(this, arguments, void 0, function* (user, scope = 'all') {
            const admin = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, user.id) });
            if (!admin)
                throw new Error("Hanya admin yang dapat melihat approval request");
            if (scope === 'requested-by-me') {
                return yield drizzle_1.db.query.approvalRequest.findMany({
                    where: (tbl, { eq: _eq }) => _eq(tbl.requester_admin_id, admin.id),
                    orderBy: (tbl, { desc }) => desc(tbl.created_at),
                });
            }
            if (scope === 'to-approve') {
                return yield drizzle_1.db.query.approvalRequest.findMany({
                    where: (tbl, { or, and, eq: _eq, not: _not }) => or(and(_eq(tbl.approver_admin_id, admin.id), _eq(tbl.status, 'pending'), _eq(tbl.approved_by_first, false)), and(_eq(tbl.second_approver_admin_id, admin.id), _eq(tbl.status, 'pending'), _eq(tbl.approved_by_second, false))),
                    orderBy: (tbl, { desc }) => desc(tbl.created_at),
                });
            }
            return yield drizzle_1.db.query.approvalRequest.findMany({
                where: (tbl, { or, eq: _eq }) => or(_eq(tbl.requester_admin_id, admin.id), _eq(tbl.approver_admin_id, admin.id), _eq(tbl.second_approver_admin_id, admin.id)),
                orderBy: (tbl, { desc }) => desc(tbl.created_at),
            });
        });
    },
    resolveApprovalRequest(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const admin = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, input.user.id) });
            if (!admin)
                throw new Error("Hanya admin yang dapat memproses approval request");
            const request = yield drizzle_1.db.query.approvalRequest.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id) });
            if (!request)
                throw new Error("Approval request tidak ditemukan");
            if (request.status === 'rejected' || request.status === 'approved')
                throw new Error("Approval request sudah diproses");
            const isFirstApprover = request.approver_admin_id === admin.id;
            const isSecondApprover = request.second_approver_admin_id === admin.id;
            if (!isFirstApprover && !isSecondApprover)
                throw new Error("Anda bukan approver untuk request ini");
            if (input.decision === 'approved') {
                if (isFirstApprover && !request.approved_by_first) {
                    yield drizzle_1.db.update(schema_1.approvalRequest).set({
                        approved_by_first: true,
                        approved_by_first_at: new Date(),
                        comment: (_a = input.comment) !== null && _a !== void 0 ? _a : request.comment,
                    }).where((0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id)).execute();
                }
                if (isSecondApprover && !request.approved_by_second) {
                    yield drizzle_1.db.update(schema_1.approvalRequest).set({
                        approved_by_second: true,
                        approved_by_second_at: new Date(),
                        comment: (_b = input.comment) !== null && _b !== void 0 ? _b : request.comment,
                    }).where((0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id)).execute();
                }
                const refreshed = yield drizzle_1.db.query.approvalRequest.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id) });
                if (!refreshed)
                    throw new Error("Approval request tidak ditemukan setelah update");
                const bothApproved = Boolean(refreshed.approved_by_first) && Boolean(refreshed.approved_by_second);
                if (!bothApproved) {
                    yield drizzle_1.db.update(schema_1.approvalRequest).set({ status: 'pending' }).where((0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id)).execute();
                    return yield drizzle_1.db.query.approvalRequest.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id) });
                }
                const action = (refreshed.action || '').toLowerCase();
                const targetTable = (refreshed.target_table || '').toLowerCase();
                const targetId = refreshed.target_id;
                const applyUpdate = (commentRaw) => __awaiter(this, void 0, void 0, function* () {
                    if (!commentRaw)
                        return;
                    let changes = null;
                    try {
                        const parsed = JSON.parse(commentRaw);
                        changes = parsed && typeof parsed === 'object' && parsed.changes ? parsed.changes : parsed;
                    }
                    catch ( /* ignore parse error */_a) { /* ignore parse error */ }
                    if (!changes || typeof changes !== 'object')
                        return;
                    switch (targetTable) {
                        case 'user':
                            yield drizzle_1.db.update(schema_1.user).set(changes).where((0, drizzle_orm_1.eq)(schema_1.user.id, targetId)).execute();
                            break;
                        case 'occupation': {
                            // Move uploaded temp file to final location if present in comment JSON
                            const tempFilePath = changes.tempFilePath;
                            const tempDestination = changes.tempDestination;
                            const tempFileName = changes.tempFileName;
                            const schemeId = changes.scheme_id;
                            const name = changes.name;
                            const updateFields = Object.assign({}, changes);
                            delete updateFields.tempFilePath;
                            delete updateFields.tempDestination;
                            delete updateFields.tempFileName;
                            yield drizzle_1.db.update(schema_1.occupation).set(updateFields).where((0, drizzle_orm_1.eq)(schema_1.occupation.id, targetId)).execute();
                            if (tempFilePath && schemeId && name) {
                                const { default: fs } = yield Promise.resolve().then(() => __importStar(require('fs')));
                                const { default: path } = yield Promise.resolve().then(() => __importStar(require('path')));
                                const clean = (s) => s.toString().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\-]/g, '');
                                const cleanName = clean(name);
                                const targetDir = path.join(__dirname, `../../../public/uploads/occupations/${targetId}_${schemeId}_${cleanName}`);
                                if (!fs.existsSync(targetDir))
                                    fs.mkdirSync(targetDir, { recursive: true });
                                const finalPath = path.join(targetDir, `${cleanName}.pdf`);
                                try {
                                    fs.renameSync(tempFilePath, finalPath);
                                }
                                catch (_b) {
                                    try {
                                        fs.copyFileSync(tempFilePath, finalPath);
                                        fs.unlinkSync(tempFilePath);
                                    }
                                    catch (_c) { }
                                }
                            }
                            break;
                        }
                        default:
                            break;
                    }
                });
                const applyDelete = () => __awaiter(this, void 0, void 0, function* () {
                    switch (targetTable) {
                        case 'user':
                            yield drizzle_1.db.delete(schema_1.user).where((0, drizzle_orm_1.eq)(schema_1.user.id, targetId)).execute();
                            break;
                        default:
                            break;
                    }
                });
                if (action === 'update') {
                    yield applyUpdate(refreshed.comment);
                }
                else if (action === 'delete') {
                    yield applyDelete();
                }
            }
            const current = yield drizzle_1.db.query.approvalRequest.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id) });
            const bothApprovedNow = current && current.approved_by_first && current.approved_by_second;
            if (input.decision === 'rejected') {
                yield drizzle_1.db.update(schema_1.approvalRequest).set({
                    status: 'rejected',
                    comment: (_c = input.comment) !== null && _c !== void 0 ? _c : request.comment,
                }).where((0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id)).execute();
            }
            else if (bothApprovedNow) {
                yield drizzle_1.db.update(schema_1.approvalRequest).set({
                    status: 'approved',
                    comment: (_d = input.comment) !== null && _d !== void 0 ? _d : request.comment,
                    approved_at: new Date(),
                }).where((0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id)).execute();
            }
            else {
                yield drizzle_1.db.update(schema_1.approvalRequest).set({ status: 'pending' }).where((0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id)).execute();
            }
            const updated = yield drizzle_1.db.query.approvalRequest.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id) });
            return updated;
        });
    },
};
