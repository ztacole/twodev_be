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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAO2Service = void 0;
const error_1 = require("../../../common/error");
const drizzle_1 = require("../../../config/drizzle");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class IAO2Service {
    static getIA02Groups(assessment_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAssessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, assessment_id) });
            if (!existingAssessment)
                throw new error_1.NotFoundError('Assessment');
            const groups = yield drizzle_1.db.select().from(schema_1.groupIa02).where((0, drizzle_orm_1.eq)(schema_1.groupIa02.assessment_id, assessment_id));
            return Promise.all(groups.map((g) => __awaiter(this, void 0, void 0, function* () {
                const units = yield drizzle_1.db.select().from(schema_1.ucIa02).where((0, drizzle_orm_1.eq)(schema_1.ucIa02.group_id, g.id));
                const tools = yield drizzle_1.db.select().from(schema_1.ia02Tool).where((0, drizzle_orm_1.eq)(schema_1.ia02Tool.group_id, g.id));
                const pdf = yield drizzle_1.db.query.ia02Pdf.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia02Pdf.assessment_id, g.id) });
                return {
                    id: g.id,
                    assessment_id: g.assessment_id,
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
    static approveByAssessor(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!existingResult)
                throw new error_1.NotFoundError('Result');
            const header = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.result_id, result_id) });
            if (!header)
                throw new error_1.NotFoundError('IA02 header');
            yield drizzle_1.db.update(schema_1.resultIa02Header).set({ approved_assessor: true }).where((0, drizzle_orm_1.eq)(schema_1.resultIa02Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('IA02 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assessee_id) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
            return {
                id: updated.id,
                result_id: updated.result_id,
                assessee: { id: assessee === null || assessee === void 0 ? void 0 : assessee.id, name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.full_name, email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email },
                approved_assessee: updated.approved_assessee,
                approved_assessor: updated.approved_assessor,
            };
        });
    }
    static approveByAssessee(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!existingResult)
                throw new error_1.NotFoundError('Result');
            const header = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.result_id, result_id) });
            if (!header)
                throw new error_1.NotFoundError('IA02 header');
            yield drizzle_1.db.update(schema_1.resultIa02Header).set({ approved_assessee: true }).where((0, drizzle_orm_1.eq)(schema_1.resultIa02Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('IA02 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assessee_id) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
            return {
                id: updated.id,
                result_id: updated.result_id,
                assessee: { id: assessee === null || assessee === void 0 ? void 0 : assessee.id, name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.full_name, email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email },
                approved_assessee: updated.approved_assessee,
                approved_assessor: updated.approved_assessor,
            };
        });
    }
    static getResultDetails(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!result)
                throw new error_1.NotFoundError('Result');
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, result.assessment_id) });
            const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) }) : null;
            const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) }) : null;
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assessee_id) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, result.assessor_id) });
            const assessorUser = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) }) : null;
            const header = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.result_id, result_id) });
            if (!header)
                throw new error_1.NotFoundError('Result header');
            return {
                id: result.id,
                assessment: assessment ? Object.assign(Object.assign({}, assessment), { occupation: occupation ? Object.assign(Object.assign({}, occupation), { scheme }) : null }) : null,
                assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.full_name, email: assesseeUser.email } : null,
                assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.full_name, email: assessorUser.email, no_reg_met: assessor.no_reg_met } : null,
                tuk: result.tuk,
                is_competent: false,
                created_at: result.created_at,
                ia02_header: header,
            };
        });
    }
    static uploadPdf(assessment_id, _filePath, file_name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existing = yield drizzle_1.db.query.ia02Pdf.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia02Pdf.assessment_id, assessment_id) });
                if (existing) {
                    const folderPath = path_1.default.dirname(_filePath);
                    if (fs_1.default.existsSync(folderPath)) {
                        fs_1.default.rmSync(folderPath, { recursive: true, force: true });
                    }
                    yield drizzle_1.db.update(schema_1.ia02Pdf)
                        .set({ file_name })
                        .where((0, drizzle_orm_1.eq)(schema_1.ia02Pdf.assessment_id, assessment_id));
                }
                else {
                    yield drizzle_1.db.insert(schema_1.ia02Pdf).values({ assessment_id: assessment_id, file_name: file_name });
                }
                const updated = yield drizzle_1.db.query.ia02Pdf.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia02Pdf.assessment_id, assessment_id) });
                if (!updated)
                    throw new error_1.NotFoundError('IA02 PDF');
                return updated;
            }
            catch (error) {
                throw new error_1.AppError(`Gagal mengunggah file PDF: ${error.message}`, 500);
            }
        });
    }
    static getPdf(assessment_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pdf = yield drizzle_1.db.query.ia02Pdf.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia02Pdf.assessment_id, assessment_id) });
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
