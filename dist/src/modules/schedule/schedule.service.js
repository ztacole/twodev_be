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
            const assessorIds = data.schedule_details.map(detail => Number(detail.assessor_id));
            const existingAssessors = assessorIds.length ? yield drizzle_1.db.select().from(schema_1.user).where((0, drizzle_orm_1.eq)(schema_1.user.id, assessorIds[0])) : [];
            if (existingAssessors.length !== assessorIds.length) {
                throw new error_1.NotFoundError('Assessor');
            }
            const [created] = yield drizzle_1.db.insert(schema_1.assessmentSchedule).values({
                assessmentId: data.assessment_id,
                startDate: data.start_date,
                endDate: data.end_date,
            });
            for (const detail of data.schedule_details) {
                yield drizzle_1.db.insert(schema_1.scheduleDetail).values({
                    scheduleId: (_a = created.insertId) !== null && _a !== void 0 ? _a : undefined,
                    assessorId: Number(detail.assessor_id),
                    location: detail.location,
                });
            }
            const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.assessmentId, data.assessment_id) });
            if (!schedule)
                throw new error_1.NotFoundError('Schedule');
            return yield buildScheduleResponse(schedule);
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
            const assessee = yield drizzle_1.db.select().from(schema_1.assessee).where((0, drizzle_orm_1.eq)(schema_1.assessee.userId, user.id));
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
            const assessee = yield drizzle_1.db.select().from(schema_1.assessee).where((0, drizzle_orm_1.eq)(schema_1.assessee.userId, user.id));
            if (!assessee) {
                throw new error_1.NotFoundError('Assessee');
            }
            const now = new Date();
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.lte)(schema_1.assessmentSchedule.startDate, now), (0, drizzle_orm_1.gte)(schema_1.assessmentSchedule.endDate, now)));
            return Promise.all(schedules.map(s => buildScheduleResponse(s, assessee)));
        });
    }
    static getCompletedSchedules() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule).where((0, drizzle_orm_1.lte)(schema_1.assessmentSchedule.endDate, now));
            return Promise.all(schedules.map(s => buildScheduleResponse(s)));
        });
    }
    static getCompletedSchedulesByAssesseeId(assesseeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, assesseeId) });
            if (!assessee) {
                throw new error_1.NotFoundError('Assessee');
            }
            const results = yield drizzle_1.db.select().from(schema_1.result).where((0, drizzle_orm_1.eq)(schema_1.result.assesseeId, assesseeId));
            const scheduleIds = new Set();
            for (const r of results) {
                const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule).where((0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.assessmentId, r.assessmentId));
                for (const s of schedules)
                    scheduleIds.add(s.id);
            }
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule).where((0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, Array.from(scheduleIds)[0] || 0));
            return Promise.all(schedules.map(s => buildScheduleResponse(s)));
        });
    }
    static getScheduleDataForExcel() {
        return __awaiter(this, void 0, void 0, function* () {
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule);
            return Promise.all(schedules.map((schedule) => __awaiter(this, void 0, void 0, function* () {
                const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, schedule.assessmentId) });
                const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupationId) }) : null;
                const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.schemeId) }) : null;
                return {
                    assessment_id: schedule.assessmentId,
                    scheme_code: scheme === null || scheme === void 0 ? void 0 : scheme.code,
                    occupation_name: occupation === null || occupation === void 0 ? void 0 : occupation.name,
                    start_date: schedule.startDate,
                    end_date: schedule.endDate,
                };
            })));
        });
    }
    static deleteSchedule(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, id) });
            if (!existing) {
                throw new error_1.NotFoundError('Schedule');
            }
            yield drizzle_1.db.delete(schema_1.scheduleDetail).where((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.scheduleId, id));
            yield drizzle_1.db.delete(schema_1.assessmentSchedule).where((0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, id));
        });
    }
}
exports.ScheduleService = ScheduleService;
function buildScheduleResponse(schedule_1) {
    return __awaiter(this, arguments, void 0, function* (schedule, user = null) {
        const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, schedule.assessmentId) });
        const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupationId) }) : null;
        const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.schemeId) }) : null;
        const details = yield drizzle_1.db.select().from(schema_1.scheduleDetail).where((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.scheduleId, schedule.id));
        const detailed = yield Promise.all(details.map((detail) => __awaiter(this, void 0, void 0, function* () {
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, detail.assessorId) });
            const assessorUser = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.userId) }) : null;
            const results = yield drizzle_1.db.select().from(schema_1.result).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessmentId, schedule.assessmentId), (0, drizzle_orm_1.eq)(schema_1.result.assessorId, detail.assessorId)));
            const onGoing = user ? results.find(r => user.find(a => a.id === r.assesseeId)) : null;
            return {
                id: detail.id,
                assessor: assessor && assessorUser ? {
                    id: assessor.id,
                    full_name: assessorUser.fullName,
                    phone_no: assessor.phoneNo,
                } : null,
                location: detail.location,
                on_going: onGoing ? { result_id: onGoing.id, assessee_id: onGoing.assesseeId } : null,
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
            start_date: schedule.startDate,
            end_date: schedule.endDate,
            schedule_details: detailed,
        };
    });
}
