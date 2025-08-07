import { PrismaClient, Gender, AssessmentStatus, QuestionType } from '@prisma/client';
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
        full_name: faker.person.fullName(),
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
          identity_number: faker.string.numeric(16),
          birth_date: faker.date.past({ years: 25 }),
          birth_location: faker.location.city(),
          gender: faker.helpers.arrayElement([Gender.Male, Gender.Female]),
          nationality: 'Indonesia',
          phone_no: faker.phone.number(),
          address: faker.location.streetAddress(),
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
          position: faker.person.jobTitle(),
          phone_no: faker.phone.number(),
        },
      });
    }
  }
  console.log('Created users, admins, assessors, assessees, and jobs');

  // Seed Assessments
  const assessors = await prisma.assessor.findMany();
  const allAssessments = [];
  for (const assessor of assessors) {
    const scheme = await prisma.schemes.findUnique({ where: { id: assessor.scheme_id } });
    const code = `ASM-${scheme?.code}-${faker.string.alphanumeric(4).toUpperCase()}`;
    const status = faker.helpers.arrayElement([
      AssessmentStatus.Planned,
      AssessmentStatus.Ongoing,
      AssessmentStatus.Completed,
    ]);
    const start_date = faker.date.future();
    const end_date = faker.date.future({ years: 1, refDate: start_date });

    const assessment = await prisma.assessment.create({
      data: {
        scheme_id: assessor.scheme_id,
        code,
        status,
        start_date,
        end_date,
        assessor_id: assessor.id,
      },
    });
    allAssessments.push(assessment);

    // Assessment Details
    await prisma.assessment_Details.create({
      data: {
        assessment_id: assessment.id,
        assessor_id: assessor.id,
        location: faker.location.city(),
      },
    });

    // Seed Unit Competency for this assessment
    const unitCount = faker.number.int({ min: 3, max: 6 });
    for (let i = 0; i < unitCount; i++) {
      const unit = await prisma.unit_Competency.create({
        data: {
          assessment_id: assessment.id,
          unit_code: `UC-${assessment.id}-${i + 1}`,
          title: `Unit Kompetensi ${i + 1} untuk ${scheme?.name}`,
        },
      });

      // Seed Elements for this unit
      const elementCount = faker.number.int({ min: 2, max: 5 });
      for (let j = 0; j < elementCount; j++) {
        const element = await prisma.element.create({
          data: {
            unit_competency_id: unit.id,
            title: `Elemen ${j + 1} dari ${unit.title}`,
          },
        });

        // Element Details
        await prisma.element_Details.create({
          data: {
            element_id: element.id,
            description: faker.lorem.sentence(),
          },
        });
      }
    }

    // Seed Assessment Questions
    for (let q = 0; q < 3; q++) {
      const question = await prisma.assessment_Question.create({
        data: {
          assessment_id: assessment.id,
          type: faker.helpers.arrayElement([QuestionType.PG, QuestionType.Essay]),
          question: faker.lorem.sentence(),
        },
      });

      // PG Details
      if (question.type === 'PG') {
        for (let o = 0; o < 4; o++) {
          await prisma.questionPG_Details.create({
            data: {
              question_id: question.id,
              option: faker.lorem.word(),
              isanswer: o === 0,
            },
          });
        }
      }
    }
  }
  console.log('Created assessments, details, unit competencies, elements, questions');

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

  // Seed Result & Result Details
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
    }
  }

  console.log('Created answers, results, and result details');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });