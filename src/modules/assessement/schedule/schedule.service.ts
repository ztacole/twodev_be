import { NotFoundError } from '../../../common/error';
import { prisma } from '../../../config/db';
import { ScheduleRequest, ScheduleResponse } from './schedule.type';

export class ScheduleService {
    static async createSchedule(data: ScheduleRequest): Promise<ScheduleResponse> {
        const assessment = await prisma.assessment.findUnique({
            where: {
                id: data.assessment_id
            }
        });

        if (!assessment) {
            throw new NotFoundError('Assessment');
        }

        const assessorIds = data.schedule_details.map(detail => detail.assessor_id);
        const existingAssessors = await prisma.user.findMany({
            where: {
                id: { in: assessorIds }
            }
        });

        if (existingAssessors.length !== assessorIds.length) {
            throw new NotFoundError('Assessor');
        }

        const schedule = await prisma.assessment_Schedule.create({
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
    }

    static async getSchedules(): Promise<ScheduleResponse[]> {
        const schedules = await prisma.assessment_Schedule.findMany({
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
    }

    static async getScheduleById(id: number): Promise<ScheduleResponse> {
        const schedule = await prisma.assessment_Schedule.findUnique({
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
            throw new NotFoundError('Schedule');
        }

        return formatScheduleResponse(schedule);
    }

    static async getActiveSchedules(): Promise<ScheduleResponse[]> {
        const schedules = await prisma.assessment_Schedule.findMany({
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
    }

    static async getCompletedSchedules(): Promise<ScheduleResponse[]> {
        const schedules = await prisma.assessment_Schedule.findMany({
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
    }

    static async getCompletedSchedulesByAssesseeId(assesseeId: number): Promise<ScheduleResponse[]> {
        const assessee = await prisma.assessee.findUnique({ where: { id: assesseeId } });
        if (!assessee) {
            throw new NotFoundError('Assessee');
        }

        const results = await prisma.result.findMany({
            where: { assessee_id: assesseeId },
            include: {
                assessment: {
                    include: {
                        assessment_schedule: {
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
    
        const schedules = results.flatMap(result => result.assessment?.assessment_schedule ?? []);
        return schedules.map(formatScheduleResponse);
    }

    static async getScheduleDataForExcel() {
        const schedules = await prisma.assessment_Schedule.findMany({
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
    }
}

function formatScheduleResponse(schedule: any): ScheduleResponse {
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