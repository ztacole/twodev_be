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
            yield drizzle_1.db
                .update(schema_1.resultDoc)
                .set({ admin_id: admin.id, approved: true })
                .where((0, drizzle_orm_1.eq)(schema_1.resultDoc.id, docId));
            const resultDoc = yield drizzle_1.db.query.resultDoc.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.id, docId),
            });
            return resultDoc;
        });
    },
    approveCompetency(resultId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.role_id !== 1) {
                throw new Error("Hanya admin yang dapat melakukan approval kompetensi");
            }
            yield drizzle_1.db
                .update(schema_1.result)
                .set({ is_competent: true })
                .where((0, drizzle_orm_1.eq)(schema_1.result.id, resultId));
        });
    },
    createApprovalRequest(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const requester = yield drizzle_1.db.query.admin.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, input.user.id),
            });
            if (!requester)
                throw new Error("Hanya admin yang dapat membuat approval request");
            if (!input.approverAdminId || input.approverAdminId === requester.id) {
                throw new Error("Pilih admin lain sebagai approver");
            }
            const approverExists = yield drizzle_1.db.query.admin.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.admin.id, input.approverAdminId),
            });
            if (!approverExists) {
                throw new Error("Approver tidak ditemukan (admin.id tidak valid)");
            }
            if (!approverExists.can_approve) {
                throw new Error("Approver ini tidak memiliki izin approve");
            }
            let targetName = null;
            const targetTableLower = (input.targetTable || "").toLowerCase();
            try {
                switch (targetTableLower) {
                    case "user": {
                        const u = yield drizzle_1.db.query.user.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema_1.user.id, input.targetId),
                        });
                        targetName = (_a = u === null || u === void 0 ? void 0 : u.full_name) !== null && _a !== void 0 ? _a : null;
                        break;
                    }
                    case "occupation": {
                        const o = yield drizzle_1.db.query.occupation.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, input.targetId),
                        });
                        targetName = (_b = o === null || o === void 0 ? void 0 : o.name) !== null && _b !== void 0 ? _b : null;
                        break;
                    }
                    case "scheme": {
                        const s = yield drizzle_1.db.query.scheme.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, input.targetId),
                        });
                        targetName = s ? s.code || s.name : null;
                        break;
                    }
                    case "assessment": {
                        const a = yield drizzle_1.db.query.assessment.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, input.targetId),
                        });
                        targetName = (_c = a === null || a === void 0 ? void 0 : a.code) !== null && _c !== void 0 ? _c : null;
                        break;
                    }
                    case "schedule": {
                        const sch = yield drizzle_1.db.query.assessmentSchedule.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, input.targetId),
                        });
                        if (sch) {
                            const asmt = yield drizzle_1.db.query.assessment.findFirst({
                                where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, sch.assessment_id),
                            });
                            const occ = asmt
                                ? yield drizzle_1.db.query.occupation.findFirst({
                                    where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, asmt.occupation_id),
                                })
                                : null;
                            const fmt = (d) => d instanceof Date
                                ? d.toISOString().slice(0, 10)
                                : new Date(d).toISOString().slice(0, 10);
                            const start = sch.start_date ? fmt(sch.start_date) : "";
                            const end = sch.end_date ? fmt(sch.end_date) : "";
                            targetName = `${(_d = occ === null || occ === void 0 ? void 0 : occ.name) !== null && _d !== void 0 ? _d : "Schedule"} — ${start} s/d ${end}`;
                        }
                        else {
                            targetName = null;
                        }
                        break;
                    }
                    case "assessee": {
                        const assessee = yield drizzle_1.db.query.assessee.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, input.targetId),
                        });
                        if (assessee) {
                            const user = yield drizzle_1.db.query.user.findFirst({
                                where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id),
                            });
                            targetName = (_e = user === null || user === void 0 ? void 0 : user.full_name) !== null && _e !== void 0 ? _e : null;
                        }
                        else {
                            targetName = null;
                        }
                        break;
                    }
                    default:
                        targetName = null;
                }
            }
            catch (_h) { }
            const availableApproversForBase = yield this.getAvailableApprovers();
            const autoBackupForBase = availableApproversForBase.find((a) => a.id !== input.approverAdminId && a.id !== requester.id);
            const backupIdForBase = (_f = autoBackupForBase === null || autoBackupForBase === void 0 ? void 0 : autoBackupForBase.id) !== null && _f !== void 0 ? _f : (requester.can_approve ? requester.id : null);
            yield drizzle_1.db
                .insert(schema_1.approvalRequest)
                .values({
                requester_admin_id: requester.id,
                approver_admin_id: input.approverAdminId,
                backup_admin_id: backupIdForBase,
                target_table: input.targetTable,
                target_id: input.targetId,
                target_name: targetName,
                action: input.action,
                status: "pending",
                comment: (_g = input.comment) !== null && _g !== void 0 ? _g : null,
                approved_at: null,
            })
                .execute();
            const created = yield drizzle_1.db.query.approvalRequest.findFirst({
                where: (tbl, { eq, and }) => and(eq(tbl.requester_admin_id, requester.id), eq(tbl.approver_admin_id, input.approverAdminId), eq(tbl.target_table, input.targetTable), eq(tbl.target_id, input.targetId), eq(tbl.action, input.action)),
                orderBy: (tbl, { desc }) => desc(tbl.created_at),
            });
            if (!created) {
                throw new Error("Gagal mengambil approval request yang baru dibuat");
            }
            return created;
        });
    },
    listApprovalRequests(user_1) {
        return __awaiter(this, arguments, void 0, function* (user, scope = "all") {
            const admin = yield drizzle_1.db.query.admin.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, user.id),
            });
            if (!admin)
                throw new Error("Hanya admin yang dapat melihat approval request");
            if (scope === "requested-by-me") {
                return yield drizzle_1.db.query.approvalRequest.findMany({
                    where: (tbl, { eq: _eq }) => _eq(tbl.requester_admin_id, admin.id),
                    orderBy: (tbl, { desc }) => desc(tbl.created_at),
                });
            }
            if (scope === "to-approve") {
                return yield drizzle_1.db.query.approvalRequest.findMany({
                    where: (tbl, { and, eq: _eq, or }) => and(or(_eq(tbl.approver_admin_id, admin.id), _eq(tbl.backup_admin_id, admin.id)), _eq(tbl.status, "pending")),
                    orderBy: (tbl, { desc }) => desc(tbl.created_at),
                });
            }
            return yield drizzle_1.db.query.approvalRequest.findMany({
                where: (tbl, { or, eq: _eq }) => or(_eq(tbl.requester_admin_id, admin.id), _eq(tbl.approver_admin_id, admin.id), _eq(tbl.backup_admin_id, admin.id)),
                orderBy: (tbl, { desc }) => desc(tbl.created_at),
            });
        });
    },
    resolveApprovalRequest(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const admin = yield drizzle_1.db.query.admin.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, input.user.id),
            });
            if (!admin)
                throw new Error("Hanya admin yang dapat memproses approval request");
            const request = yield drizzle_1.db.query.approvalRequest.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id),
            });
            if (!request)
                throw new Error("Approval request tidak ditemukan");
            if (request.status === "rejected" || request.status === "approved")
                throw new Error("Approval request sudah diproses");
            const isPrimaryApprover = request.approver_admin_id === admin.id;
            const isBackupApprover = request.backup_admin_id === admin.id;
            if (!isPrimaryApprover && !isBackupApprover) {
                throw new Error("Anda bukan approver untuk request ini");
            }
            if (input.decision === "approved") {
                yield drizzle_1.db
                    .update(schema_1.approvalRequest)
                    .set({
                    status: "approved",
                    approved_at: new Date(),
                    approved_by: admin.id,
                    comment: (_a = input.comment) !== null && _a !== void 0 ? _a : request.comment,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id))
                    .execute();
                const refreshed = yield drizzle_1.db.query.approvalRequest.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id),
                });
                if (!refreshed)
                    throw new Error("Approval request tidak ditemukan setelah update");
                const action = (refreshed.action || "").toLowerCase();
                const targetTable = (refreshed.target_table || "").toLowerCase();
                const targetId = refreshed.target_id;
                const applyUpdate = (commentRaw) => __awaiter(this, void 0, void 0, function* () {
                    if (!commentRaw)
                        return;
                    let changes = null;
                    try {
                        const parsed = JSON.parse(commentRaw);
                        changes =
                            parsed && typeof parsed === "object" && parsed.changes
                                ? parsed.changes
                                : parsed;
                    }
                    catch (_a) {
                        /* ignore parse error */
                    }
                    if (!changes || typeof changes !== "object")
                        return;
                    switch (targetTable) {
                        case "user":
                            yield drizzle_1.db
                                .update(schema_1.user)
                                .set(changes)
                                .where((0, drizzle_orm_1.eq)(schema_1.user.id, targetId))
                                .execute();
                            break;
                        case "occupation": {
                            const tempFilePath = changes.tempFilePath;
                            const tempDestination = changes.tempDestination;
                            const tempFileName = changes.tempFileName;
                            const schemeId = changes.scheme_id;
                            const name = changes.name;
                            const updateFields = Object.assign({}, changes);
                            delete updateFields.tempFilePath;
                            delete updateFields.tempDestination;
                            delete updateFields.tempFileName;
                            yield drizzle_1.db
                                .update(schema_1.occupation)
                                .set(updateFields)
                                .where((0, drizzle_orm_1.eq)(schema_1.occupation.id, targetId))
                                .execute();
                            if (tempFilePath && schemeId && name) {
                                const { default: fs } = yield Promise.resolve().then(() => __importStar(require("fs")));
                                const { default: path } = yield Promise.resolve().then(() => __importStar(require("path")));
                                const clean = (s) => s
                                    .toString()
                                    .toLowerCase()
                                    .replace(/\s+/g, "_")
                                    .replace(/[^a-z0-9_\-]/g, "");
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
                        case "user":
                            {
                                const existingUser = yield drizzle_1.db.query.user.findFirst({
                                    where: (0, drizzle_orm_1.eq)(schema_1.user.id, targetId),
                                });
                                if (!existingUser)
                                    return;
                                yield drizzle_1.db
                                    .delete(schema_1.user)
                                    .where((0, drizzle_orm_1.eq)(schema_1.user.id, targetId))
                                    .execute();
                                const afterDelete = yield drizzle_1.db.query.user.findFirst({
                                    where: (0, drizzle_orm_1.eq)(schema_1.user.id, targetId),
                                });
                                if (afterDelete) {
                                    throw new Error("Gagal menghapus user target");
                                }
                            }
                            break;
                        case "occupation": {
                            const occupation = yield drizzle_1.db.query.occupation.findFirst({
                                where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, targetId),
                            });
                            if (occupation) {
                                const { default: fs } = yield Promise.resolve().then(() => __importStar(require("fs")));
                                const { default: path } = yield Promise.resolve().then(() => __importStar(require("path")));
                                const clean = (s) => s
                                    .toString()
                                    .toLowerCase()
                                    .replace(/\s+/g, "_")
                                    .replace(/[^a-z0-9_\-]/g, "");
                                const cleanName = clean(occupation.name);
                                const filePath = path.join(__dirname, `../../../public/uploads/occupations/${occupation.id}_${occupation.scheme_id}_${cleanName}`);
                                if (fs.existsSync(filePath)) {
                                    const stat = fs.statSync(filePath);
                                    if (stat.isDirectory()) {
                                        fs.rmSync(filePath, { recursive: true, force: true });
                                    }
                                    else if (stat.isFile()) {
                                        fs.unlinkSync(filePath);
                                    }
                                }
                                yield drizzle_1.db
                                    .delete(schema_1.occupation)
                                    .where((0, drizzle_orm_1.eq)(schema_1.occupation.id, targetId))
                                    .execute();
                            }
                            break;
                        }
                        case "scheme": {
                            const scheme = yield drizzle_1.db.query.scheme.findFirst({
                                where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, targetId),
                            });
                            if (scheme) {
                                yield drizzle_1.db
                                    .delete(schema_1.scheme)
                                    .where((0, drizzle_orm_1.eq)(schema_1.scheme.id, targetId))
                                    .execute();
                            }
                            break;
                        }
                        case "schedule": {
                            const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({
                                where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, targetId),
                            });
                            if (schedule) {
                                yield drizzle_1.db
                                    .delete(schema_1.scheduleDetail)
                                    .where((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.schedule_id, targetId))
                                    .execute();
                                yield drizzle_1.db
                                    .delete(schema_1.assessmentSchedule)
                                    .where((0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, targetId))
                                    .execute();
                            }
                            break;
                        }
                        case "assessment": {
                            const assessment = yield drizzle_1.db.query.assessment.findFirst({
                                where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, targetId),
                            });
                            if (assessment) {
                                const schedules = yield drizzle_1.db.query.assessmentSchedule.findMany({
                                    where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.assessment_id, targetId),
                                });
                                for (const schedule of schedules) {
                                    yield drizzle_1.db
                                        .delete(schema_1.scheduleDetail)
                                        .where((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.schedule_id, schedule.id))
                                        .execute();
                                }
                                yield drizzle_1.db
                                    .delete(schema_1.assessmentSchedule)
                                    .where((0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.assessment_id, targetId))
                                    .execute();
                                yield drizzle_1.db
                                    .delete(schema_1.assessment)
                                    .where((0, drizzle_orm_1.eq)(schema_1.assessment.id, targetId))
                                    .execute();
                            }
                            break;
                        }
                        case "assessee": {
                            const assessee = yield drizzle_1.db.query.assessee.findFirst({
                                where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, targetId),
                            });
                            if (assessee) {
                                // Delete related results first (cascade should handle this, but explicit is better)
                                yield drizzle_1.db
                                    .delete(schema_1.result)
                                    .where((0, drizzle_orm_1.eq)(schema_1.result.assessee_id, targetId))
                                    .execute();
                                // Delete the assessee
                                yield drizzle_1.db
                                    .delete(schema_1.assessee)
                                    .where((0, drizzle_orm_1.eq)(schema_1.assessee.id, targetId))
                                    .execute();
                                // Verify deletion
                                const verifyDeletion = yield drizzle_1.db.query.assessee.findFirst({
                                    where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, targetId),
                                });
                                if (verifyDeletion) {
                                    throw new Error("Gagal menghapus assessee - data masih ada setelah penghapusan");
                                }
                            }
                            break;
                        }
                        default:
                            break;
                    }
                });
                if (action === "update") {
                    yield applyUpdate(refreshed.comment);
                }
                else if (action === "delete") {
                    yield applyDelete();
                }
            }
            const current = yield drizzle_1.db.query.approvalRequest.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id),
            });
            if (input.decision === "rejected") {
                yield drizzle_1.db
                    .update(schema_1.approvalRequest)
                    .set({
                    status: "rejected",
                    comment: (_b = input.comment) !== null && _b !== void 0 ? _b : request.comment,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id))
                    .execute();
            }
            else {
                if (!current || current.status !== "approved") {
                    yield drizzle_1.db
                        .update(schema_1.approvalRequest)
                        .set({
                        status: "approved",
                        comment: (_c = input.comment) !== null && _c !== void 0 ? _c : request.comment,
                        approved_at: new Date(),
                        approved_by: admin.id,
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id))
                        .execute();
                }
            }
            const updated = yield drizzle_1.db.query.approvalRequest.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, input.id),
            });
            return updated;
        });
    },
    createApprovalRequestWithBackup(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const requester = yield drizzle_1.db.query.admin.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, input.user.id),
            });
            if (!requester)
                throw new Error("Hanya admin yang dapat membuat approval request");
            const primaryApprover = yield drizzle_1.db.query.admin.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.admin.id, input.primaryApproverId),
            });
            if (!primaryApprover || !primaryApprover.can_approve) {
                throw new Error("Primary approver tidak memiliki izin approve");
            }
            if (input.backupApproverId) {
                const backupApprover = yield drizzle_1.db.query.admin.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema_1.admin.id, input.backupApproverId),
                });
                if (!backupApprover || !backupApprover.can_approve) {
                    throw new Error("Backup approver tidak memiliki izin approve");
                }
            }
            const insertResult = yield drizzle_1.db.insert(schema_1.approvalRequest).values({
                requester_admin_id: requester.id,
                approver_admin_id: input.primaryApproverId,
                backup_admin_id: input.backupApproverId || null,
                target_table: input.targetTable,
                target_id: input.targetId,
                target_name: yield this.getTargetName(input.targetTable, input.targetId),
                action: input.action,
                status: "pending",
                comment: (_a = input.comment) !== null && _a !== void 0 ? _a : null,
                approved_at: null,
            });
            // Ambil data yang baru dibuat
            const approvalRequest = yield drizzle_1.db.query.approvalRequest.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, insertResult[0].insertId),
            });
            return approvalRequest;
        });
    },
    getTargetName(targetTable, targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const targetTableLower = targetTable.toLowerCase();
            try {
                switch (targetTableLower) {
                    case "user": {
                        const u = yield drizzle_1.db.query.user.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema_1.user.id, targetId),
                        });
                        return (_a = u === null || u === void 0 ? void 0 : u.full_name) !== null && _a !== void 0 ? _a : null;
                    }
                    case "occupation": {
                        const o = yield drizzle_1.db.query.occupation.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, targetId),
                        });
                        return (_b = o === null || o === void 0 ? void 0 : o.name) !== null && _b !== void 0 ? _b : null;
                    }
                    case "scheme": {
                        const s = yield drizzle_1.db.query.scheme.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, targetId),
                        });
                        return s ? s.code || s.name : null;
                    }
                    case "assessment": {
                        const a = yield drizzle_1.db.query.assessment.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, targetId),
                        });
                        return (_c = a === null || a === void 0 ? void 0 : a.code) !== null && _c !== void 0 ? _c : null;
                    }
                    case "schedule": {
                        const sch = yield drizzle_1.db.query.assessmentSchedule.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, targetId),
                        });
                        if (sch) {
                            const asmt = yield drizzle_1.db.query.assessment.findFirst({
                                where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, sch.assessment_id),
                            });
                            const occ = asmt
                                ? yield drizzle_1.db.query.occupation.findFirst({
                                    where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, asmt.occupation_id),
                                })
                                : null;
                            const fmt = (d) => d instanceof Date
                                ? d.toISOString().slice(0, 10)
                                : new Date(d).toISOString().slice(0, 10);
                            const start = sch.start_date ? fmt(sch.start_date) : "";
                            const end = sch.end_date ? fmt(sch.end_date) : "";
                            return `${(_d = occ === null || occ === void 0 ? void 0 : occ.name) !== null && _d !== void 0 ? _d : "Schedule"} — ${start} s/d ${end}`;
                        }
                        return null;
                    }
                    case "assessee": {
                        const assessee = yield drizzle_1.db.query.assessee.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, targetId),
                        });
                        if (assessee) {
                            const user = yield drizzle_1.db.query.user.findFirst({
                                where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id),
                            });
                            return (_e = user === null || user === void 0 ? void 0 : user.full_name) !== null && _e !== void 0 ? _e : null;
                        }
                        return null;
                    }
                    default:
                        return null;
                }
            }
            catch (_f) {
                return null;
            }
        });
    },
    getAvailableApprovers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield drizzle_1.db.query.admin.findMany({
                where: (0, drizzle_orm_1.eq)(schema_1.admin.can_approve, true),
                columns: {
                    id: true,
                    user_id: true,
                    can_approve: true,
                },
            });
        });
    },
    createApprovalRequestWithAutoBackup(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const requester = yield drizzle_1.db.query.admin.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, input.user.id),
            });
            if (!requester)
                throw new Error("Hanya admin yang dapat membuat approval request");
            // Validasi primary approver
            const primaryApprover = yield drizzle_1.db.query.admin.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.admin.id, input.primaryApproverId),
            });
            if (!primaryApprover || !primaryApprover.can_approve) {
                throw new Error("Primary approver tidak memiliki izin approve");
            }
            // Cari admin lain yang bisa approve sebagai backup
            const availableApprovers = yield this.getAvailableApprovers();
            const backupApprover = availableApprovers.find((admin) => admin.id !== input.primaryApproverId && admin.id !== requester.id);
            const backupIdAuto = (_a = backupApprover === null || backupApprover === void 0 ? void 0 : backupApprover.id) !== null && _a !== void 0 ? _a : (requester.can_approve && requester.id !== input.primaryApproverId
                ? requester.id
                : null);
            // Buat approval request dengan auto backup
            const insertResult = yield drizzle_1.db.insert(schema_1.approvalRequest).values({
                requester_admin_id: requester.id,
                approver_admin_id: input.primaryApproverId,
                backup_admin_id: backupIdAuto,
                target_table: input.targetTable,
                target_id: input.targetId,
                target_name: yield this.getTargetName(input.targetTable, input.targetId),
                action: input.action,
                status: "pending",
                comment: (_b = input.comment) !== null && _b !== void 0 ? _b : null,
                approved_at: null,
            });
            // Ambil data yang baru dibuat
            const approvalRequest = yield drizzle_1.db.query.approvalRequest.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.approvalRequest.id, insertResult[0].insertId),
            });
            return approvalRequest;
        });
    },
};
