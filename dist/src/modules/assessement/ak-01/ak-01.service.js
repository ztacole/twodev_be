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
exports.AK01Service = void 0;
const error_1 = require("../../../common/error");
const drizzle_1 = require("../../../config/drizzle");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class AK01Service {
    static createAK01(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { result_id, evidences } = data;
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.resultId, result_id) });
            if (!header) {
                throw new error_1.NotFoundError('Header AK01');
            }
            yield drizzle_1.db.delete(schema_1.resultAk01).where((0, drizzle_orm_1.eq)(schema_1.resultAk01.headerId, header.id));
            for (const evidence of evidences) {
                yield drizzle_1.db.insert(schema_1.resultAk01).values({ headerId: header.id, evidence });
            }
            const rows = yield drizzle_1.db.query.resultAk01.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01.headerId, header.id) });
            return formatAK01Response(Object.assign(Object.assign({}, header), { rows }));
        });
    }
    static getDataForAK01(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.resultId, resultId) });
            if (!header) {
                throw new error_1.NotFoundError('Header AK01');
            }
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, result.assessmentId) });
            const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupationId) }) : null;
            const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.schemeId) }) : null;
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, result.assessorId) });
            const assessorUser = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.userId) }) : null;
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule).where((0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.assessmentId, result.assessmentId));
            const details = yield Promise.all(schedules.map(s => drizzle_1.db.select().from(schema_1.scheduleDetail).where((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.scheduleId, s.id))));
            const locations = details.flat().filter(d => d.assessorId === result.assessorId).map(d => d.location);
            return {
                id: result.id,
                assessment: assessment ? Object.assign(Object.assign({}, assessment), { occupation: occupation ? Object.assign(Object.assign({}, occupation), { scheme }) : null }) : null,
                assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.fullName, email: assesseeUser.email } : null,
                assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.fullName, email: assessorUser.email, no_reg_met: assessor.noRegMet } : null,
                tuk: result.tuk,
                is_competent: result.isCompetent,
                created_at: result.createdAt,
                locations,
                ak01_header: header,
            };
        });
    }
    static getAK01ById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const header = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.id, id) });
            if (!header) {
                throw new error_1.NotFoundError('Header AK01');
            }
            const rows = yield drizzle_1.db.query.resultAk01.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01.headerId, header.id) });
            return formatAK01Response(Object.assign(Object.assign({}, header), { rows }));
        });
    }
    static getAK01ByResultId(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const header = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.resultId, resultId) });
            if (!header) {
                throw new error_1.NotFoundError('Header AK01');
            }
            const rows = yield drizzle_1.db.query.resultAk01.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01.headerId, header.id) });
            return formatAK01Response(Object.assign(Object.assign({}, header), { rows }));
        });
    }
    static updateAK01(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingHeader = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.id, id) });
            if (!existingHeader) {
                throw new error_1.NotFoundError('Header AK01');
            }
            if (data.evidences) {
                yield drizzle_1.db.delete(schema_1.resultAk01).where((0, drizzle_orm_1.eq)(schema_1.resultAk01.headerId, id));
                for (const evidence of data.evidences) {
                    yield drizzle_1.db.insert(schema_1.resultAk01).values({ headerId: id, evidence });
                }
            }
            const rows = yield drizzle_1.db.query.resultAk01.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01.headerId, id) });
            return formatAK01Response(Object.assign(Object.assign({}, existingHeader), { rows }));
        });
    }
    static deleteAK01(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingHeader = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.id, id) });
            if (!existingHeader) {
                throw new error_1.NotFoundError('Header AK01');
            }
            yield drizzle_1.db.delete(schema_1.resultAk01).where((0, drizzle_orm_1.eq)(schema_1.resultAk01.headerId, id));
            yield drizzle_1.db.delete(schema_1.resultAk01Header).where((0, drizzle_orm_1.eq)(schema_1.resultAk01Header.id, id));
        });
    }
    // AK-O1 Approval
    static approvedByAssessor(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.resultId, resultId) });
            if (!header) {
                throw new error_1.NotFoundError('AK01 header');
            }
            yield drizzle_1.db.update(schema_1.resultAk01Header).set({ approvedAssessor: true }).where((0, drizzle_orm_1.eq)(schema_1.resultAk01Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('AK01 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            return formatApproval(Object.assign(Object.assign({}, updated), { result: { assessee: { id: assessee === null || assessee === void 0 ? void 0 : assessee.id, user: { full_name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.fullName, email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email } } } }));
        });
    }
    static approvedByAssessee(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.resultId, resultId) });
            if (!header) {
                throw new error_1.NotFoundError('AK01 header');
            }
            yield drizzle_1.db.update(schema_1.resultAk01Header).set({ approvedAssessee: true }).where((0, drizzle_orm_1.eq)(schema_1.resultAk01Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('AK01 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            return formatApproval(Object.assign(Object.assign({}, updated), { result: { assessee: { id: assessee === null || assessee === void 0 ? void 0 : assessee.id, user: { full_name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.fullName, email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email } } } }));
        });
    }
}
exports.AK01Service = AK01Service;
// Helpers
function formatAK01Response(ak01Header) {
    return {
        id: ak01Header.id,
        result_id: ak01Header.resultId,
        approved_assessee: ak01Header.approvedAssessee,
        approved_assessor: ak01Header.approvedAssessor,
        rows: ak01Header.rows.map((row) => ({
            id: row.id,
            header_id: row.headerId,
            evidence: row.evidence
        }))
    };
}
function formatApproval(result) {
    return {
        id: result.id,
        result_id: result.resultId,
        assessee: {
            id: result.result.assessee.id,
            name: result.result.assessee.user.full_name,
            email: result.result.assessee.user.email,
        },
        approved_assessee: result.approvedAssessee,
        approved_assessor: result.approvedAssessor,
    };
}
