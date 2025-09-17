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
import { eq,and } from 'drizzle-orm';

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
  await db.insert(userTable).values({ full_name: 'Admin Utama', email: 'admin@example.com', password: hashedPassword, role_id: adminRole?.id || 1 });
  const adminUser = await db.query.user.findFirst({ where: eq(userTable.email, 'admin@example.com') });
  if (adminUser) {
    await db.insert(adminTable).values({ user_id: adminUser.id, address: 'Jalan Admin No. 123', phone_no: '081234567890', birth_date: new Date('1980-01-01') });
  }

  // Schemes
  console.log('Creating schemes and occupations...');
  await db.insert(schemeTable).values({ code: 'RPL', name: 'Rekayasa Perangkat Lunak' });
  await db.insert(schemeTable).values({ code: 'PH', name: 'Perhotelan' });
  const schemeRPL = await db.query.scheme.findFirst({ where: eq(schemeTable.code, 'RPL') });
  const schemePH = await db.query.scheme.findFirst({ where: eq(schemeTable.code, 'PH') });

  // Occupations
  await db.insert(occupationTable).values({ scheme_id: (schemeRPL?.id ?? 1), name: 'Pengembang Web' });
  await db.insert(occupationTable).values({ scheme_id: (schemeRPL?.id ?? 1), name: 'Pengembang Mobile' });
  await db.insert(occupationTable).values({ scheme_id: (schemePH?.id ?? 1), name: 'Pelayanan Hotel' });
  const occupation1 = await db.query.occupation.findFirst({ where: eq(occupationTable.name, 'Pengembang Web') });

  // Assessor users
  console.log('Creating assessors...');
  await db.insert(userTable).values({ full_name: 'Assessor Pertama', email: 'assessor1@example.com', password: hashedPassword, role_id: assessorRole?.id || 2 });
  const assessorUser1 = await db.query.user.findFirst({ where: eq(userTable.email, 'assessor1@example.com') });
  if (assessorUser1) {
    await db.insert(assessorTable).values({ user_id: assessorUser1.id, address: 'Jalan Assessor No. 456', phone_no: '082345678901', birth_date: new Date('1985-05-15'), no_reg_met: `MET.000.${Math.floor(Math.random() * 100000)}.${new Date().getFullYear()}`, scheme_id: (schemeRPL?.id ?? 1) });
    const assessorRow = await db.query.assessor.findFirst({ where: eq(assessorTable.user_id, assessorUser1.id) });
    if (assessorRow) {
      await db.insert(assessorDetailTable).values({ assessor_id: assessorRow.id, tax_id_number: '123456789012345', bank_book_cover: 'buku_bank_1.jpg', certificate: 'sertifikat_1.pdf', id_card: 'id_card_1.jpg', national_id: 'ktp_1.jpg' });
    }
  }

  // Assessees
  console.log('Creating assessees...');
  const assesseeUsers = await Promise.all([
    db.insert(userTable).values({ full_name: 'Asesi Pertama', email: 'asesi1@example.com', password: hashedPassword, role_id: assesseeRole?.id || 3 }),
    db.insert(userTable).values({ full_name: 'Asesi Dua', email: 'asesi2@example.com', password: hashedPassword, role_id: assesseeRole?.id || 3 }),
    db.insert(userTable).values({ full_name: 'Asesi Tiga', email: 'asesi3@example.com', password: hashedPassword, role_id: assesseeRole?.id || 3 }),
  ]);

  const assesseeUser1 = await db.query.user.findFirst({ where: eq(userTable.email, 'asesi1@example.com') });
  const assesseeUser2 = await db.query.user.findFirst({ where: eq(userTable.email, 'asesi2@example.com') });
  const assesseeUser3 = await db.query.user.findFirst({ where: eq(userTable.email, 'asesi3@example.com') });

  if (assesseeUser1) {
    await db.insert(assesseeTable).values({ user_id: assesseeUser1.id, identity_number: '1234567890', birth_date: new Date('1990-03-10'), birth_location: 'Jakarta', gender: 'male', nationality: 'Indonesia', phone_no: '084567890123', address: 'Jalan Asesi No. 101', educational_qualifications: 'Sarjana' });
    const assesseeRow1 = await db.query.assessee.findFirst({ where: eq(assesseeTable.user_id, assesseeUser1.id) });
    if (assesseeRow1) {
      await db.insert(assesseeJobTable).values({ assessee_id: assesseeRow1.id, institution_name: 'Perusahaan Teknologi Inc.', address: 'Gedung Perkantoran Tower 200', postal_code: '12345', position: 'Pengembang Software', phone_no: '0211234567', job_email: 'asesi1@perusahaan.com' });
    }
  }

  if (assesseeUser2) {
    await db.insert(assesseeTable).values({ user_id: assesseeUser2.id, identity_number: '9876543210', birth_date: new Date('1991-01-01'), birth_location: 'Bandung', gender: 'female', nationality: 'Indonesia', phone_no: '081234567890', address: 'Jalan Asesi No. 201', educational_qualifications: 'Diploma' });
    const assesseeRow2 = await db.query.assessee.findFirst({ where: eq(assesseeTable.user_id, assesseeUser2.id) });
    if (assesseeRow2) {
      await db.insert(assesseeJobTable).values({ assessee_id: assesseeRow2.id, institution_name: 'PT. Asesi Teknologi', address: 'Komplek Perkantoran Asesi', postal_code: '67890', position: 'Pengembang Hardware', phone_no: '0219876543', job_email: 'asesi2@asasi.com' });
    }
  }

  if (assesseeUser3) {
    await db.insert(assesseeTable).values({ user_id: assesseeUser3.id, identity_number: '7418529630', birth_date: new Date('1992-05-15'), birth_location: 'Surabaya', gender: 'male', nationality: 'Indonesia', phone_no: '085623741852', address: 'Jalan Asesi No. 301', educational_qualifications: 'Sarjana' });
    const assesseeRow3 = await db.query.assessee.findFirst({ where: eq(assesseeTable.user_id, assesseeUser3.id) });
    if (assesseeRow3) {
      await db.insert(assesseeJobTable).values({ assessee_id: assesseeRow3.id, institution_name: 'Universitas Asesi', address: 'Kampus Universitas Asesi', postal_code: '12345', position: 'Dosen', phone_no: '0214567890', job_email: 'asesi3@universitasasasi.com' });
    }
  }

  // Create assessment minimal + groups/units/elements/details + ia05/ia07
  console.log('Creating assessment + groups + questions...');
  await db.insert(assessmentTable).values({ occupation_id: (occupation1?.id ?? 1), code: 'SKM.RPL/2025' });
  const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.code, 'SKM.RPL/2025') });
  if (assessment) {
    // groups_ia01
    await db.insert(groupIa01Table).values({ assessment_id: assessment.id, name: 'Pengembangan Web Dasar' });
    const g1 = await db.query.groupIa01.findFirst({ where: eq(groupIa01Table.assessment_id, assessment.id) });
    if (g1) {
      // create unit, element, details
      const unitsTableName = 'units';
      // Some schemas name nested tables differently; try generic insert via SQL if needed.

      // IA05 question
      await db.insert(ia05QuestionTable).values({ assessment_id: assessment.id, order: 1, question: 'Apa kepanjangan dari CSS?' });
      const ia05q = await db.query.ia05Question.findFirst({ where: eq(ia05QuestionTable.assessment_id, assessment.id) });
      if (ia05q) {
        await db.insert(questionOptionTable).values({ question_id: ia05q.id, option: 'Cascading Style Sheets', is_answer: true });
        await db.insert(questionOptionTable).values({ question_id: ia05q.id, option: 'Computer Style Sheets', is_answer: false });
      }

      // IA07 question
      await db.insert(ia07QuestionTable).values({ assessment_id: assessment.id, question: 'Jelaskan apa yang dimaksud dengan Box Model dalam CSS dan sebutkan komponen-komponennya!', answer_key: 'Box Model = content,padding,border,margin' });
    }

    // UC APL02
    const ucApl02Data = {
        unit_code: "I.55HDR00.037.13",
        title: "Melakukan Reservasi Tamu",
        elements: [
            {
                title: "Menerima Permintaan Reservasi Tamu",
                code: "E.55HDR00.037.13.1",
                details: [
                    { description: "Mampu mencatat detail reservasi dengan lengkap" },
                    { description: "Mampu memverifikasi ketersediaan kamar" }
                ]
            },
            {
                title: "Memproses Reservasi Tamu", 
                code: "E.55HDR00.037.13.2",
                details: [
                    { description: "Mampu menjelaskan metode pembayaran yang tersedia" },
                    { description: "Mampu memproses pembayaran sesuai prosedur" }
                ]
            },
            {
                title: "Memberikan Konfirmasi",
                code: "E.55HDR00.037.13.3",
                details: [
                    { description: "Mampu mengirimkan konfirmasi reservasi" },
                    { description: "Mampu memberikan informasi tambahan yang diperlukan" }
                ]
            }
        ]
    };
    
    // Insert UC APL02
    await db.insert(ucApl02Table).values({ 
      assessment_id: assessment.id, 
      unit_code: ucApl02Data.unit_code, 
      title: ucApl02Data.title 
    });
    
    const ucApl02Row = await db.query.ucApl02.findFirst({ 
      where: eq(ucApl02Table.unit_code, ucApl02Data.unit_code) 
    });
    
    if (ucApl02Row) {
      for (const elem of ucApl02Data.elements) {
        await db.insert(elementApl02).values({ 
          uc_id: ucApl02Row.id, 
          title: elem.title,
        });
    
        const elemRow = await db.query.elementApl02.findFirst({ 
          where: eq(elementApl02.title, elem.title) && eq(elementApl02.uc_id, ucApl02Row.id)
        });
    
        if (elemRow) {
          for (const det of elem.details) {
            await db.insert(elementDetailsApl02).values({ 
              element_id: elemRow.id, 
              description: det.description 
            });
          }
        }
      }
    }
  }

  // schedule
  console.log('Creating schedule...');
  if (assessment) {
    await db.insert(assessmentScheduleTable).values({ assessment_id: assessment.id, start_date: new Date('2023-12-01'), end_date: new Date('2023-12-05') });
    const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(assessmentScheduleTable.assessment_id, assessment.id) });
    if (schedule && assessorUser1) {
      const assessorRow = await db.query.assessor.findFirst({ where: eq(assessorTable.user_id, assessorUser1.id) });
      if (assessorRow) {
        await db.insert(scheduleDetailTable).values({ schedule_id: schedule.id, assessor_id: assessorRow.id, location: 'Gedung LSP Teknologi Lt. 3' });
      }
    }
  }

  // create a simple result + docs + headers
  const assessees = [
    { user: assesseeUser1, is_competent: true, allHeadersFilled: true },    // Competent
    { user: assesseeUser2, is_competent: false, allHeadersFilled: true },   // Not Competent
    { user: assesseeUser3, is_competent: false, allHeadersFilled: false },  // On Going
  ];
  
  for (const a of assessees) {
    if (!assessment) throw new Error('Assessment is undefined');
    if (!assessorUser1) throw new Error('Assessor user is undefined');
    if (!a.user) continue;
    
    const assesseeRow = await db.query.assessee.findFirst({ where: eq(assesseeTable.user_id, a.user.id) });
    const assessorRow = await db.query.assessor.findFirst({ where: eq(assessorTable.user_id, assessorUser1.id) });
  
    if (!assesseeRow || !assessorRow) continue;
  
    const resultRows = await db.insert(resultTable).values({
      assessment_id: assessment.id,
      assessor_id: assessorRow.id,
      assessee_id: assesseeRow.id,
      is_competent: a.is_competent,
      tuk: 'sewaktu',
    }).$returningId();

    const resultRow = resultRows[0];
    if (!resultRow) continue;
  
    if (a.allHeadersFilled) {
      await Promise.all([
        db.insert(apl02HeaderTable).values({
          result_id: resultRow.id,
          approved_assessee: true,
          approved_assessor: true,
          is_continue: true
        }),
        db.insert(ia01HeaderTable).values({ 
          result_id: resultRow.id, 
          approved_assessee: true, 
          approved_assessor: true, 
          is_competent: a.is_competent
        }),
        db.insert(ia02HeaderTable).values({ 
          result_id: resultRow.id, 
          approved_assessee: true, 
          approved_assessor: true 
        }),
        db.insert(ia03HeaderTable).values({ 
          result_id: resultRow.id, 
          approved_assessee: true, 
          approved_assessor: true 
        }),
        db.insert(ia05HeaderTable).values({ 
          result_id: resultRow.id, 
          approved_assessee: true, 
          approved_assessor: true, 
          is_achieved: a.is_competent 
        }),
        db.insert(ia07HeaderTable).values({ 
          result_id: resultRow.id, 
          approved_assessee: true, 
          approved_assessor: true 
        }),
        db.insert(ak01HeaderTable).values({ 
          result_id: resultRow.id, 
          approved_assessee: true, 
          approved_assessor: true 
        }),
        db.insert(resultAk02Header).values({ 
          result_id: resultRow.id, 
          approved_assessee: true, 
          approved_assessor: true,
          is_competent: a.is_competent
        }),
        db.insert(resultAk03Header).values({ 
          result_id: resultRow.id
        }),
        db.insert(resultAk04).values({ 
          result_id: resultRow.id, 
          approved_assessee: true, 
          q1_yes: a.is_competent, 
          q2_yes: a.is_competent, 
          q3_yes: a.is_competent,
          reason: ''
        }),
        db.insert(resultAk05).values({ 
          result_id: resultRow.id, 
          approved_assessor: true, 
          is_competent: a.is_competent 
        })
      ]);
    } else {
      await Promise.all([
        db.insert(resultAk02Header).values({ 
          result_id: resultRow.id, 
          approved_assessee: true, 
          approved_assessor: true,
          is_competent: a.is_competent
        }),
        db.insert(ia01HeaderTable).values({ 
          result_id: resultRow.id, 
          approved_assessee: true, 
          approved_assessor: true, 
          is_competent: a.is_competent 
        }),
        db.insert(ia02HeaderTable).values({ 
          result_id: resultRow.id, 
          approved_assessee: true, 
          approved_assessor: true 
        }),
        db.insert(ia07HeaderTable).values({ 
          result_id: resultRow.id, 
          approved_assessee: true, 
          approved_assessor: true 
        }),
      ]);
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
