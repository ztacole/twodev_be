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
exports.getVerificationsByScheduleDetail = exports.approveVerificationByScheduleDetail = exports.approveVerification = exports.getVerificationDetail = exports.getApprovedVerifications = exports.getPendingVerifications = void 0;
const drizzle_1 = require("../../../config/drizzle");
const error_1 = require("../../../common/error");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const getPendingVerifications = (schedule_detail_id) => __awaiter(void 0, void 0, void 0, function* () {
    const filterId = typeof schedule_detail_id === 'number' && Number.isFinite(schedule_detail_id) ? schedule_detail_id : undefined;
    const docs = yield drizzle_1.db.select().from(schema_1.resultDoc).where((0, drizzle_orm_1.eq)(schema_1.resultDoc.approved, false)).orderBy((0, drizzle_orm_1.desc)(schema_1.resultDoc.id));
    return Promise.all(docs.map((doc) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, doc.result_id) });
        if (filterId !== undefined) {
            const detail = yield drizzle_1.db.query.scheduleDetail.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheduleDetail.id, filterId) });
            if (!detail)
                return null;
            if (!result || result.schedule_id !== detail.schedule_id || result.assessor_id !== detail.assessor_id)
                return null;
        }
        const assessee = result ? yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assessee_id) }) : null;
        const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
        const assessor = result ? yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, result.assessor_id) }) : null;
        const assessorUser = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) }) : null;
        return Object.assign(Object.assign({}, doc), { result: result ? Object.assign(Object.assign({}, result), { assessee: assessee && assesseeUser ? Object.assign(Object.assign({}, assessee), { user: assesseeUser }) : null, assessor: assessor && assessorUser ? Object.assign(Object.assign({}, assessor), { user: assessorUser }) : null }) : null });
    }))).then(rows => rows.filter(Boolean));
});
exports.getPendingVerifications = getPendingVerifications;
const getApprovedVerifications = (schedule_detail_id) => __awaiter(void 0, void 0, void 0, function* () {
    const filterId = typeof schedule_detail_id === 'number' && Number.isFinite(schedule_detail_id) ? schedule_detail_id : undefined;
    const docs = yield drizzle_1.db.select().from(schema_1.resultDoc).where((0, drizzle_orm_1.eq)(schema_1.resultDoc.approved, true)).orderBy((0, drizzle_orm_1.desc)(schema_1.resultDoc.id));
    return Promise.all(docs.map((doc) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, doc.result_id) });
        if (filterId !== undefined) {
            const detail = yield drizzle_1.db.query.scheduleDetail.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheduleDetail.id, filterId) });
            if (!detail)
                return null;
            if (!result || result.schedule_id !== detail.schedule_id || result.assessor_id !== detail.assessor_id)
                return null;
        }
        const assessee = result ? yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assessee_id) }) : null;
        const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
        const assessor = result ? yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, result.assessor_id) }) : null;
        const assessorUser = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) }) : null;
        return Object.assign(Object.assign({}, doc), { result: result ? Object.assign(Object.assign({}, result), { assessee: assessee && assesseeUser ? Object.assign(Object.assign({}, assessee), { user: assesseeUser }) : null, assessor: assessor && assessorUser ? Object.assign(Object.assign({}, assessor), { user: assessorUser }) : null }) : null });
    }))).then(rows => rows.filter(Boolean));
});
exports.getApprovedVerifications = getApprovedVerifications;
const getVerificationDetail = (result_id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield drizzle_1.db.query.result.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id),
    });
    if (!result)
        throw new error_1.NotFoundError('Result');
    const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assessee_id) });
    const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
    const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, result.assessor_id) });
    const assessorUser = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) }) : null;
    const docs = yield drizzle_1.db.select().from(schema_1.resultDoc).where((0, drizzle_orm_1.eq)(schema_1.resultDoc.result_id, result.id));
    return Object.assign(Object.assign({}, result), { assessee: assessee && assesseeUser ? Object.assign(Object.assign({}, assessee), { user: assesseeUser, jobs: [] }) : null, assessor: assessor && assessorUser ? Object.assign(Object.assign({}, assessor), { user: assessorUser }) : null, docs });
});
exports.getVerificationDetail = getVerificationDetail;
const approveVerification = (result_id, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
    if (!existing)
        throw new error_1.NotFoundError('Result');
    const admin = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, user_id) });
    if (!admin)
        throw new error_1.NotFoundError('Admin');
    yield drizzle_1.db.update(schema_1.result).set({ is_competent: true }).where((0, drizzle_orm_1.eq)(schema_1.result.id, result_id));
    yield drizzle_1.db.update(schema_1.resultDoc).set({ approved: true, admin_id: admin.id }).where((0, drizzle_orm_1.eq)(schema_1.resultDoc.result_id, result_id));
    return { success: true };
});
exports.approveVerification = approveVerification;
const approveVerificationByScheduleDetail = (schedule_detail_id, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const detail = yield drizzle_1.db.query.scheduleDetail.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheduleDetail.id, schedule_detail_id) });
    if (!detail)
        throw new error_1.NotFoundError('Schedule Detail');
    const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, detail.schedule_id) });
    if (!schedule)
        throw new error_1.NotFoundError('Assessment Schedule');
    const admin = yield drizzle_1.db.query.admin.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.admin.user_id, user_id) });
    if (!admin)
        throw new error_1.NotFoundError('Admin');
    const results = yield drizzle_1.db.select().from(schema_1.result)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.schedule_id, schedule.id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, detail.assessor_id)));
    const updated = [];
    for (const r of results) {
        yield drizzle_1.db.update(schema_1.result).set({ is_competent: true }).where((0, drizzle_orm_1.eq)(schema_1.result.id, r.id));
        yield drizzle_1.db.update(schema_1.resultDoc).set({ approved: true, admin_id: admin.id }).where((0, drizzle_orm_1.eq)(schema_1.resultDoc.result_id, r.id));
        updated.push(r.id);
    }
    return { success: true, updated_result_ids: updated };
});
exports.approveVerificationByScheduleDetail = approveVerificationByScheduleDetail;
const getVerificationsByScheduleDetail = (schedule_detail_id) => __awaiter(void 0, void 0, void 0, function* () {
    const detail = yield drizzle_1.db.query.scheduleDetail.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheduleDetail.id, schedule_detail_id) });
    if (!detail)
        throw new error_1.NotFoundError('Schedule Detail');
    const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, detail.schedule_id) });
    if (!schedule)
        throw new error_1.NotFoundError('Assessment Schedule');
    const results = yield drizzle_1.db.select().from(schema_1.result)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.schedule_id, schedule.id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, detail.assessor_id)));
    return Promise.all(results.map((r) => __awaiter(void 0, void 0, void 0, function* () {
        const docs = yield drizzle_1.db.select().from(schema_1.resultDoc).where((0, drizzle_orm_1.eq)(schema_1.resultDoc.result_id, r.id));
        const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, r.assessee_id) });
        const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
        return {
            result: r,
            is_competent: r.is_competent,
            doc_approved: docs.some(d => d.approved === true),
            doc_ids: docs.map(d => d.id),
            assessee: assessee && assesseeUser ? Object.assign(Object.assign({}, assessee), { user: assesseeUser }) : null,
        };
    })));
});
exports.getVerificationsByScheduleDetail = getVerificationsByScheduleDetail;
