import { prisma } from '../../config/db';
import { NotFoundError } from '../../common/error';

export const getPendingVerifications = async () => {
	const docs = await prisma.result_doc.findMany({
		where: { approved: false },
		include: {
			result: {
				include: {
					assessee: { include: { user: true } },
					assessor: { include: { user: true } }
				}
			}
		},
		orderBy: { id: 'desc' }
	});

	return docs;
};

export const getApprovedVerifications = async () => {
	const docs = await prisma.result_doc.findMany({
		where: { approved: true },
		include: {
			result: {
				include: {
					assessee: { include: { user: true } },
					assessor: { include: { user: true } }
				}
			}
		},
		orderBy: { id: 'desc' }
	});

	return docs;
};

export const getVerificationDetail = async (resultId: number) => {
	const result = await prisma.result.findUnique({
		where: { id: resultId },
		include: {
			assessee: { include: { user: true, jobs: true } },
			assessor: { include: { user: true } },
			docs: true
		}
	});

	if (!result) throw new NotFoundError('Result');
	return result;
};

export const approveVerification = async (resultId: number) => {
	const existing = await prisma.result.findUnique({ where: { id: resultId }, include: { docs: true } });
	if (!existing) throw new NotFoundError('Result');

	await prisma.result.update({ where: { id: resultId }, data: { is_competent: true } });

	// mark related docs approved
	await prisma.result_doc.updateMany({ where: { result_id: existing.id }, data: { approved: true } });

	return { success: true };
};
