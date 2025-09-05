import "dotenv/config";
import bcrypt from 'bcryptjs';
import { db } from '../config/drizzle';
import {
  role as roleTable,
  user as userTable,
  admin as adminTable,
  assessor as assessorTable,
  assessorDetail as assessorDetailTable,
  scheme as schemeTable,
  occupation as occupationTable,
  assessee as assesseeTable,
  assesseeJob as assesseeJobTable,
  assessment as assessmentTable,
  // below are example names used in your project — adjust if your schema uses different identifiers
  groupIa01 as groupIa01Table,
  groupIa02 as groupsIa02Table,
  groupIa03 as groupsIa03Table,
  ucApl02 as ucApl02Table,
  ia05Question as ia05QuestionTable,
  questionOption as questionOptionTable,
  ia07Question as ia07QuestionTable,
  assessmentSchedule as assessmentScheduleTable,
  scheduleDetail as scheduleDetailTable,
  result as resultTable,
  resultDoc as resultDocTable,
  resultApl02Header as apl02HeaderTable,
  resultIa01Header as ia01HeaderTable,
  resultIa02Header as ia02HeaderTable,
  resultIa03Header as ia03HeaderTable,
  resultIa05Header as ia05HeaderTable,
  resultIa07Header as ia07HeaderTable,
  resultAk01Header as ak01HeaderTable,
  resultAk02Header as ak02HeaderTable,
} from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password';

async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('Starting Drizzle seed...');

  // WARNING: this will wipe data. Adjust order if your DB has FK constraints different from this script.
  console.log('Deleting old data (in safe order)...');
  try {
    // delete children first - adapt table names if different in your drizzle/schema
    await db.delete(resultDocTable);
    await db.delete(resultTable);
    await db.delete(scheduleDetailTable);
    await db.delete(assessmentScheduleTable);

    // headers & other result sub-tables
    await db.delete(apl02HeaderTable);
    await db.delete(ia01HeaderTable);
    await db.delete(ia02HeaderTable);
    await db.delete(ia03HeaderTable);
    await db.delete(ia05HeaderTable);
    await db.delete(ia07HeaderTable);
    await db.delete(ak01HeaderTable);
    await db.delete(ak02HeaderTable);

    // assessment related
    await db.delete(ia07QuestionTable);
    await db.delete(questionOptionTable);
    await db.delete(ia05QuestionTable);
    await db.delete(ucApl02Table);
    await db.delete(groupsIa03Table);
    await db.delete(groupsIa02Table);
    await db.delete(groupIa01Table);
  await db.delete(assessmentTable);

    // occupations schemes
  await db.delete(occupationTable);
  await db.delete(schemeTable);

    // assessee / assessor
    await db.delete(assesseeJobTable);
    await db.delete(assesseeTable);
    await db.delete(assessorDetailTable);
    await db.delete(assessorTable);
  await db.delete(adminTable);
  await db.delete(userTable);
  await db.delete(roleTable);

  } catch (e) {
    console.warn('Warning while deleting: ', e);
  }

  // 1) Roles
  console.log('Creating roles...');
  await db.insert(roleTable).values({ name: 'Admin' });
  await db.insert(roleTable).values({ name: 'Assessor' });
  await db.insert(roleTable).values({ name: 'Assessee' });
  const adminRole = await db.query.role.findFirst({ where: eq(roleTable.name, 'Admin') });
  const assessorRole = await db.query.role.findFirst({ where: eq(roleTable.name, 'Assessor') });
  const assesseeRole = await db.query.role.findFirst({ where: eq(roleTable.name, 'Assessee') });

  // 2) Users + password
  console.log('Creating users...');
  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

  // Admin user
  await db.insert(userTable).values({ fullName: 'Admin Utama', email: 'admin@example.com', password: hashedPassword, roleId: adminRole?.id || 1 });
  const adminUser = await db.query.user.findFirst({ where: eq(userTable.email, 'admin@example.com') });
  if (adminUser) {
    await db.insert(adminTable).values({ userId: adminUser.id, address: 'Jalan Admin No. 123', phoneNo: '081234567890', birthDate: new Date('1980-01-01') });
  }

  // Schemes
  console.log('Creating schemes and occupations...');
  await db.insert(schemeTable).values({ code: 'RPL', name: 'Rekayasa Perangkat Lunak' });
  await db.insert(schemeTable).values({ code: 'PH', name: 'Perhotelan' });
  const schemeRPL = await db.query.scheme.findFirst({ where: eq(schemeTable.code, 'RPL') });
  const schemePH = await db.query.scheme.findFirst({ where: eq(schemeTable.code, 'PH') });

  // Occupations
  await db.insert(occupationTable).values({ schemeId: (schemeRPL?.id ?? 1), name: 'Pengembang Web' });
  await db.insert(occupationTable).values({ schemeId: (schemeRPL?.id ?? 1), name: 'Pengembang Mobile' });
  await db.insert(occupationTable).values({ schemeId: (schemePH?.id ?? 1), name: 'Pelayanan Hotel' });
  const occupation1 = await db.query.occupation.findFirst({ where: eq(occupationTable.name, 'Pengembang Web') });

  // Assessor users
  console.log('Creating assessors...');
  await db.insert(userTable).values({ fullName: 'Assessor Pertama', email: 'assessor1@example.com', password: hashedPassword, roleId: assessorRole?.id || 2 });
  const assessorUser1 = await db.query.user.findFirst({ where: eq(userTable.email, 'assessor1@example.com') });
  if (assessorUser1) {
    await db.insert(assessorTable).values({ userId: assessorUser1.id, address: 'Jalan Assessor No. 456', phoneNo: '082345678901', birthDate: new Date('1985-05-15'), noRegMet: `MET.000.${Math.floor(Math.random() * 100000)}.${new Date().getFullYear()}`, schemeId: (schemeRPL?.id ?? 1) });
    const assessorRow = await db.query.assessor.findFirst({ where: eq(assessorTable.userId, assessorUser1.id) });
    if (assessorRow) {
      await db.insert(assessorDetailTable).values({ assessorId: assessorRow.id, taxIdNumber: '123456789012345', bankBookCover: 'buku_bank_1.jpg', certificate: 'sertifikat_1.pdf', nationalId: 'ktp_1.jpg' });
    }
  }

  // Assessees
  console.log('Creating assessees...');
  await db.insert(userTable).values({ fullName: 'Asesi Pertama', email: 'asesi1@example.com', password: hashedPassword, roleId: assesseeRole?.id || 3 });
  const assesseeUser1 = await db.query.user.findFirst({ where: eq(userTable.email, 'asesi1@example.com') });
  if (assesseeUser1) {
    await db.insert(assesseeTable).values({ userId: assesseeUser1.id, identityNumber: '1234567890', birthDate: new Date('1990-03-10'), birthLocation: 'Jakarta', gender: 'male', nationality: 'Indonesia', phoneNo: '084567890123', address: 'Jalan Asesi No. 101', educationalQualifications: 'Sarjana' });
    const assesseeRow = await db.query.assessee.findFirst({ where: eq(assesseeTable.userId, assesseeUser1.id) });
    if (assesseeRow) {
      await db.insert(assesseeJobTable).values({ assesseeId: assesseeRow.id, institutionName: 'Perusahaan Teknologi Inc.', address: 'Gedung Perkantoran Tower 200', postalCode: '12345', position: 'Pengembang Software', phoneNo: '0211234567', jobEmail: 'asesi1@perusahaan.com' });
    }
  }

  // Create assessment minimal + groups/units/elements/details + ia05/ia07
  console.log('Creating assessment + groups + questions...');
  await db.insert(assessmentTable).values({ occupationId: (occupation1?.id ?? 1), code: 'SKM.RPL/2025' });
  const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.code, 'SKM.RPL/2025') });
  if (assessment) {
    // groups_ia01
    await db.insert(groupIa01Table).values({ assessmentId: assessment.id, name: 'Pengembangan Web Dasar' });
    const g1 = await db.query.groupIa01.findFirst({ where: eq(groupIa01Table.assessmentId, assessment.id) });
    if (g1) {
      // create unit, element, details
      const unitsTableName = 'units';
      // Some schemas name nested tables differently; try generic insert via SQL if needed.

      // IA05 question
      await db.insert(ia05QuestionTable).values({ assessmentId: assessment.id, order: 1, question: 'Apa kepanjangan dari CSS?' });
      const ia05q = await db.query.ia05Question.findFirst({ where: eq(ia05QuestionTable.assessmentId, assessment.id) });
      if (ia05q) {
        await db.insert(questionOptionTable).values({ questionId: ia05q.id, option: 'Cascading Style Sheets', isAnswer: true });
        await db.insert(questionOptionTable).values({ questionId: ia05q.id, option: 'Computer Style Sheets', isAnswer: false });
      }

      // IA07 question
      await db.insert(ia07QuestionTable).values({ assessmentId: assessment.id, question: 'Jelaskan apa yang dimaksud dengan Box Model dalam CSS dan sebutkan komponen-komponennya!', answerKey: 'Box Model = content,padding,border,margin' });
    }
  }

  // schedule
  console.log('Creating schedule...');
  if (assessment) {
    await db.insert(assessmentScheduleTable).values({ assessmentId: assessment.id, startDate: new Date('2023-12-01'), endDate: new Date('2023-12-05') });
    const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(assessmentScheduleTable.assessmentId, assessment.id) });
    if (schedule && assessorUser1) {
      const assessorRow = await db.query.assessor.findFirst({ where: eq(assessorTable.userId, assessorUser1.id) });
      if (assessorRow) {
        await db.insert(scheduleDetailTable).values({ scheduleId: schedule.id, assessorId: assessorRow.id, location: 'Gedung LSP Teknologi Lt. 3' });
      }
    }
  }

  // create a simple result + docs + headers
  console.log('Creating a sample result + docs + headers...');
  if (assessment && assessorUser1 && assesseeUser1) {
    const assessorRow = await db.query.assessor.findFirst({ where: eq(assessorTable.userId, assessorUser1.id) });
    const assesseeRow = await db.query.assessee.findFirst({ where: eq(assesseeTable.userId, assesseeUser1.id) });
    if (assessorRow && assesseeRow) {
      await db.insert(resultTable).values({ assessmentId: assessment.id, assessorId: assessorRow.id, assesseeId: assesseeRow.id, isCompetent: false, tuk: 'sewaktu' });
      const resultRow = await db.query.result.findFirst({ where: eq(resultTable.assessmentId, assessment.id) });
      if (resultRow) {
        await db.insert(resultDocTable).values({ resultId: resultRow.id, purpose: 'Sertifikasi Profesi', schoolReportCard: 'ijazah.pdf', fieldWorkPracticeCertificate: 'sertifikat_pkl.pdf', studentCard: 'kartu_mahasiswa.pdf', familyCard: 'kartu_keluarga.pdf', idCard: 'ktp.pdf', approved: true });

        // headers
        await db.insert(apl02HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false, isContinue: false });
        await db.insert(ia01HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false, isCompetent: false });
        await db.insert(ia02HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false });
        await db.insert(ia03HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false });
        await db.insert(ia05HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false, isAchieved: false });
        await db.insert(ia07HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false });
        await db.insert(ak01HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false });
        await db.insert(ak02HeaderTable).values({ resultId: resultRow.id, approvedAssessee: false, approvedAssessor: false, isCompetent: false });
      }
    }
  }

  console.log('Drizzle seeding finished.');
}

main().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
}).finally(async () => {
  // close drizzle connection if needed
  try { await (db as any).end?.(); } catch (e) { }
  process.exit(0);
});
