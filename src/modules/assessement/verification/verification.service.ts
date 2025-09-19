import { db } from '../../../config/drizzle';
import { NotFoundError } from '../../../common/error';
import { resultDoc as resultDocTable, result as resultTable, assessee as assesseeTable, assessor as assessorTable, user as userTable, scheduleDetail as scheduleDetailTable, assessmentSchedule as assessmentScheduleTable } from '../../../../drizzle/schema';
import { and, desc, eq } from 'drizzle-orm';

export const getPendingVerifications = async (schedule_detail_id?: number) => {
	const filterId = typeof schedule_detail_id === 'number' && Number.isFinite(schedule_detail_id) ? schedule_detail_id : undefined;
	const docs = await db.select().from(resultDocTable).where(eq(resultDocTable.approved, false)).orderBy(desc(resultDocTable.id));
	return Promise.all(docs.map(async (doc) => {
		const result = await db.query.result.findFirst({ where: eq(resultTable.id, doc.result_id) });
		if (filterId !== undefined) {
			const detail = await db.query.scheduleDetail.findFirst({ where: eq(scheduleDetailTable.id, filterId) });
			if (!detail) return null as any;
			const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(assessmentScheduleTable.id, detail.schedule_id) });
			if (!schedule) return null as any;
			if (!result || result.assessment_id !== schedule.assessment_id || result.assessor_id !== detail.assessor_id) return null as any;
		}
		const assessee = result ? await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assessee_id) }) : null;
		const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;
		const assessor = result ? await db.query.assessor.findFirst({ where: eq(assessorTable.id, result.assessor_id) }) : null;
		const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) }) : null;
		return {
			...doc,
			result: result ? {
				...result,
				assessee: assessee && assesseeUser ? { ...assessee, user: assesseeUser } : null,
				assessor: assessor && assessorUser ? { ...assessor, user: assessorUser } : null,
			} : null,
		};
	})).then(rows => rows.filter(Boolean));
};

export const getApprovedVerifications = async (schedule_detail_id?: number) => {
	const filterId = typeof schedule_detail_id === 'number' && Number.isFinite(schedule_detail_id) ? schedule_detail_id : undefined;
	const docs = await db.select().from(resultDocTable).where(eq(resultDocTable.approved, true)).orderBy(desc(resultDocTable.id));
	return Promise.all(docs.map(async (doc) => {
		const result = await db.query.result.findFirst({ where: eq(resultTable.id, doc.result_id) });
		if (filterId !== undefined) {
			const detail = await db.query.scheduleDetail.findFirst({ where: eq(scheduleDetailTable.id, filterId) });
			if (!detail) return null as any;
			const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(assessmentScheduleTable.id, detail.schedule_id) });
			if (!schedule) return null as any;
			if (!result || result.assessment_id !== schedule.assessment_id || result.assessor_id !== detail.assessor_id) return null as any;
		}
		const assessee = result ? await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assessee_id) }) : null;
		const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;
		const assessor = result ? await db.query.assessor.findFirst({ where: eq(assessorTable.id, result.assessor_id) }) : null;
		const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) }) : null;
		return {
			...doc,
			result: result ? {
				...result,
				assessee: assessee && assesseeUser ? { ...assessee, user: assesseeUser } : null,
				assessor: assessor && assessorUser ? { ...assessor, user: assessorUser } : null,
			} : null,
		};
	})).then(rows => rows.filter(Boolean));
};

export const getVerificationDetail = async (result_id: number) => {
	const result = await db.query.result.findFirst({
		where: eq(resultTable.id, result_id),
	});

	if (!result) throw new NotFoundError('Result');

	const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assessee_id) });
	const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;
	const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, result.assessor_id) });
	const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) }) : null;
	const docs = await db.select().from(resultDocTable).where(eq(resultDocTable.result_id, result.id));

	return {
		...result,
		assessee: assessee && assesseeUser ? { ...assessee, user: assesseeUser, jobs: [] } : null,
		assessor: assessor && assessorUser ? { ...assessor, user: assessorUser } : null,
		docs,
	};
};

export const approveVerification = async (result_id: number) => {
	const existing = await db.query.result.findFirst({ where: eq(resultTable.id, result_id) });
	if (!existing) throw new NotFoundError('Result');

	await db.update(resultTable).set({ is_competent: true }).where(eq(resultTable.id, result_id));
	await db.update(resultDocTable).set({ approved: true }).where(eq(resultDocTable.result_id, result_id));

	return { success: true };
};

export const approveVerificationByScheduleDetail = async (schedule_detail_id: number) => {
	const detail = await db.query.scheduleDetail.findFirst({ where: eq(scheduleDetailTable.id, schedule_detail_id) });
	if (!detail) throw new NotFoundError('Schedule Detail');

	const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(assessmentScheduleTable.id, detail.schedule_id) });
	if (!schedule) throw new NotFoundError('Assessment Schedule');

	const results = await db.select().from(resultTable)
		.where(and(eq(resultTable.assessment_id, schedule.assessment_id), eq(resultTable.assessor_id, detail.assessor_id)));

	const updated: number[] = [];
	for (const r of results) {
		await db.update(resultTable).set({ is_competent: true }).where(eq(resultTable.id, r.id));
		await db.update(resultDocTable).set({ approved: true }).where(eq(resultDocTable.result_id, r.id));
		updated.push(r.id);
	}

	return { success: true, updated_result_ids: updated };
};

export const getVerificationsByScheduleDetail = async (schedule_detail_id: number) => {
	const detail = await db.query.scheduleDetail.findFirst({ where: eq(scheduleDetailTable.id, schedule_detail_id) });
	if (!detail) throw new NotFoundError('Schedule Detail');

	const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(assessmentScheduleTable.id, detail.schedule_id) });
	if (!schedule) throw new NotFoundError('Assessment Schedule');

	const results = await db.select().from(resultTable)
		.where(and(eq(resultTable.assessment_id, schedule.assessment_id), eq(resultTable.assessor_id, detail.assessor_id)));

	return Promise.all(results.map(async (r) => {
		const docs = await db.select().from(resultDocTable).where(eq(resultDocTable.result_id, r.id));
		const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, r.assessee_id) });
		const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) }) : null;
		return {
			result: r,
			is_competent: r.is_competent,
			doc_approved: docs.some(d => d.approved === true),
			doc_ids: docs.map(d => d.id),
			assessee: assessee && assesseeUser ? { ...assessee, user: assesseeUser } : null,
		};
	}));
};
