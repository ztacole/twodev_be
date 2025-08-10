import { prisma } from '../../../config/db';
import { ScheduleRequest, ScheduleResponse } from './schedule.type';

export class ScheduleService {

    async createSchedule(data: ScheduleRequest): Promise<ScheduleResponse> {
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

    async getSchedules(): Promise<ScheduleResponse[] | null> {
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

        if (schedules.length === 0) {
            return null;
        }

        return schedules.map(formatScheduleResponse);
    }

    async getScheduleById(id: number): Promise<ScheduleResponse | null> {
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

        return schedule ? formatScheduleResponse(schedule) : null;
    }

    async getActiveSchedules(): Promise<ScheduleResponse[] | null> {
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

        return schedules.length === 0 ? null : schedules.map(formatScheduleResponse);
    }

    async getCompletedSchedules(): Promise<ScheduleResponse[] | null> {
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

        return schedules.length === 0 ? null : schedules.map(formatScheduleResponse);
    }

    async getCompletedSchedulesByAssesseeId(assesseeId: number): Promise<ScheduleResponse[] | null> {
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
        return schedules.length === 0 ? null : schedules.map(formatScheduleResponse);
    }

    async getScheduleDataForExcel() {
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