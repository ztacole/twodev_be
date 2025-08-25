import { JwtPayload } from 'jsonwebtoken';
import { NotFoundError } from '../../common/error';
import { prisma } from '../../config/db';
import { ScheduleRequest, ScheduleResponse } from './schedule.type';

export class ScheduleService {
    static async createSchedule(data: ScheduleRequest): Promise<ScheduleResponse> {
        const assessment = await prisma.assessment.findUnique({
            where: {
                id: Number(data.assessment_id)
            }
        });

        if (!assessment) {
            throw new NotFoundError('Assessment');
        }

        const assessorIds = data.schedule_details.map(detail => Number(detail.assessor_id));
        const existingAssessors = await prisma.user.findMany({
            where: {
                id: { in: assessorIds }
            }
        });

        if (existingAssessors.length !== assessorIds.length) {
            throw new NotFoundError('Assessor');
        }

        const schedule = await prisma.assessment_schedule.create({
            data: {
                assessment_id: data.assessment_id,
                start_date: data.start_date,
                end_date: data.end_date,
                schedule_details: {
                    create: data.schedule_details.map(detail => ({
                        assessor_id: Number(detail.assessor_id),
                        location: detail.location
                    }))
                }
            },
            include: {
                assessment: {
                    include: {
                        occupation: {
                            include: {
                                scheme: true
                            }
                        }
                    }
                },
                schedule_details: {
                    include: {
                        assessor: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });

        return formatScheduleResponse(schedule);
    }

    static async getSchedules(): Promise<ScheduleResponse[]> {
        const schedules = await prisma.assessment_schedule.findMany({
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
                schedule_details: {
                    include: {
                        assessor: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            },
        });

        return schedules.map(schedule => formatScheduleResponse(schedule));
    }

    static async getScheduleById(id: number, user: JwtPayload): Promise<ScheduleResponse> {
        const assessee = await prisma.assessee.findMany({
            where: {
                user_id: user.id
            }
        });
        if (!assessee) {
            throw new NotFoundError('Assessee');
        }

        const schedule = await prisma.assessment_schedule.findUnique({
            where: { id },
            include: {
                assessment: {
                    include: {
                        occupation: {
                            include: {
                                scheme: true,
                            },
                        },
                        results: true
                    },
                },
                schedule_details: {
                    include: {
                        assessor: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            },
        });

        if (!schedule) {
            throw new NotFoundError('Schedule');
        }

        return formatScheduleResponse(schedule, assessee);
    }

    static async getActiveSchedules(user: JwtPayload): Promise<ScheduleResponse[]> {
        const assessee = await prisma.assessee.findMany({
            where: {
                user_id: user.id
            }
        });
        if (!assessee) {
            throw new NotFoundError('Assessee');
        }

        const schedules = await prisma.assessment_schedule.findMany({
            where: { start_date: { lte: new Date() }, end_date: { gte: new Date() } },
            include: {
                assessment: {
                    include: {
                        occupation: {
                            include: {
                                scheme: true,
                            },
                        },
                        results: true
                    },
                },
                schedule_details: {
                    include: {
                        assessor: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            },
        });

        return schedules.map(schedule => formatScheduleResponse(schedule, assessee));
    }

    static async getCompletedSchedules(): Promise<ScheduleResponse[]> {
        const schedules = await prisma.assessment_schedule.findMany({
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
                schedule_details: {
                    include: {
                        assessor: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            },
        });

        return schedules.map(schedule => formatScheduleResponse(schedule));
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
                },
                assessor: {
                    include: {
                        user: true
                    }
                }
            }
        });

        const schedules = results.flatMap(result => result.assessment?.assessment_schedules ?? []);
        return schedules.map(schedule => formatScheduleResponse(schedule));
    }

    static async getScheduleDataForExcel() {
        const schedules = await prisma.assessment_schedule.findMany({
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

interface Assessee {
    id: number;
    user_id: number;
}

function formatScheduleResponse(schedule: any, user: Assessee[] | null = null): ScheduleResponse {
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
        schedule_details: schedule.schedule_details.map((detail: any) => {
            const result = user ? schedule.assessment.results.find((result: any) => result.assessor_id === detail.assessor_id && user.find(assessee => assessee.id === result.assessee_id)?.id) : null;
            return {
                id: detail.id,
                assessor: {
                    id: detail.assessor.id,
                    full_name: detail.assessor.user.full_name,
                    phone_no: detail.assessor.phone_no,
                },
                location: detail.location,
                on_going: result ? {
                    result_id: result.id,
                    assessee_id: result.assessee_id,
                } : null
            }
        }),
    };
}