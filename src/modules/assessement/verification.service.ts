import { db } from '../../config/drizzle';
import { NotFoundError } from '../../common/error';
import { resultDoc as resultDocTable, result as resultTable, assessee as assesseeTable, assessor as assessorTable, user as userTable } from '../../../drizzle/schema';
import { and, desc, eq } from 'drizzle-orm';

export const getPendingVerifications = async () => {
	const docs = await db.select().from(resultDocTable).where(eq(resultDocTable.approved, false)).orderBy(desc(resultDocTable.id));
	return Promise.all(docs.map(async (doc) => {
		const result = await db.query.result.findFirst({ where: eq(resultTable.id, doc.resultId) });
		const assessee = result ? await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assesseeId) }) : null;
		const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;
		const assessor = result ? await db.query.assessor.findFirst({ where: eq(assessorTable.id, result.assessorId) }) : null;
		const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.userId) }) : null;
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
		const result = await db.query.result.findFirst({ where: eq(resultTable.id, doc.resultId) });
		const assessee = result ? await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assesseeId) }) : null;
		const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;
		const assessor = result ? await db.query.assessor.findFirst({ where: eq(assessorTable.id, result.assessorId) }) : null;
		const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.userId) }) : null;
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

export const getVerificationDetail = async (resultId: number) => {
	const result = await db.query.result.findFirst({
		where: eq(resultTable.id, resultId),
	});

	if (!result) throw new NotFoundError('Result');

	const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, result.assesseeId) });
	const assesseeUser = assessee ? await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) }) : null;
	const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, result.assessorId) });
	const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.userId) }) : null;
	const docs = await db.select().from(resultDocTable).where(eq(resultDocTable.resultId, result.id));

	return {
		...result,
		assessee: assessee && assesseeUser ? { ...assessee, user: assesseeUser, jobs: [] } : null,
		assessor: assessor && assessorUser ? { ...assessor, user: assessorUser } : null,
		docs,
	};
};

export const approveVerification = async (resultId: number) => {
	const existing = await db.query.result.findFirst({ where: eq(resultTable.id, resultId) });
	if (!existing) throw new NotFoundError('Result');

	await db.update(resultTable).set({ isCompetent: true }).where(eq(resultTable.id, resultId));
	await db.update(resultDocTable).set({ approved: true }).where(eq(resultDocTable.resultId, resultId));

	return { success: true };
};
