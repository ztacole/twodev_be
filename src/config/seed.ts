import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/id_ID';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed Roles
  const roles = await prisma.role.createMany({
    data: [
      { name: 'Admin' },
      { name: 'Assessor' },
      { name: 'Assessee' },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${roles.count} roles`);

  // Seed Majors
  const majors = await prisma.major.createMany({
    data: [
      { code: 'TKJ', name: 'Teknik Komputer dan Jaringan' },
      { code: 'RPL', name: 'Rekayasa Perangkat Lunak' },
      { code: 'MM', name: 'Multimedia' },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${majors.count} majors`);

  // Seed Users, Admins, Assessors, and Assessees
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        full_name: faker.person.fullName(),
        email: faker.internet.email(),
        password: await bcrypt.hash("password", 10),
        role_id: faker.helpers.arrayElement([1, 2, 3]),
      },
    });

    if (user.role_id === 1) {
      await prisma.admin.create({
        data: {
          user_id: user.id,
          address: faker.location.streetAddress(),
          phone_no: faker.phone.number(),
          birth_date: faker.date.past({ years: 30 }),
        },
      });
    }

    if (user.role_id === 2) {
      await prisma.assessor.create({
        data: {
          user_id: user.id,
          major_id: faker.helpers.arrayElement([1, 2, 3]),
          address: faker.location.streetAddress(),
          phone_no: faker.phone.number(),
          birth_date: faker.date.past({ years: 30 }),
        },
      });
    }

    if (user.role_id === 3) {
      const assessee = await prisma.assessee.create({
        data: {
          user_id: user.id,
          identity_number: faker.string.numeric(16),
          birth_date: faker.date.past({ years: 25 }),
          birth_location: faker.location.city(),
          gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
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
  console.log('Created 10 users with related data');

  // Seed Schemes
  const schemes = await prisma.schemes.createMany({
    data: [
      {
        title: 'Skema Sertifikasi Junior Web Developer',
        major_id: 2,
        no_scheme: 'SKM-001',
      },
      {
        title: 'Skema Sertifikasi Network Technician',
        major_id: 1,
        no_scheme: 'SKM-002',
      },
      {
        title: 'Skema Sertifikasi Graphic Designer',
        major_id: 3,
        no_scheme: 'SKM-003',
      },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${schemes.count} schemes`);

  // Seed Unit Competency dan Element
  for (const scheme of await prisma.schemes.findMany()) {
    const unitCount = faker.number.int({ min: 3, max: 6 });
    for (let i = 0; i < unitCount; i++) {
      const unit = await prisma.unit_Competency.create({
        data: {
          scheme_id: scheme.id,
          unit_code: `UC-${scheme.id}-${i + 1}`,
          title: `Unit Kompetensi ${i + 1} untuk ${scheme.title}`,
          description: faker.lorem.paragraph(),
        },
      });

      const elementCount = faker.number.int({ min: 2, max: 5 });
      for (let j = 0; j < elementCount; j++) {
        await prisma.element.create({
          data: {
            unit_competency_id: unit.id,
            name: `Element ${j + 1}`,
            title: `Elemen ${j + 1} dari ${unit.title}`,
          },
        });
      }
    }
  }
  console.log('Created unit competencies and elements');

  // Seed Assessments - PERUBAHAN UTAMA DI SINI
  const assessors = await prisma.assessor.findMany({
    include: {
      user: true, // Menyertakan data user dalam hasil query
    },
  });

  for (const assessor of assessors) {
    const assessmentCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < assessmentCount; i++) {
      const scheme = await prisma.schemes.findFirst({
        where: { major_id: assessor.major_id },
      });

      if (scheme) {
        const assessment = await prisma.assessment.create({
          data: {
            name: `Assessment ${i + 1} oleh ${assessor.user.full_name}`,
            scheme_id: scheme.id,
            status: faker.helpers.arrayElement(['PLANNED', 'ONGOING', 'COMPLETED']),
            location: faker.location.city(),
            start_date: faker.date.future(),
            end_date: faker.date.future().toISOString(),
            assessor_id: assessor.id,
          },
        });

        const assessees = await prisma.assessee.findMany({
          take: faker.number.int({ min: 3, max: 8 }),
        });

        for (const assessee of assessees) {
          await prisma.assessment_Assesse.create({
            data: {
              assessment_id: assessment.id,
              assessee_id: assessee.id,
            },
          });

          await prisma.assessment_Result.create({
            data: {
              assessment_id: assessment.id,
              assessee_id: assessee.id,
              approve: faker.datatype.boolean(),
            },
          });
        }
      }
    }
  }
  console.log('Created assessments with related data');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });