import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('Memulai seeding...');

  // Hapus data yang ada (hati-hati di production!)
  await prisma.result_ia07.deleteMany();
  await prisma.result_ia07_header.deleteMany();
  await prisma.ia07_question.deleteMany();
  // ... (lanjutan deleteMany untuk semua tabel)

  // Buat role
  console.log('Membuat role...');
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
    },
  });

  const assessorRole = await prisma.role.create({
    data: {
      name: 'Assessor',
    },
  });

  const assesseeRole = await prisma.role.create({
    data: {
      name: 'Assessee',
    },
  });

  // Buat user dengan password ter-hash
  console.log('Membuat user...');
  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

  // Admin
  const adminUser = await prisma.user.create({
    data: {
      full_name: 'Admin Utama',
      email: 'admin@example.com',
      password: hashedPassword,
      role_id: adminRole.id,
      admin: {
        create: {
          address: 'Jalan Admin No. 123',
          phone_no: '081234567890',
          birth_date: new Date('1980-01-01'),
        },
      },
    },
  });

  // Assessor 1
  const assessorUser1 = await prisma.user.create({
    data: {
      full_name: 'Assessor Pertama',
      email: 'assessor1@example.com',
      password: hashedPassword,
      role_id: assessorRole.id,
      assessor: {
        create: {
          address: 'Jalan Assessor No. 456',
          phone_no: '082345678901',
          birth_date: new Date('1985-05-15'),
          scheme: {
            create: {
              code: 'RPL',
              name: 'Rekayasa Perangkat Lunak',
            },
          },
        },
      },
    },
    include: {
      assessor: {
        include: {
          scheme: true,
        },
      },
    },
  });

  // Assessor 2
  const assessorUser2 = await prisma.user.create({
    data: {
      full_name: 'Assessor Kedua',
      email: 'assessor2@example.com',
      password: hashedPassword,
      role_id: assessorRole.id,
      assessor: {
        create: {
          address: 'Jalan Penilai No. 789',
          phone_no: '083456789012',
          birth_date: new Date('1975-08-20'),
          scheme_id: assessorUser1.assessor?.scheme_id || 1,
        },
      },
    },
  });

  // Assessee 1
  const assesseeUser1 = await prisma.user.create({
    data: {
      full_name: 'Asesi Pertama',
      email: 'asesi1@example.com',
      password: hashedPassword,
      role_id: assesseeRole.id,
      assessee: {
        create: {
          identity_number: '1234567890',
          birth_date: new Date('1990-03-10'),
          birth_location: 'Jakarta',
          gender: 'male',
          nationality: 'Indonesia',
          phone_no: '084567890123',
          address: 'Jalan Asesi No. 101',
          educational_qualifications: 'Sarjana',
        },
      },
    },
    include: {
      assessee: true,
    },
  });

  // Assessee 2
  const assesseeUser2 = await prisma.user.create({
    data: {
      full_name: 'Asesi Kedua',
      email: 'asesi2@example.com',
      password: hashedPassword,
      role_id: assesseeRole.id,
      assessee: {
        create: {
          identity_number: '0987654321',
          birth_date: new Date('1995-07-22'),
          birth_location: 'Bandung',
          gender: 'female',
          nationality: 'Indonesia',
          phone_no: '085678901234',
          address: 'Jalan Peserta No. 202',
          educational_qualifications: 'Diploma',
        },
      },
    },
    include: {
      assessee: true,
    },
  });

  // Tambah detail assessor
  console.log('Membuat detail assessor...');
  await prisma.assessor_detail.create({
    data: {
      assessor_id: assessorUser1.assessor?.id || 1,
      tax_id_number: '123456789012345',
      bank_book_cover: 'buku_bank_1.jpg',
      certificate: 'sertifikat_1.pdf',
      national_id: 'ktp_1.jpg',
    },
  });

  // Tambah pekerjaan asesi
  console.log('Membuat pekerjaan asesi...');
  await prisma.assessee_job.create({
    data: {
      assessee_id: assesseeUser1.assessee[0]?.id || 1,
      institution_name: 'Perusahaan Teknologi Inc.',
      address: 'Gedung Perkantoran Tower 200',
      postal_code: '12345',
      position: 'Pengembang Software',
      phone_no: '0211234567',
      job_email: 'asesi1@perusahaan.com',
    },
  });

  // Buat skema dan okupasi tambahan
  console.log('Membuat skema dan okupasi...');
  const scheme2 = await prisma.scheme.create({
    data: {
      code: 'PH',
      name: 'Perhotelan',
    },
  });

  const occupation1 = await prisma.occupation.create({
    data: {
      scheme_id: assessorUser1.assessor?.scheme_id || 1,
      name: 'Pengembang Software',
    },
  });

  const occupation2 = await prisma.occupation.create({
    data: {
      scheme_id: scheme2.id,
      name: 'Pelayanan Hotel',
    },
  });

  // Buat assessment
  console.log('Membuat assessment...');
  const assessment1 = await prisma.assessment.create({
    data: {
      occupation_id: occupation1.id,
      code: 'SKM.RPL.PS/LSPSMK24/2025',
    },
  });

  // Buat jadwal assessment
  const assessmentSchedule = await prisma.assessment_schedule.create({
    data: {
      assessment_id: assessment1.id,
      start_date: new Date('2023-12-01'),
      end_date: new Date('2023-12-05'),
    },
  });

  // Buat detail jadwal
  await prisma.schedule_detail.create({
    data: {
      schedule_id: assessmentSchedule.id,
      assessor_id: assessorUser1.assessor?.id || 1,
      location: 'Gedung LSP Teknologi Lt. 3',
    },
  });

  console.log('Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });