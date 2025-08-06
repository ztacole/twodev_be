import { prisma } from '../../../config/db';

import { DashboardData } from './dashboard.type';

export const getDashboardData = async () => {
  const totalSchemes = await prisma.schemes.count();
  const totalAssessments = await prisma.assessment.count();
  const totalAssessors = await prisma.assessor.count();
  const totalAssesses = await prisma.assessee.count();
  const totalAll = totalSchemes + totalAssessments + totalAssessors + totalAssesses;

  return {
    totalSchemes,
    totalAssessments,
    totalAssessors,
    totalAssesses,
    totalAll,
  };
};