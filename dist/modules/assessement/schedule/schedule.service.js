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
const error_1 = require("../../../common/error");
const db_1 = require("../../../config/db");
class ScheduleService {
    static createSchedule(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessment = yield db_1.prisma.assessment.findUnique({
                where: {
                    id: data.assessment_id
                }
            });
            if (!assessment) {
                throw new error_1.NotFoundError('Assessment');
            }
            const assessorIds = data.schedule_details.map(detail => detail.assessor_id);
            const existingAssessors = yield db_1.prisma.user.findMany({
                where: {
                    id: { in: assessorIds }
                }
            });
            if (existingAssessors.length !== assessorIds.length) {
                throw new error_1.NotFoundError('Assessor');
            }
            const schedule = yield db_1.prisma.assessment_schedule.create({
                data: {
                    assessment_id: data.assessment_id,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    schedule_details: {
                        create: data.schedule_details.map(detail => ({
                            assessor_id: detail.assessor_id,
                            location: detail.location
                        }))
                    }
                },
                include: {
                    schedule_details: true,
                    assessment: {
                        include: {
                            occupation: {
                                include: {
                                    scheme: true
                                }
                            }
                        }
                    }
                }
            });
            return formatScheduleResponse(schedule);
        });
    }
    static getSchedules() {
        return __awaiter(this, void 0, void 0, function* () {
            const schedules = yield db_1.prisma.assessment_schedule.findMany({
                include: {
                    assessment: {
                        include: {
                            occupation: {
                                include: {
                                    scheme: true,
                                },
                            },
                        },
                    },
                },
            });
            return schedules.map(formatScheduleResponse);
        });
    }
    static getScheduleById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedule = yield db_1.prisma.assessment_schedule.findUnique({
                where: { id },
                include: {
                    assessment: {
                        include: {
                            occupation: {
                                include: {
                                    scheme: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!schedule) {
                throw new error_1.NotFoundError('Schedule');
            }
            return formatScheduleResponse(schedule);
        });
    }
    static getActiveSchedules() {
        return __awaiter(this, void 0, void 0, function* () {
            const schedules = yield db_1.prisma.assessment_schedule.findMany({
                where: { start_date: { lte: new Date() }, end_date: { gte: new Date() } },
                include: {
                    assessment: {
                        include: {
                            occupation: {
                                include: {
                                    scheme: true,
                                },
                            },
                        },
                    },
                },
            });
            return schedules.map(formatScheduleResponse);
        });
    }
    static getCompletedSchedules() {
        return __awaiter(this, void 0, void 0, function* () {
            const schedules = yield db_1.prisma.assessment_schedule.findMany({
                where: { end_date: { lte: new Date() } },
                include: {
                    assessment: {
                        include: {
                            occupation: {
                                include: {
                                    scheme: true,
                                },
                            },
                        },
                    },
                },
            });
            return schedules.map(formatScheduleResponse);
        });
    }
    static getCompletedSchedulesByAssesseeId(assesseeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessee = yield db_1.prisma.assessee.findUnique({ where: { id: assesseeId } });
            if (!assessee) {
                throw new error_1.NotFoundError('Assessee');
            }
            const results = yield db_1.prisma.result.findMany({
                where: { assessee_id: assesseeId },
                include: {
                    assessment: {
                        include: {
                            assessment_schedules: {
                                include: {
                                    assessment: {
                                        include: {
                                            occupation: {
                                                include: { scheme: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            const schedules = results.flatMap(result => { var _a, _b; return (_b = (_a = result.assessment) === null || _a === void 0 ? void 0 : _a.assessment_schedules) !== null && _b !== void 0 ? _b : []; });
            return schedules.map(formatScheduleResponse);
        });
    }
    static getScheduleDataForExcel() {
        return __awaiter(this, void 0, void 0, function* () {
            const schedules = yield db_1.prisma.assessment_schedule.findMany({
                include: {
                    assessment: {
                        include: {
                            occupation: {
                                include: {
                                    scheme: true,
                                },
                            },
                        },
                    },
                },
            });
            return schedules.map(schedule => ({
                assessment_id: schedule.assessment_id,
                scheme_code: schedule.assessment.occupation.scheme.code,
                occupation_name: schedule.assessment.occupation.name,
                start_date: schedule.start_date,
                end_date: schedule.end_date,
            }));
        });
    }
}
exports.ScheduleService = ScheduleService;
function formatScheduleResponse(schedule) {
    return {
        id: schedule.id,
        assessment: {
            id: schedule.assessment.id,
            code: schedule.assessment.code,
            occupation: {
                id: schedule.assessment.occupation.id,
                name: schedule.assessment.occupation.name,
                scheme: {
                    id: schedule.assessment.occupation.scheme.id,
                    code: schedule.assessment.occupation.scheme.code,
                    name: schedule.assessment.occupation.scheme.name,
                },
            },
        },
        start_date: schedule.start_date,
        end_date: schedule.end_date,
    };
}
