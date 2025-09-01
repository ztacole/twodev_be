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
const db_1 = require("../../../config/db");
class DashboardService {
    static getSummary() {
        return __awaiter(this, void 0, void 0, function* () {
            const [totalSchemes, totalAssessments, totalAssessors, totalAssessees] = yield Promise.all([
                db_1.prisma.scheme.count(),
                db_1.prisma.assessment.count(),
                db_1.prisma.assessor.count(),
                db_1.prisma.assessee.count(),
            ]);
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
            const schedules = yield db_1.prisma.assessment_schedule.findMany({
                select: {
                    id: true,
                    assessment_id: true,
                    start_date: true,
                    end_date: true,
                    assessment: {
                        select: {
                            occupation: {
                                select: {
                                    name: true,
                                    scheme: {
                                        select: {
                                            code: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            // if (!schedules || schedules.length === 0) {
            //   throw new NotFoundError('Tidak ada jadwal assessment ditemukan');
            // }
            return schedules.map((s) => ({
                id: s.id,
                assessment_id: s.assessment_id,
                schema_name: s.assessment.occupation.scheme.code,
                occupation_name: s.assessment.occupation.name,
                start_date: s.start_date,
                end_date: s.end_date,
            }));
        });
    }
    static getVerificationDocs() {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = yield db_1.prisma.result_doc.findMany({
                include: {
                    result: {
                        include: {
                            assessee: true,
                        },
                    },
                },
            });
            // if (!docs || docs.length === 0) {
            //   throw new NotFoundError('Tidak ada dokumen verifikasi ditemukan');
            // }
            return docs.map((d) => ({
                id: d.id,
                result_id: d.result_id,
                purpose: d.purpose,
                school_report_card: d.school_report_card,
                field_work_practice_certificate: d.field_work_practice_certificate,
                student_card: d.student_card,
                family_card: d.family_card,
                id_card: d.id_card,
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
