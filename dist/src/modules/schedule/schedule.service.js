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
exports.ScheduleService = void 0;
const error_1 = require("../../common/error");
const drizzle_1 = require("../../config/drizzle");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class ScheduleService {
    static createSchedule(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, Number(data.assessment_id)) });
            if (!assessment) {
                throw new error_1.NotFoundError('Assessment');
            }
            const assessor_ids = data.schedule_details.map(detail => Number(detail.assessor_id));
            const existingAssessors = assessor_ids.length ? yield drizzle_1.db.select().from(schema_1.user).where((0, drizzle_orm_1.eq)(schema_1.user.id, assessor_ids[0])) : [];
            if (existingAssessors.length !== assessor_ids.length) {
                throw new error_1.NotFoundError('Assessor');
            }
            const [created] = yield drizzle_1.db.insert(schema_1.assessmentSchedule).values({
                assessment_id: data.assessment_id,
                start_date: new Date(data.start_date),
                end_date: new Date(data.end_date),
            });
            for (const detail of data.schedule_details) {
                yield drizzle_1.db.insert(schema_1.scheduleDetail).values({
                    schedule_id: (_a = created.insertId) !== null && _a !== void 0 ? _a : undefined,
                    assessor_id: Number(detail.assessor_id),
                    location: detail.location,
                });
            }
            const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.assessment_id, data.assessment_id) });
            if (!schedule)
                throw new error_1.NotFoundError('Schedule');
            return yield buildScheduleResponse(schedule);
        });
    }
    static updateSchedule(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, id) });
            if (!existing) {
                throw new error_1.NotFoundError('Schedule');
            }
            yield drizzle_1.db.update(schema_1.assessmentSchedule).set({
                start_date: new Date(data.start_date),
                end_date: new Date(data.end_date),
            }).where((0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, id));
            const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, id) });
            if (!schedule)
                throw new error_1.NotFoundError('Schedule');
            return yield buildScheduleResponse(schedule);
        });
    }
    static deleteSchedule(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, id) });
            if (!existing) {
                throw new error_1.NotFoundError('Schedule');
            }
            yield drizzle_1.db.delete(schema_1.scheduleDetail).where((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.schedule_id, id));
            yield drizzle_1.db.delete(schema_1.assessmentSchedule).where((0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, id));
        });
    }
    static getSchedules() {
        return __awaiter(this, void 0, void 0, function* () {
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule);
            return Promise.all(schedules.map(s => buildScheduleResponse(s)));
        });
    }
    static getScheduleById(id, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessee = yield drizzle_1.db.select().from(schema_1.assessee).where((0, drizzle_orm_1.eq)(schema_1.assessee.user_id, user.id));
            if (!assessee) {
                throw new error_1.NotFoundError('Assessee');
            }
            const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, id) });
            if (!schedule) {
                throw new error_1.NotFoundError('Schedule');
            }
            return yield buildScheduleResponse(schedule, assessee);
        });
    }
    static getActiveSchedules(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessee = yield drizzle_1.db.select().from(schema_1.assessee).where((0, drizzle_orm_1.eq)(schema_1.assessee.user_id, user.id));
            if (!assessee) {
                throw new error_1.NotFoundError('Assessee');
            }
            const now = new Date();
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.lte)(schema_1.assessmentSchedule.start_date, now), (0, drizzle_orm_1.gte)(schema_1.assessmentSchedule.end_date, now)));
            return Promise.all(schedules.map(s => buildScheduleResponse(s, assessee)));
        });
    }
    static getActiveSchedulesAssessor(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessor = yield drizzle_1.db.select().from(schema_1.assessor).where((0, drizzle_orm_1.eq)(schema_1.assessor.user_id, user.id));
            if (!assessor) {
                throw new error_1.NotFoundError('Assessor');
            }
            const now = new Date();
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.lte)(schema_1.assessmentSchedule.start_date, now), (0, drizzle_orm_1.gte)(schema_1.assessmentSchedule.end_date, now)));
            return Promise.all(schedules.map(s => buildScheduleResponse(s)));
        });
    }
    static getCompletedSchedules(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessees = yield drizzle_1.db.select().from(schema_1.assessee).where((0, drizzle_orm_1.eq)(schema_1.assessee.user_id, user.id));
            if (!assessees)
                return [];
            let results = [];
            // Config header dan property
            const headerConfigs = [
                { key: 'APL02', find: (id) => drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, id) }) },
                { key: 'IA01', find: (id) => drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.result_id, id) }) },
                { key: 'IA02', find: (id) => drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.result_id, id) }) },
                { key: 'IA03', find: (id) => drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, id) }) },
                { key: 'IA05', find: (id) => drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, id) }) },
                { key: 'AK01', find: (id) => drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.result_id, id) }) },
                { key: 'AK02', find: (id) => drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, id) }) },
                { key: 'AK05', find: (id) => drizzle_1.db.query.resultAk05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk05.result_id, id) }) },
            ];
            for (const assessee of assessees) {
                const rawResults = yield drizzle_1.db.select().from(schema_1.result).where((0, drizzle_orm_1.eq)(schema_1.result.assessee_id, assessee.id));
                if (rawResults.length === 0)
                    continue;
                for (const r of rawResults) {
                    // Ambil semua header sekaligus
                    const headers = {};
                    for (const config of headerConfigs) {
                        headers[config.key] = yield config.find(r.id);
                    }
                    const resultAPL02 = headers.APL02;
                    const resultIA01 = headers.IA01;
                    const resultIA02 = headers.IA02;
                    const resultIA03 = headers.IA03;
                    const resultIA05 = headers.IA05;
                    const resultAK01 = headers.AK01;
                    const resultAK02 = headers.AK02;
                    const resultAK05 = headers.AK05;
                    // Penentuan status
                    let status = "On Going";
                    if (resultAPL02 && !resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee)
                        status = "Not Competent";
                    if (resultIA01 && !resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee)
                        status = "Not Competent";
                    if ((resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                        (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                        (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                        (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                        (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee) : true) &&
                        (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                        (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                        (resultAK05 && resultAK05.approved_assessor) &&
                        !resultAK05.is_competent && !r.is_competent)
                        status = "Not Competent";
                    if ((resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                        (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                        (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                        (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                        (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee && resultIA05.is_achieved) : true) &&
                        (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                        (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                        (resultAK05 && resultAK05.approved_assessor && resultAK05.is_competent) &&
                        r.is_competent)
                        status = "Competent";
                    results.push({ status, detail: yield buildActiveScheduleResponse(r) });
                }
            }
            return results;
        });
    }
    static getScheduleDataForExcel() {
        return __awaiter(this, void 0, void 0, function* () {
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule);
            return Promise.all(schedules.map((schedule) => __awaiter(this, void 0, void 0, function* () {
                const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, schedule.assessment_id) });
                const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) }) : null;
                const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) }) : null;
                return {
                    assessment_id: schedule.assessment_id,
                    scheme_code: scheme === null || scheme === void 0 ? void 0 : scheme.code,
                    occupation_name: occupation === null || occupation === void 0 ? void 0 : occupation.name,
                    start_date: schedule.start_date,
                    end_date: schedule.end_date,
                };
            })));
        });
    }
}
exports.ScheduleService = ScheduleService;
function buildScheduleResponse(schedule_1) {
    return __awaiter(this, arguments, void 0, function* (schedule, user = null) {
        const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, schedule.assessment_id) });
        const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) }) : null;
        const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) }) : null;
        const details = yield drizzle_1.db.select().from(schema_1.scheduleDetail).where((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.schedule_id, schedule.id));
        const detailed = yield Promise.all(details.map((detail) => __awaiter(this, void 0, void 0, function* () {
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, detail.assessor_id) });
            const assessorUser = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) }) : null;
            const results = yield drizzle_1.db.select().from(schema_1.result).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessment_id, schedule.assessment_id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, detail.assessor_id)));
            const onGoing = user ? results.find(r => user.find(a => a.id === r.assessee_id)) : null;
            return {
                id: detail.id,
                assessor: assessor && assessorUser ? {
                    id: assessor.id,
                    full_name: assessorUser.full_name,
                    phone_no: assessor.phone_no,
                } : null,
                location: detail.location,
                on_going: onGoing ? { result_id: onGoing.id, assessee_id: onGoing.assessee_id } : null,
            };
        })));
        return {
            id: schedule.id,
            assessment: {
                id: assessment === null || assessment === void 0 ? void 0 : assessment.id,
                code: assessment === null || assessment === void 0 ? void 0 : assessment.code,
                occupation: {
                    id: occupation === null || occupation === void 0 ? void 0 : occupation.id,
                    name: occupation === null || occupation === void 0 ? void 0 : occupation.name,
                    scheme: {
                        id: scheme === null || scheme === void 0 ? void 0 : scheme.id,
                        code: scheme === null || scheme === void 0 ? void 0 : scheme.code,
                        name: scheme === null || scheme === void 0 ? void 0 : scheme.name,
                    },
                },
            },
            start_date: schedule.start_date,
            end_date: schedule.end_date,
            schedule_details: detailed,
        };
    });
}
function buildActiveScheduleResponse(result) {
    return __awaiter(this, void 0, void 0, function* () {
        const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, result.assessment_id) });
        const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) }) : null;
        const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) }) : null;
        const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.assessment_id, result.assessment_id) });
        const detail = yield drizzle_1.db.query.scheduleDetail.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.schedule_id, schedule.id), (0, drizzle_orm_1.eq)(schema_1.scheduleDetail.assessor_id, result.assessor_id)) });
        const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, detail.assessor_id) });
        const assessorUser = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) });
        return {
            id: schedule.id,
            assessment: {
                id: assessment.id,
                code: assessment.code,
                occupation: {
                    id: occupation.id,
                    name: occupation.name,
                    scheme: {
                        id: scheme.id,
                        code: scheme.code,
                        name: scheme.name,
                    },
                },
            },
            start_date: schedule.start_date.toISOString(),
            end_date: schedule.end_date.toISOString(),
            schedule_details: {
                id: detail.id,
                assessor: {
                    id: assessor.id,
                    full_name: assessorUser.full_name,
                    phone_no: assessor.phone_no,
                },
                location: detail.location,
            },
        };
    });
}
