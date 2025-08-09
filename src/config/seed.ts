import { PrismaClient, Gender } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/id_ID';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed Roles
  await prisma.role.createMany({
    data: [
      { name: 'Admin' },
      { name: 'Assessor' },
      { name: 'Assessee' },
    ],
    skipDuplicates: true,
  });

  // Seed Schemes
  const schemesData = [
    { code: 'SKM-001', name: 'Skema Sertifikasi Junior Web Developer' },
    { code: 'SKM-002', name: 'Skema Sertifikasi Network Technician' },
    { code: 'SKM-003', name: 'Skema Sertifikasi Graphic Designer' },
  ];
  await prisma.schemes.createMany({
    data: schemesData,
    skipDuplicates: true,
  });
  const schemes = await prisma.schemes.findMany();

  // Seed Occupations
  for (const scheme of schemes) {
    await prisma.occupation.create({
      data: {
        scheme_id: scheme.id,
        name: faker.person.jobTitle(),
      },
    });
  }

  // Seed Users, Admins, Assessors, and Assessees
  const users: any[] = [];
  for (let i = 0; i < 10; i++) {
    const role_id = faker.helpers.arrayElement([1, 2, 3]);
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: await bcrypt.hash("password", 10),
        role_id,
      },
    });
    users.push({ ...user, role_id });
    if (role_id === 1) {
      await prisma.admin.create({
        data: {
          user_id: user.id,
          full_name: faker.person.fullName(),
          address: faker.location.streetAddress(),
          phone_no: faker.phone.number(),
          birth_date: faker.date.past({ years: 30 }),
        },
      });
    }
    if (role_id === 2) {
      const assessor = await prisma.assessor.create({
        data: {
          user_id: user.id,
          scheme_id: faker.helpers.arrayElement(schemes).id,
          full_name: faker.person.fullName(),
          address: faker.location.streetAddress(),
          phone_no: faker.phone.number(),
          birth_date: faker.date.past({ years: 30 }),
        },
      });
      await prisma.assessor_Details.create({
        data: {
          assessor_id: assessor.id,
          tax_id_number: faker.string.numeric(16),
          bank_book_cover: faker.image.url(),
          certificate: faker.image.url(),
          national_id: faker.string.numeric(16),
        },
      });
    }
    if (role_id === 3) {
      const assessee = await prisma.assessee.create({
        data: {
          user_id: user.id,
          full_name: faker.person.fullName(),
          identity_number: faker.string.numeric(16),
          birth_date: faker.date.past({ years: 25 }),
          birth_location: faker.location.city(),
          gender: faker.helpers.arrayElement<Gender>([Gender.Male, Gender.Female]),
          nationality: 'Indonesia',
          phone_no: faker.phone.number(),
          house_phone_no: null,
          office_phone_no: null,
          address: faker.location.streetAddress(),
          postal_code: null,
          educational_qualifications: faker.helpers.arrayElement([
            'SMA/SMK',
            'D3',
            'S1',
            'S2',
          ]),
        },
      });
      await prisma.assessee_Job.create({
        data: {
          assessee_id: assessee.id,
          institution_name: faker.company.name(),
          address: faker.location.streetAddress(),
          postal_code: faker.address.zipCode(),
          position: faker.person.jobTitle(),
          phone_no: faker.phone.number(),
          job_email: faker.internet.email(),
        },
      });
    }
  }
  console.log('Created users, admins, assessors, assessees, and jobs');

  // Seed Assessee Answers
  const assessees = await prisma.assessee.findMany();
  const questions = await prisma.assessment_Question.findMany();
  for (const assessee of assessees) {
    for (let i = 0; i < 2; i++) {
      const question = faker.helpers.arrayElement(questions);
      await prisma.assessee_Answer.create({
        data: {
          question_id: question.id,
          assessee_id: assessee.id,
          answer: faker.lorem.word(),
        },
      });
    }
  }

  // Seed Result, Result Details, and Result Docs
  const assessors = await prisma.assessor.findMany();
  const allAssessments = await prisma.assessment.findMany();
  for (const assessment of allAssessments) {
    for (const assessee of assessees) {
      const result = await prisma.result.create({
        data: {
          assessment_id: assessment.id,
          assessee_id: assessee.id,
          approve: faker.datatype.boolean(),
        },
      });
      // Result Details
      const elements = await prisma.element.findMany();
      for (let i = 0; i < 2; i++) {
        await prisma.result_Details.create({
          data: {
            result_id: result.id,
            element_id: faker.helpers.arrayElement(elements).id,
            answer: faker.datatype.boolean(),
            proof: faker.image.url(),
          },
        });
      }
      // Result Docs
      await prisma.result_Docs.create({
        data: {
          result_id: result.id,
          assessor_id: faker.helpers.arrayElement(assessors).id,
          purpose: faker.lorem.sentence(),
          school_report_card: faker.image.url(),
          field_work_practice_certificate: faker.image.url(),
          student_card: faker.image.url(),
          family_card: faker.image.url(),
          id_card: faker.image.url(),
        },
      });
    }
  }
  console.log('Created answers, results, result details, and result docs');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

