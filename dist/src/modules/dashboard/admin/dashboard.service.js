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
exports.DashboardService = void 0;
const drizzle_1 = require("../../../config/drizzle");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class DashboardService {
    static getSummary() {
        return __awaiter(this, void 0, void 0, function* () {
            const [schemes, assessments, assessors, assessees] = yield Promise.all([
                drizzle_1.db.select().from(schema_1.scheme),
                drizzle_1.db.select().from(schema_1.assessment),
                drizzle_1.db.select().from(schema_1.occupation),
                drizzle_1.db.select().from(schema_1.assessee),
            ]);
            const totalSchemes = schemes.length;
            const totalAssessments = assessments.length;
            const totalAssessors = assessors.length;
            const totalAssessees = assessees.length;
            return {
                totalSchemes,
                totalAssessments,
                totalAssessors,
                totalAssessees,
            };
        });
    }
    static getSchedules() {
        return __awaiter(this, void 0, void 0, function* () {
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule);
            return Promise.all(schedules.map((s) => __awaiter(this, void 0, void 0, function* () {
                const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, s.assessmentId) });
                const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupationId) }) : null;
                const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.schemeId) }) : null;
                return {
                    id: s.id,
                    assessment_id: s.assessmentId,
                    schema_name: scheme === null || scheme === void 0 ? void 0 : scheme.code,
                    occupation_name: occupation === null || occupation === void 0 ? void 0 : occupation.name,
                    start_date: s.startDate,
                    end_date: s.endDate,
                };
            })));
        });
    }
    static getVerificationDocs() {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = yield drizzle_1.db.select().from(schema_1.resultDoc);
            return docs.map((d) => ({
                id: d.id,
                result_id: d.resultId,
                purpose: d.purpose,
                school_report_card: d.schoolReportCard,
                field_work_practice_certificate: d.fieldWorkPracticeCertificate,
                student_card: d.studentCard,
                family_card: d.familyCard,
                id_card: d.idCard,
                approved: d.approved,
            }));
        });
    }
    static getDashboardData() {
        return __awaiter(this, void 0, void 0, function* () {
            const summary = yield this.getSummary();
            const schedules = yield this.getSchedules();
            const docs = yield this.getVerificationDocs();
            return {
                summary,
                schedules,
                docs,
            };
        });
    }
}
exports.DashboardService = DashboardService;
