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

        const assessor_ids = data.schedule_details.map(detail => Number(detail.assessor_id));
        const existingAssessors = assessor_ids.length ? await db.select().from(userTable).where(eq(userTable.id, assessor_ids[0])) : [];
        if (existingAssessors.length !== assessor_ids.length) {
            throw new NotFoundError('Assessor');
        }

        const [created] = await db.insert(scheduleTable).values({
            assessment_id: data.assessment_id,
            start_date: new Date(data.start_date),
            end_date: new Date(data.end_date),
        });

        for (const detail of data.schedule_details) {
            await db.insert(scheduleDetailTable).values({
                schedule_id: (created as any).insertId ?? undefined,
                assessor_id: Number(detail.assessor_id),
                location: detail.location,
            });
        }

        const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(scheduleTable.assessment_id, data.assessment_id) });
        if (!schedule) throw new NotFoundError('Schedule');
        return await buildScheduleResponse(schedule);
    }

    static async getSchedules(): Promise<ScheduleResponse[]> {
        const schedules = await db.select().from(scheduleTable);
        return Promise.all(schedules.map(s => buildScheduleResponse(s)));
    }

    static async getScheduleById(id: number, user: JwtPayload): Promise<ScheduleResponse> {
        const assessee = await db.select().from(assesseeTable).where(eq(assesseeTable.user_id, user.id as any));
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
        const assessee = await db.select().from(assesseeTable).where(eq(assesseeTable.user_id, user.id as any));
        if (!assessee) {
            throw new NotFoundError('Assessee');
        }

        const now = new Date();
        const schedules = await db.select().from(scheduleTable).where(and(lte(scheduleTable.start_date, now as any), gte(scheduleTable.end_date, now as any)));
        return Promise.all(schedules.map(s => buildScheduleResponse(s, assessee as any)));
    }

    static async getActiveSchedulesAssessor(user: JwtPayload): Promise<ScheduleResponse[]> {
        const assessor = await db.select().from(assessorTable).where(eq(assessorTable.user_id, user.id as any));
        if (!assessor) {
            throw new NotFoundError('Assessor');
        }

        const now = new Date();
        const schedules = await db.select().from(scheduleTable).where(and(lte(scheduleTable.start_date, now as any), gte(scheduleTable.end_date, now as any)));
        return Promise.all(schedules.map(s => buildScheduleResponse(s)));
    }

    static async getCompletedSchedules(): Promise<ScheduleResponse[]> {
        const now = new Date();
        const schedules = await db.select().from(scheduleTable).where(lte(scheduleTable.end_date, now as any));
        return Promise.all(schedules.map(s => buildScheduleResponse(s)));
    }

    static async getCompletedSchedulesByAssesseeId(assessee_id: number): Promise<ScheduleResponse[]> {
        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, assessee_id) });
        if (!assessee) {
            throw new NotFoundError('Assessee');
        }

        const results = await db.select().from(resultTable).where(eq(resultTable.assessee_id, assessee_id));
        const schedule_ids = new Set<number>();
        for (const r of results) {
            const schedules = await db.select().from(scheduleTable).where(eq(scheduleTable.assessment_id, r.assessment_id));
            for (const s of schedules) schedule_ids.add(s.id);
        }
        const schedules = await db.select().from(scheduleTable).where(eq(scheduleTable.id, Array.from(schedule_ids)[0] || 0));
        return Promise.all(schedules.map(s => buildScheduleResponse(s)));
    }

    static async getScheduleDataForExcel() {
        const schedules = await db.select().from(scheduleTable);

        return Promise.all(schedules.map(async (schedule) => {
            const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, schedule.assessment_id) });
            const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) }) : null;
            const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) }) : null;
            return {
                assessment_id: schedule.assessment_id,
                scheme_code: scheme?.code,
                occupation_name: occupation?.name,
                start_date: schedule.start_date,
                end_date: schedule.end_date,
            };
        }));
    }

    static async deleteSchedule(id: number): Promise<void> {
        const existing = await db.query.assessmentSchedule.findFirst({ where: eq(scheduleTable.id, id) });
        if (!existing) {
            throw new NotFoundError('Schedule');
        }
        await db.delete(scheduleDetailTable).where(eq(scheduleDetailTable.schedule_id, id));
        await db.delete(scheduleTable).where(eq(scheduleTable.id, id));
    }
}

interface Assessee {
    id: number;
    user_id: number;
}

async function buildScheduleResponse(schedule: any, user: Assessee[] | null = null): Promise<ScheduleResponse> {
    const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, schedule.assessment_id) });
    const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) }) : null;
    const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) }) : null;
    const details = await db.select().from(scheduleDetailTable).where(eq(scheduleDetailTable.schedule_id, schedule.id));
    const detailed = await Promise.all(details.map(async (detail) => {
        const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, detail.assessor_id) });
        const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) }) : null;
        const results = await db.select().from(resultTable).where(and(eq(resultTable.assessment_id, schedule.assessment_id), eq(resultTable.assessor_id, detail.assessor_id)));
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
        start_date: schedule.start_date,
        end_date: schedule.end_date,
        schedule_details: detailed,
    } as any;
}