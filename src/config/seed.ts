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
  const occupationsData = [];
  for (const scheme of schemes) {
    const occupation = await prisma.occupation.create({
      data: {
        scheme_id: scheme.id,
        name: faker.person.jobTitle(),
      },
    });
    occupationsData.push(occupation);
  }

  // Seed Assessments
  const assessmentsData = [];
  for (const occupation of occupationsData) {
    const assessment = await prisma.assessment.create({
      data: {
        occupation_id: occupation.id,
        code: faker.string.alphanumeric(10),
      },
    });
    assessmentsData.push(assessment);
  }

  // Seed Assessment Questions
  const questionsData = [];
  for (const assessment of assessmentsData) {
    for (let i = 0; i < 3; i++) { // Create 3 questions per assessment
      const question = await prisma.assessment_Question.create({
        data: {
          assessment_id: assessment.id,
          type: 'PG', // Assuming PG for multiple choice
          question: faker.lorem.sentence(),
        },
      });
      questionsData.push(question);
    }
  }

  // Seed Unit Competencies and Elements
  const unitCompetenciesData = [];
  for (const assessment of assessmentsData) {
    const unitCompetency = await prisma.unit_Competency.create({
      data: {
        assessment_id: assessment.id,
        unit_code: faker.string.alphanumeric(5),
        title: faker.lorem.sentence(),
      },
    });
    unitCompetenciesData.push(unitCompetency);
    
    // Create elements for each unit competency
    for (let i = 0; i < 2; i++) {
      await prisma.element.create({
        data: {
          unit_competency_id: unitCompetency.id,
          title: faker.lorem.sentence(),
        },
      });
    }
  }
  
  // Seed Users, Admins, Assessors, and Assessees
  const users: any[] = [];
  for (let i = 0; i < 10; i++) {
    const role_id = faker.helpers.arrayElement([1, 2, 3]);
    const fullName = faker.person.fullName();
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
          full_name: fullName,
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
          full_name: fullName,
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
          full_name: fullName,
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
          postal_code: faker.location.zipCode(),
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
      // Skip creating result details if no elements exist
      const elements = await prisma.element.findMany();
      if (elements.length > 0) {
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
      // Result Docs
      // Only create result docs if we have assessors
      if (assessors.length > 0) {
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

