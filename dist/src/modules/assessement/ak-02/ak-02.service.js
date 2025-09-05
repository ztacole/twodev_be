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
exports.AK02Service = void 0;
const error_1 = require("../../../common/error");
const drizzle_1 = require("../../../config/drizzle");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class AK02Service {
    static sendResult(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, data.result_id), });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.resultId, data.result_id) });
            if (!header) {
                throw new error_1.NotFoundError('Header AK02');
            }
            const ucIds = data.rows.map(row => row.uc_id);
            const existingUCs = ucIds.length ? yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.inArray)(schema_1.ucApl02.id, ucIds)) : [];
            if (existingUCs.length !== ucIds.length) {
                throw new error_1.NotFoundError('Satu atau lebih Unit Kompetensi');
            }
            yield drizzle_1.db.delete(schema_1.resultAk02).where((0, drizzle_orm_1.eq)(schema_1.resultAk02.headerId, header.id));
            for (const row of data.rows) {
                const [created] = yield drizzle_1.db.insert(schema_1.resultAk02).values({ headerId: header.id, ucId: row.uc_id });
                for (const e of row.evidences) {
                    yield drizzle_1.db.insert(schema_1.ak02Evidence).values({ resultAk02Id: (_a = created.insertId) !== null && _a !== void 0 ? _a : undefined, evidence: e });
                }
            }
            yield drizzle_1.db.update(schema_1.resultAk02Header).set({
                isCompetent: data.is_competent,
                followUp: data.follow_up,
                comment: data.comment,
            }).where((0, drizzle_orm_1.eq)(schema_1.resultAk02Header.id, header.id));
            const rows = yield drizzle_1.db.query.resultAk02.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02.headerId, header.id) });
            return formatAK02Response(Object.assign(Object.assign({}, header), { rows }));
        });
    }
    static getUnits(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.resultId, resultId) });
            if (!header) {
                throw new error_1.NotFoundError('Result header');
            }
            const units = yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.assessmentId, result.assessmentId));
            const rows = yield drizzle_1.db.query.resultAk02.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02.headerId, header.id) });
            return {
                id: result.id,
                units: yield Promise.all(units.map((unit) => __awaiter(this, void 0, void 0, function* () {
                    const check = rows.find(row => row.ucId === unit.id) || null;
                    return {
                        id: unit.id,
                        code: unit.unitCode,
                        title: unit.title,
                        evidences: check ? (yield drizzle_1.db.select().from(schema_1.ak02Evidence).where((0, drizzle_orm_1.eq)(schema_1.ak02Evidence.resultAk02Id, check.id))).map(e => e.evidence) : null
                    };
                })))
            };
        });
    }
    static getResultDetails(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.resultId, resultId) });
            if (!header) {
                throw new error_1.NotFoundError('Result header');
            }
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, result.assessmentId) });
            const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupationId) }) : null;
            const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.schemeId) }) : null;
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, result.assessorId) });
            const assessorUser = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.userId) }) : null;
            const rows = yield drizzle_1.db.query.resultAk02.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02.headerId, header.id) });
            return {
                id: result.id,
                assessment: assessment ? Object.assign(Object.assign({}, assessment), { occupation: occupation ? Object.assign(Object.assign({}, occupation), { scheme }) : null }) : null,
                assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.fullName, email: assesseeUser.email } : null,
                assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.fullName, email: assessorUser.email, no_reg_met: assessor.noRegMet } : null,
                tuk: result.tuk,
                is_competent: result.isCompetent,
                created_at: result.createdAt,
                ak02_headers: {
                    id: header.id,
                    is_competent: header.isCompetent,
                    follow_up: header.followUp,
                    comment: header.comment,
                    rows: yield Promise.all(rows.map((row) => __awaiter(this, void 0, void 0, function* () {
                        var _a, _b;
                        return ({
                            id: row.id,
                            unit_id: row.ucId,
                            unit_title: (_a = (yield drizzle_1.db.query.ucApl02.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ucApl02.id, row.ucId) }))) === null || _a === void 0 ? void 0 : _a.title,
                            unit_code: (_b = (yield drizzle_1.db.query.ucApl02.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ucApl02.id, row.ucId) }))) === null || _b === void 0 ? void 0 : _b.unitCode,
                            evidences: (yield drizzle_1.db.select().from(schema_1.ak02Evidence).where((0, drizzle_orm_1.eq)(schema_1.ak02Evidence.resultAk02Id, row.id))).map(e => ({ id: e.id, evidence: e.evidence }))
                        });
                    })))
                }
            };
        });
    }
    // AK-02 Approval
    static approvedByAssessor(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.resultId, resultId) });
            if (!header) {
                throw new error_1.NotFoundError('AK02 header');
            }
            yield drizzle_1.db.update(schema_1.resultAk02Header).set({ approvedAssessor: true }).where((0, drizzle_orm_1.eq)(schema_1.resultAk02Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('AK02 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            return formatApproval(Object.assign(Object.assign({}, updated), { assessee: { id: assessee === null || assessee === void 0 ? void 0 : assessee.id, user: { full_name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.fullName, email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email } } }));
        });
    }
    static approvedByAssessee(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.resultId, resultId) });
            if (!header) {
                throw new error_1.NotFoundError('AK02 header');
            }
            yield drizzle_1.db.update(schema_1.resultAk02Header).set({ approvedAssessee: true }).where((0, drizzle_orm_1.eq)(schema_1.resultAk02Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('AK02 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            return formatApproval(Object.assign(Object.assign({}, updated), { assessee: { id: assessee === null || assessee === void 0 ? void 0 : assessee.id, user: { full_name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.fullName, email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email } } }));
        });
    }
}
exports.AK02Service = AK02Service;
// Helpers
function formatAK02Response(ak02Header) {
    return {
        id: ak02Header.id,
        result_id: ak02Header.resultId,
        approved_assessee: ak02Header.approvedAssessee,
        approved_assessor: ak02Header.approvedAssessor,
        is_competent: ak02Header.isCompetent,
        follow_up: ak02Header.followUp,
        comment: ak02Header.comment,
        rows: ak02Header.rows.map((row) => {
            var _a, _b, _c;
            return ({
                id: row.id,
                header_id: row.headerId,
                uc_id: row.ucId,
                evidence: row.evidence,
                uc: {
                    id: (_a = row.uc) === null || _a === void 0 ? void 0 : _a.id,
                    unit_code: (_b = row.uc) === null || _b === void 0 ? void 0 : _b.unitCode,
                    title: (_c = row.uc) === null || _c === void 0 ? void 0 : _c.title
                }
            });
        })
    };
}
function formatApproval(result) {
    return {
        id: result.id,
        result_id: result.result_id,
        assessee: {
            id: result.assessee.id,
            name: result.assessee.user.full_name,
            email: result.assessee.user.email,
        },
        approved_assessee: result.approvedAssessee,
        approved_assessor: result.approvedAssessor,
    };
}
