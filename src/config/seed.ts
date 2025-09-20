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
  resultAk03Header,
  resultAk04,
  resultAk05,
  elementApl02,
  elementDetailsApl02,
  resultAk02Header,
} from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

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

  // Schemes
  console.log('Creating schemes and occupations...');
  await db.insert(schemeTable).values({ code: 'RPL', name: 'Rekayasa Perangkat Lunak' });
  await db.insert(schemeTable).values({ code: 'ULP', name: 'Usaha Layanan Pariwisata' });
  await db.insert(schemeTable).values({ code: 'TBS', name: 'Tata Busana' });
  await db.insert(schemeTable).values({ code: 'PH', name: 'Perhotelan' });
  await db.insert(schemeTable).values({ code: 'TBG', name: 'Tata Boga' });
  const schemeRPL = await db.query.scheme.findFirst({ where: eq(schemeTable.code, 'RPL') });
  const schemeULP = await db.query.scheme.findFirst({ where: eq(schemeTable.code, 'ULP') });
  const schemeTBS = await db.query.scheme.findFirst({ where: eq(schemeTable.code, 'TBS') });
  const schemePH = await db.query.scheme.findFirst({ where: eq(schemeTable.code, 'PH') });
  const schemeTBG = await db.query.scheme.findFirst({ where: eq(schemeTable.code, 'TBG') });

  // Occupations
  await db.insert(occupationTable).values({ scheme_id: (schemeRPL?.id ?? 1), name: 'Junior Programming' });
  await db.insert(occupationTable).values({ scheme_id: (schemeULP?.id ?? 1), name: 'Junior Ticketing Officer' });
  await db.insert(occupationTable).values({ scheme_id: (schemeULP?.id ?? 1), name: 'Booker' });
  await db.insert(occupationTable).values({ scheme_id: (schemeTBS?.id ?? 1), name: 'Junior Custom Made' });
  await db.insert(occupationTable).values({ scheme_id: (schemePH?.id ?? 1), name: 'Guest Service Agent' });
  await db.insert(occupationTable).values({ scheme_id: (schemePH?.id ?? 1), name: 'Trainee Waiter' });
  await db.insert(occupationTable).values({ scheme_id: (schemePH?.id ?? 1), name: 'Bartender' });
  await db.insert(occupationTable).values({ scheme_id: (schemeTBG?.id ?? 1), name: 'Butcher Commis' });
  await db.insert(occupationTable).values({ scheme_id: (schemeTBG?.id ?? 1), name: 'Assistant Junior' });

  // Roles
  console.log('Creating roles...');
  await db.insert(roleTable).values({ name: 'Admin' });
  await db.insert(roleTable).values({ name: 'Assessor' });
  await db.insert(roleTable).values({ name: 'Assessee' });
  const adminRole = await db.query.role.findFirst({ where: eq(roleTable.name, 'Admin') });
  const assessorRole = await db.query.role.findFirst({ where: eq(roleTable.name, 'Assessor') });
  const assesseeRole = await db.query.role.findFirst({ where: eq(roleTable.name, 'Assessee') });

  // Users + password
  console.log('Creating users...');
  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

  // Admin user
  await db.insert(userTable).values({ full_name: 'Admin Utama', email: 'admin@example.com', password: hashedPassword, role_id: adminRole?.id || 1 });
  const adminUser = await db.query.user.findFirst({ where: eq(userTable.email, 'admin@example.com') });
  if (adminUser) {
    await db.insert(adminTable).values({ user_id: adminUser.id, address: 'Jalan Admin No. 123', phone_no: '081234567890', birth_date: new Date('1980-01-01') });
  }

  // Assessor users
  console.log('Creating assessors...');
  await db.insert(userTable).values({ full_name: 'Assessor Pertama', email: 'assessor1@example.com', password: hashedPassword, role_id: assessorRole?.id || 2 });
  const assessorUser1 = await db.query.user.findFirst({ where: eq(userTable.email, 'assessor1@example.com') });
  if (assessorUser1) {
    await db.insert(assessorTable).values({ user_id: assessorUser1.id, address: 'Jalan Assessor No. 456', phone_no: '082345678901', birth_location: 'Bandung', institution: 'LSP Media Informatika', birth_date: new Date('1985-05-15'), no_reg_met: `MET.000.${Math.floor(Math.random() * 100000)}.${new Date().getFullYear()}`, scheme_id: (schemeRPL?.id ?? 1) });
    const assessorRow = await db.query.assessor.findFirst({ where: eq(assessorTable.user_id, assessorUser1.id) });
    if (assessorRow) {
      await db.insert(assessorDetailTable).values({ assessor_id: assessorRow.id, tax_id_number: '123456789012345.jpg', bank_book_cover: 'buku_bank_1.jpg', certificate: 'sertifikat_1.pdf', id_card: 'id_card_1.jpg', national_id: 'ktp_1.jpg' });
    }
  }

  // Assessees
  console.log('Creating assessees...');
  await db.insert(userTable).values({ full_name: 'Asesi Pertama', email: 'asesi1@example.com', password: hashedPassword, role_id: assesseeRole?.id || 3 });

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
