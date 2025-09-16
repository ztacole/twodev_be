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
            const header = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, data.result_id) });
            if (!header) {
                throw new error_1.NotFoundError('Header AK02');
            }
            const uc_ids = data.rows.map(row => row.uc_id);
            const existingUCs = uc_ids.length ? yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.inArray)(schema_1.ucApl02.id, uc_ids)) : [];
            if (existingUCs.length !== uc_ids.length) {
                throw new error_1.NotFoundError('Satu atau lebih Unit Kompetensi');
            }
            yield drizzle_1.db.delete(schema_1.resultAk02).where((0, drizzle_orm_1.eq)(schema_1.resultAk02.header_id, header.id));
            for (const row of data.rows) {
                const [created] = yield drizzle_1.db.insert(schema_1.resultAk02).values({ header_id: header.id, uc_id: row.uc_id });
                for (const e of row.evidences) {
                    yield drizzle_1.db.insert(schema_1.ak02Evidence).values({ result_ak02_id: (_a = created.insertId) !== null && _a !== void 0 ? _a : undefined, evidence: e });
                }
            }
            yield drizzle_1.db.update(schema_1.resultAk02Header).set({
                is_competent: data.is_competent,
                follow_up: data.follow_up,
                comment: data.comment,
            }).where((0, drizzle_orm_1.eq)(schema_1.resultAk02Header.id, header.id));
            const rows = yield drizzle_1.db.query.resultAk02.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02.header_id, header.id) });
            return formatAK02Response(Object.assign(Object.assign({}, header), { rows }));
        });
    }
    static getUnits(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, result_id) });
            if (!header) {
                throw new error_1.NotFoundError('Result header');
            }
            const units = yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.assessment_id, result.assessment_id));
            const rows = yield drizzle_1.db.query.resultAk02.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02.header_id, header.id) });
            return {
                id: result.id,
                units: yield Promise.all(units.map((unit) => __awaiter(this, void 0, void 0, function* () {
                    const check = rows.find(row => row.uc_id === unit.id) || null;
                    return {
                        id: unit.id,
                        code: unit.unit_code,
                        title: unit.title,
                        evidences: check ? (yield drizzle_1.db.select().from(schema_1.ak02Evidence).where((0, drizzle_orm_1.eq)(schema_1.ak02Evidence.result_ak02_id, check.id))).map(e => e.evidence) : null
                    };
                })))
            };
        });
    }
    static getResultDetails(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, result_id) });
            if (!header) {
                throw new error_1.NotFoundError('Result header');
            }
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, result.assessment_id) });
            const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) }) : null;
            const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) }) : null;
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assessee_id) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, result.assessor_id) });
            const assessorUser = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) }) : null;
            const rows = yield drizzle_1.db.query.resultAk02.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02.header_id, header.id) });
            return {
                id: result.id,
                assessment: assessment ? Object.assign(Object.assign({}, assessment), { occupation: occupation ? Object.assign(Object.assign({}, occupation), { scheme }) : null }) : null,
                assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.full_name, email: assesseeUser.email } : null,
                assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.full_name, email: assessorUser.email, no_reg_met: assessor.no_reg_met } : null,
                tuk: result.tuk,
                is_competent: result.is_competent,
                created_at: result.created_at,
                ak02_headers: {
                    id: header.id,
                    is_competent: header.is_competent,
                    follow_up: header.follow_up,
                    comment: header.comment,
                    approved_assessee: header.approved_assessee,
                    approved_assessor: header.approved_assessor,
                    rows: yield Promise.all(rows.map((row) => __awaiter(this, void 0, void 0, function* () {
                        var _a, _b;
                        return ({
                            id: row.id,
                            unit_id: row.uc_id,
                            unit_title: (_a = (yield drizzle_1.db.query.ucApl02.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ucApl02.id, row.uc_id) }))) === null || _a === void 0 ? void 0 : _a.title,
                            unit_code: (_b = (yield drizzle_1.db.query.ucApl02.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ucApl02.id, row.uc_id) }))) === null || _b === void 0 ? void 0 : _b.unit_code,
                            evidences: (yield drizzle_1.db.select().from(schema_1.ak02Evidence).where((0, drizzle_orm_1.eq)(schema_1.ak02Evidence.result_ak02_id, row.id))).map(e => ({ id: e.id, evidence: e.evidence }))
                        });
                    })))
                }
            };
        });
    }
    // AK-02 Approval
    static approvedByAssessor(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, result_id) });
            if (!header) {
                throw new error_1.NotFoundError('AK02 header');
            }
            yield drizzle_1.db.update(schema_1.resultAk02Header).set({ approved_assessor: true }).where((0, drizzle_orm_1.eq)(schema_1.resultAk02Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('AK02 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assessee_id) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
            return formatApproval(Object.assign(Object.assign({}, updated), { assessee: { id: assessee === null || assessee === void 0 ? void 0 : assessee.id, user: { full_name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.full_name, email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email } } }));
        });
    }
    static approvedByAssessee(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, result_id) });
            if (!header) {
                throw new error_1.NotFoundError('AK02 header');
            }
            yield drizzle_1.db.update(schema_1.resultAk02Header).set({ approved_assessee: true }).where((0, drizzle_orm_1.eq)(schema_1.resultAk02Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('AK02 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assessee_id) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
            return formatApproval(Object.assign(Object.assign({}, updated), { assessee: { id: assessee === null || assessee === void 0 ? void 0 : assessee.id, user: { full_name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.full_name, email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email } } }));
        });
    }
}
exports.AK02Service = AK02Service;
// Helpers
function formatAK02Response(ak02Header) {
    return {
        id: ak02Header.id,
        result_id: ak02Header.result_id,
        approved_assessee: ak02Header.approved_assessee,
        approved_assessor: ak02Header.approved_assessor,
        is_competent: ak02Header.is_competent,
        follow_up: ak02Header.follow_up,
        comment: ak02Header.comment,
        rows: ak02Header.rows.map((row) => {
            var _a, _b, _c;
            return ({
                id: row.id,
                header_id: row.header_id,
                uc_id: row.uc_id,
                evidence: row.evidence,
                uc: {
                    id: (_a = row.uc) === null || _a === void 0 ? void 0 : _a.id,
                    unit_code: (_b = row.uc) === null || _b === void 0 ? void 0 : _b.unit_code,
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
        approved_assessee: result.approved_assessee,
        approved_assessor: result.approved_assessor,
    };
}
