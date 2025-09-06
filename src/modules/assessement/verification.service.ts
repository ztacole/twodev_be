import { db } from '../../config/drizzle';
import { NotFoundError } from '../../common/error';
import { resultDoc as resultDocTable, result as resultTable, assessee as assesseeTable, assessor as assessorTable, user as userTable } from '../../../drizzle/schema';
import { and, desc, eq } from 'drizzle-orm';

export const getPendingVerifications = async () => {
	const docs = await db.select().from(resultDocTable).where(eq(resultDocTable.approved, false)).orderBy(desc(resultDocTable.id));
	return Promise.all(docs.map(async (doc) => {
		const result = await db.query.result.findFirst({ where: eq(resultTable.id, doc.result_id) });
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
	}));
};

export const getApprovedVerifications = async () => {
	const docs = await db.select().from(resultDocTable).where(eq(resultDocTable.approved, true)).orderBy(desc(resultDocTable.id));
	return Promise.all(docs.map(async (doc) => {
		const result = await db.query.result.findFirst({ where: eq(resultTable.id, doc.result_id) });
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
	}));
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
