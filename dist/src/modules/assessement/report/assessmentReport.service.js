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
exports.AssessmentReportService = void 0;
const drizzle_1 = require("../../../config/drizzle");
const schema_1 = require("../../../../drizzle/schema");
const error_1 = require("../../../common/error");
const drizzle_orm_1 = require("drizzle-orm");
class AssessmentReportService {
    static getAssessmentReport(iAssessmentID) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessment = yield drizzle_1.db.query.assessment.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, iAssessmentID)
            });
            if (!assessment)
                throw new error_1.NotFoundError('Assessment');
            const report = yield drizzle_1.db.query.assessmentReport.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.assessmentReport.assessment_id, iAssessmentID)
            });
            if (!report)
                throw new error_1.NotFoundError('Assessment Report');
            return report;
        });
    }
    static createAssessmentReport(objReport) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield drizzle_1.db.query.assessmentReport.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.assessmentReport.assessment_id, objReport.assessment_id)
            });
            if (existing) {
                return this.updateAssessmentReport(objReport.assessment_id, objReport);
            }
            yield drizzle_1.db.insert(schema_1.assessmentReport).values({
                assessment_id: objReport.assessment_id,
                statement: objReport.statement || null,
                is_competent: objReport.is_competent ? 1 : 0
            });
            return yield this.getAssessmentReport(objReport.assessment_id);
        });
    }
    static updateAssessmentReport(iAssessmentID, objReport) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingReport = yield drizzle_1.db.query.assessmentReport.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.assessmentReport.assessment_id, iAssessmentID)
            });
            if (!existingReport)
                throw new error_1.NotFoundError('Assessment Report');
            yield drizzle_1.db.update(schema_1.assessmentReport)
                .set({
                statement: objReport.statement || null,
                is_competent: objReport.is_competent ? 1 : 0
            })
                .where((0, drizzle_orm_1.eq)(schema_1.assessmentReport.assessment_id, iAssessmentID));
            return yield this.getAssessmentReport(iAssessmentID);
        });
    }
}
exports.AssessmentReportService = AssessmentReportService;
