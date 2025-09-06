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
exports.IAO2Service = void 0;
const error_1 = require("../../../common/error");
const drizzle_1 = require("../../../config/drizzle");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class IAO2Service {
    static getIA02Groups(assessmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAssessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, assessmentId) });
            if (!existingAssessment)
                throw new error_1.NotFoundError('Assessment');
            const groups = yield drizzle_1.db.select().from(schema_1.groupIa02).where((0, drizzle_orm_1.eq)(schema_1.groupIa02.assessmentId, assessmentId));
            return Promise.all(groups.map((g) => __awaiter(this, void 0, void 0, function* () {
                const units = yield drizzle_1.db.select().from(schema_1.ucIa02).where((0, drizzle_orm_1.eq)(schema_1.ucIa02.groupId, g.id));
                const tools = yield drizzle_1.db.select().from(schema_1.ia02Tool).where((0, drizzle_orm_1.eq)(schema_1.ia02Tool.groupId, g.id));
                const pdf = yield drizzle_1.db.query.ia02Pdf.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia02Pdf.groupId, g.id) });
                return {
                    id: g.id,
                    assessment_id: g.assessmentId,
                    name: g.name,
                    scenario: g.scenario,
                    duration: g.duration,
                    units,
                    tools,
                    pdfs: pdf ? [pdf] : [],
                };
            })));
        });
    }
    static approveByAssessor(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!existingResult)
                throw new error_1.NotFoundError('Result');
            const header = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.resultId, resultId) });
            if (!header)
                throw new error_1.NotFoundError('IA02 header');
            yield drizzle_1.db.update(schema_1.resultIa02Header).set({ approvedAssessor: true }).where((0, drizzle_orm_1.eq)(schema_1.resultIa02Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('IA02 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            return {
                id: updated.id,
                result_id: updated.resultId,
                assessee: { id: assessee === null || assessee === void 0 ? void 0 : assessee.id, name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.fullName, email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email },
                approved_assessee: updated.approvedAssessee,
                approved_assessor: updated.approvedAssessor,
            };
        });
    }
    static approveByAssessee(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!existingResult)
                throw new error_1.NotFoundError('Result');
            const header = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.resultId, resultId) });
            if (!header)
                throw new error_1.NotFoundError('IA02 header');
            yield drizzle_1.db.update(schema_1.resultIa02Header).set({ approvedAssessee: true }).where((0, drizzle_orm_1.eq)(schema_1.resultIa02Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('IA02 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            return {
                id: updated.id,
                result_id: updated.resultId,
                assessee: { id: assessee === null || assessee === void 0 ? void 0 : assessee.id, name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.fullName, email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email },
                approved_assessee: updated.approvedAssessee,
                approved_assessor: updated.approvedAssessor,
            };
        });
    }
    static getResultDetails(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!result)
                throw new error_1.NotFoundError('Result');
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, result.assessmentId) });
            const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupationId) }) : null;
            const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.schemeId) }) : null;
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            const header = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.resultId, resultId) });
            if (!header)
                throw new error_1.NotFoundError('Result header');
            return {
                id: result.id,
                assessment: assessment ? Object.assign(Object.assign({}, assessment), { occupation: occupation ? Object.assign(Object.assign({}, occupation), { scheme }) : null }) : null,
                assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.fullName, email: assesseeUser.email } : null,
                assessor: null,
                tuk: result.tuk,
                is_competent: false,
                created_at: result.createdAt,
                ia02_header: header,
            };
        });
    }
    static uploadPdf(groupId, _filePath, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existing = yield drizzle_1.db.query.ia02Pdf.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia02Pdf.groupId, groupId) });
                if (existing) {
                    yield drizzle_1.db.update(schema_1.ia02Pdf).set({ name: fileName }).where((0, drizzle_orm_1.eq)(schema_1.ia02Pdf.groupId, groupId));
                    return yield drizzle_1.db.query.ia02Pdf.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia02Pdf.groupId, groupId) });
                }
                yield drizzle_1.db.insert(schema_1.ia02Pdf).values({ groupId, name: fileName });
                return yield drizzle_1.db.query.ia02Pdf.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia02Pdf.groupId, groupId) });
            }
            catch (error) {
                throw new error_1.AppError(`Gagal mengunggah file PDF: ${error.message}`, 500);
            }
        });
    }
    static getPdf(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pdf = yield drizzle_1.db.query.ia02Pdf.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia02Pdf.groupId, groupId) });
                return pdf;
            }
            catch (error) {
                if (error instanceof error_1.AppError)
                    throw error;
                throw new error_1.AppError(`Gagal mendapatkan file PDF: ${error.message}`, 500);
            }
        });
    }
}
exports.IAO2Service = IAO2Service;
