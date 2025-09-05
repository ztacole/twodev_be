import { JwtPayload } from 'jsonwebtoken';
import { NotFoundError } from '../../common/error';
import { db } from '../../config/drizzle';
import {
  assessment as assessmentTable,
  assessmentSchedule as scheduleTable,
  scheduleDetail as scheduleDetailTable,
  occupation as occupationTable,
  scheme as schemeTable,
  user as userTable,
  assessor as assessorTable,
  assessee as assesseeTable,
  result as resultTable,
} from '../../../drizzle/schema';
import { and, between, eq, gte, lte } from 'drizzle-orm';
import { ScheduleRequest, ScheduleResponse } from './schedule.type';

export class ScheduleService {
    static async createSchedule(data: ScheduleRequest): Promise<ScheduleResponse> {
        const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, Number(data.assessment_id)) });

        if (!assessment) {
            throw new NotFoundError('Assessment');
        }

        const assessorIds = data.schedule_details.map(detail => Number(detail.assessor_id));
        const existingAssessors = assessorIds.length ? await db.select().from(userTable).where(eq(userTable.id, assessorIds[0])) : [];
        if (existingAssessors.length !== assessorIds.length) {
            throw new NotFoundError('Assessor');
        }

        const [created] = await db.insert(scheduleTable).values({
            assessmentId: data.assessment_id,
            startDate: data.start_date as any,
            endDate: data.end_date as any,
        });

        for (const detail of data.schedule_details) {
            await db.insert(scheduleDetailTable).values({
                scheduleId: (created as any).insertId ?? undefined,
                assessorId: Number(detail.assessor_id),
                location: detail.location,
            });
        }

        const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(scheduleTable.assessmentId, data.assessment_id) });
        if (!schedule) throw new NotFoundError('Schedule');
        return await buildScheduleResponse(schedule);
    }

    static async getSchedules(): Promise<ScheduleResponse[]> {
        const schedules = await db.select().from(scheduleTable);
        return Promise.all(schedules.map(s => buildScheduleResponse(s)));
    }

    static async getScheduleById(id: number, user: JwtPayload): Promise<ScheduleResponse> {
        const assessee = await db.select().from(assesseeTable).where(eq(assesseeTable.userId, user.id as any));
        if (!assessee) {
            throw new NotFoundError('Assessee');
        }

        const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(scheduleTable.id, id) });
        if (!schedule) {
            throw new NotFoundError('Schedule');
        }

        return await buildScheduleResponse(schedule, assessee as any);
    }

    static async getActiveSchedules(user: JwtPayload): Promise<ScheduleResponse[]> {
        const assessee = await db.select().from(assesseeTable).where(eq(assesseeTable.userId, user.id as any));
        if (!assessee) {
            throw new NotFoundError('Assessee');
        }

        const now = new Date();
        const schedules = await db.select().from(scheduleTable).where(and(lte(scheduleTable.startDate, now as any), gte(scheduleTable.endDate, now as any)));
        return Promise.all(schedules.map(s => buildScheduleResponse(s, assessee as any)));
    }

    static async getCompletedSchedules(): Promise<ScheduleResponse[]> {
        const now = new Date();
        const schedules = await db.select().from(scheduleTable).where(lte(scheduleTable.endDate, now as any));
        return Promise.all(schedules.map(s => buildScheduleResponse(s)));
    }

    static async getCompletedSchedulesByAssesseeId(assesseeId: number): Promise<ScheduleResponse[]> {
        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, assesseeId) });
        if (!assessee) {
            throw new NotFoundError('Assessee');
        }

        const results = await db.select().from(resultTable).where(eq(resultTable.assesseeId, assesseeId));
        const scheduleIds = new Set<number>();
        for (const r of results) {
            const schedules = await db.select().from(scheduleTable).where(eq(scheduleTable.assessmentId, r.assessmentId));
            for (const s of schedules) scheduleIds.add(s.id);
        }
        const schedules = await db.select().from(scheduleTable).where(eq(scheduleTable.id, Array.from(scheduleIds)[0] || 0));
        return Promise.all(schedules.map(s => buildScheduleResponse(s)));
    }

    static async getScheduleDataForExcel() {
        const schedules = await db.select().from(scheduleTable);

        return Promise.all(schedules.map(async (schedule) => {
            const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, schedule.assessmentId) });
            const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupationId) }) : null;
            const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.schemeId) }) : null;
            return {
                assessment_id: schedule.assessmentId,
                scheme_code: scheme?.code,
                occupation_name: occupation?.name,
                start_date: schedule.startDate,
                end_date: schedule.endDate,
            };
        }));
    }

    static async deleteSchedule(id: number): Promise<void> {
        const existing = await db.query.assessmentSchedule.findFirst({ where: eq(scheduleTable.id, id) });
        if (!existing) {
            throw new NotFoundError('Schedule');
        }
        await db.delete(scheduleDetailTable).where(eq(scheduleDetailTable.scheduleId, id));
        await db.delete(scheduleTable).where(eq(scheduleTable.id, id));
    }
}

interface Assessee {
    id: number;
    user_id: number;
}

async function buildScheduleResponse(schedule: any, user: Assessee[] | null = null): Promise<ScheduleResponse> {
    const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, schedule.assessmentId) });
    const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupationId) }) : null;
    const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.schemeId) }) : null;
    const details = await db.select().from(scheduleDetailTable).where(eq(scheduleDetailTable.scheduleId, schedule.id));
    const detailed = await Promise.all(details.map(async (detail) => {
        const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, detail.assessorId) });
        const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.userId) }) : null;
        const results = await db.select().from(resultTable).where(and(eq(resultTable.assessmentId, schedule.assessmentId), eq(resultTable.assessorId, detail.assessorId)));
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
    }));

    return {
        id: schedule.id,
        assessment: {
            id: assessment?.id,
            code: assessment?.code,
            occupation: {
                id: occupation?.id,
                name: occupation?.name,
                scheme: {
                    id: scheme?.id,
                    code: scheme?.code,
                    name: scheme?.name,
                },
            },
        },
        start_date: schedule.startDate,
        end_date: schedule.endDate,
        schedule_details: detailed,
    } as any;
}