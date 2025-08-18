// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { gender, question_type, tuk } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Hapus semua data yang ada (untuk development saja)
  await prisma.result_apl02.deleteMany();
  await prisma.apl02_evidence.deleteMany();
  await prisma.result_apl02_header.deleteMany();
  await prisma.element_details_apl02.deleteMany();
  await prisma.element_apl02.deleteMany();
  await prisma.uc_apl02.deleteMany();
  await prisma.result_detail.deleteMany();
  await prisma.result_doc.deleteMany();
  await prisma.result.deleteMany();
  await prisma.assessee_answer.deleteMany();
  await prisma.question_pg_detail.deleteMany();
  await prisma.assessment_question.deleteMany();
  await prisma.element_detail.deleteMany();
  await prisma.element.deleteMany();
  await prisma.unit_competency.deleteMany();
  await prisma.assessment_schedule.deleteMany();
  await prisma.schedule_detail.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.occupation.deleteMany();
  await prisma.scheme.deleteMany();
  await prisma.assessee_job.deleteMany();
  await prisma.assessee.deleteMany();
  await prisma.assessor_detail.deleteMany();
  await prisma.assessor.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // Buat role
  const roles = await prisma.role.createMany({
    data: [
      { name: 'Admin' },
      { name: 'Assessor' },
      { name: 'Assessee' },
    ],
  });

  // Buat skema sertifikasi
  const scheme = await prisma.scheme.create({
    data: {
      code: 'TBG',
      name: 'Tata Boga',
    },
  });

  // Buat okupasi
  const occupation = await prisma.occupation.create({
    data: {
      scheme_id: scheme.id,
      name: 'Butcher Commis',
    },
  });

  // Buat admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin1@example.com',
      password: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // password
      role_id: 1, // Admin
    },
  });

  const admin = await prisma.admin.create({
    data: {
      user_id: adminUser.id,
      full_name: 'Admin Satu',
      address: 'Jl. Admin No. 1, Jakarta',
      phone_no: '081234567890',
      birth_date: new Date('1980-01-01'),
    },
  });

  // Buat beberapa assessor
  for (let i = 1; i <= 3; i++) {
    const assessorUser = await prisma.user.create({
      data: {
        email: `assessor${i}@example.com`,
        password: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // password
        role_id: 2, // Assessor
      },
    });

    const assessor = await prisma.assessor.create({
      data: {
        user_id: assessorUser.id,
        scheme_id: scheme.id,
        full_name: `Assesor ${i}`,
        address: `Jl. Assessor No. ${i}, Jakarta`,
        phone_no: `0812345678${i}${i}`,
        birth_date: new Date(`198${i}-01-01`),
      },
    });

    await prisma.assessor_detail.create({
      data: {
        assessor_id: assessor.id,
        tax_id_number: `1234567890${i}`,
        bank_book_cover: `bank_book_${i}.jpg`,
        certificate: `certificate_${i}.pdf`,
        national_id: `national_id_${i}.jpg`,
      },
    });
  }

  // Buat beberapa assessee
  for (let i = 1; i <= 5; i++) {
    const assesseeUser = await prisma.user.create({
      data: {
        email: `assessee${i}@example.com`,
        password: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // password
        role_id: 3, // Assessee
      },
    });

    const assessee = await prisma.assessee.create({
      data: {
        user_id: assesseeUser.id,
        full_name: `Assessee ${i}`,
        identity_number: `1234567890${i}`,
        birth_date: new Date(`199${i}-01-01`),
        birth_location: `Jakarta`,
        gender: i % 2 === 0 ? gender.male : gender.female,
        nationality: 'Indonesia',
        phone_no: `0812345678${i}${i}`,
        house_phone_no: `021123456${i}`,
        office_phone_no: `021987654${i}`,
        address: `Jl. Assessee No. ${i}, Jakarta`,
        postal_code: `1234${i}`,
        educational_qualifications: 'SMA/SMK',
      },
    });

    await prisma.assessee_job.create({
      data: {
        assessee_id: assessee.id,
        institution_name: `Perusahaan ${i}`,
        address: `Jl. Perusahaan No. ${i}, Jakarta`,
        postal_code: `1234${i}`,
        position: 'Karyawan',
        phone_no: `021987654${i}`,
        job_email: `kerja${i}@example.com`,
      },
    });
  }

  // Buat assessment
  const assessment = await prisma.assessment.create({
    data: {
      occupation_id: occupation.id,
      code: 'SKM.TBG.BC/LSPSMK24/2023',
    },
  });

  // Buat unit kompetensi berdasarkan dokumen
  const unitCompetencies = [
    {
      code: 'I.55HDR00.037.2',
      title: 'Mengorganisir dan Menyiapkan Makanan',
      elements: [
        'Menyiapkan perlengkapan sesuai kebutuhan',
        'Mengumpulkan dan menyiapkan bahan untuk jenis-jenis makanan dalam menu',
        'Menyiapkan produk yang terbuat dari susu, hidangan kering, buah-buahan dan sayur-sayuran',
        'Menyiapkan daging, seafood dan unggas',
      ],
    },
    {
      code: 'I.55HDR00.039.2',
      title: 'Menerima dan Menyimpan Persediaan',
      elements: [
        'Menerima persediaan makanan',
        'Menyimpan barang persediaan',
        'Mengevaluasi dan melaporkan hasil pelaksanaan kegiatan',
      ],
    },
    {
      code: 'I.55HDR00.040.2',
      title: 'Membersihkan Lokasi/Area dan Peralatan Dapur',
      elements: [
        'Membersihkan perlengkapan dan sanitasinya',
        'Membersihkan dan sanitasi lokasi',
        'Menangani limbah dan linen',
        'Mengadakan pelatihan',
      ],
    },
  ];

  for (const uc of unitCompetencies) {
    const unit = await prisma.unit_competency.create({
      data: {
        assessment_id: assessment.id,
        unit_code: uc.code,
        title: uc.title,
      },
    });

    for (const element of uc.elements) {
      const el = await prisma.element.create({
        data: {
          unit_competency_id: unit.id,
          title: element,
        },
      });

      // Tambahkan beberapa detail elemen
      await prisma.element_detail.create({
        data: {
          element_id: el.id,
          description: `Detail kriteria unjuk kerja untuk ${element}`,
        },
      });
    }
  }

  // Buat jadwal asesmen
  const schedule = await prisma.assessment_schedule.create({
    data: {
      assessment_id: assessment.id,
      start_date: new Date('2023-11-01'),
      end_date: new Date('2023-11-30'),
    },
  });

  // Assign assessor ke jadwal
  const assessors = await prisma.assessor.findMany();
  for (const assessor of assessors) {
    await prisma.schedule_detail.create({
      data: {
        schedule_id: schedule.id,
        assessor_id: assessor.id,
        location: 'TUK Sewaktu',
      },
    });
  }

  // Buat pertanyaan asesmen
  const questions = [
    {
      question: 'Apa yang harus dilakukan sebelum menyiapkan perlengkapan masak?',
      type: question_type.pg,
      options: [
        { option: 'Memastikan perlengkapan dalam keadaan bersih', isAnswer: true },
        { option: 'Menggunakan perlengkapan tanpa pemeriksaan', isAnswer: false },
        { option: 'Menyimpan perlengkapan di tempat yang tidak sesuai', isAnswer: false },
      ],
    },
    {
      question: 'Bagaimana cara menyimpan bahan makanan yang benar?',
      type: question_type.pg,
      options: [
        { option: 'Di tempat yang sesuai dengan jenis bahan', isAnswer: true },
        { option: 'Semua bahan dicampur dalam satu wadah', isAnswer: false },
        { option: 'Tanpa memperhatikan suhu penyimpanan', isAnswer: false },
      ],
    },
    {
      question: 'Jelaskan prosedur membersihkan peralatan dapur!',
      type: question_type.essay,
    },
  ];

  for (const q of questions) {
    const question = await prisma.assessment_question.create({
      data: {
        assessment_id: assessment.id,
        type: q.type,
        question: q.question,
      },
    });

    if (q.type === question_type.pg) {
      for (const opt of q.options) {
        await prisma.question_pg_detail.create({
          data: {
            question_id: question.id,
            option: opt.option,
            isanswer: opt.isAnswer,
          },
        });
      }
    }
  }

  // Buat UC untuk APL02
  const ucApl02 = await prisma.uc_apl02.create({
    data: {
      assessment_id: assessment.id,
      unit_code: 'I.55HDR00.037.2',
      title: 'Mengorganisir dan Menyiapkan Makanan',
    },
  });

  const elementsApl02 = [
    {
      title: 'Menyiapkan perlengkapan sesuai kebutuhan',
      details: [
        'Dipastikan perlengkapan dalam keadaan bersih',
        'Dipersiapkan perlengkapan sesuai kebutuhan',
      ],
    },
    {
      title: 'Mengumpulkan dan menyiapkan bahan untuk jenis-jenis makanan dalam menu',
      details: [
        'Bahan-bahan diidentifikasi dengan benar, sesuai dengan resep standar',
        'Jumlah, jenis dan mutu bahan-bahan harus tepat dikumpulkan dan disiapkan dalam bentuk yang benar dan jangka waktu yang sesuai',
      ],
    },
  ];

  for (const el of elementsApl02) {
    const element = await prisma.element_apl02.create({
      data: {
        uc_id: ucApl02.id,
        title: el.title,
      },
    });

    for (const detail of el.details) {
      await prisma.element_details_apl02.create({
        data: {
          element_id: element.id,
          description: detail,
        },
      });
    }
  }

  // Buat grup IA (IA02/IA03)
  const group1 = await prisma.group_ia.create({
    data: {
      assessment_id: assessment.id,
      name: 'Kelompok Pekerjaan 1',
      scenario: 'Dalam rangka mencapai kualifikasi food product, anda diharapkan mampu mengolah makanan secara profesional Untuk mendukung pencapaian hasil sesuai dengan spesifikasi yang telah ditentukan. Oleh karena itu anda akan diperlengkapi dengan peralatan kitchen utensil dan kitchen equipment sesuai dengan lembar kerja dan SOP/IK terkait.',
      duration: 20,
    },
  });

  // Tambahkan tools untuk grup IA
  const tools = ['Baju masak', 'Upron', 'Necktie', 'Serbet', 'Bowl', 'Pisau', 'Cutting board'];
  for (const tool of tools) {
    await prisma.ia02_tool.create({
      data: {
        group_id: group1.id,
        name: tool,
      },
    });
  }

  // Tambahkan UC untuk grup IA
  const ucIa = await prisma.uc_ia.create({
    data: {
      group_id: group1.id,
      unit_code: 'I.55HDR00.037.2',
      title: 'Mengorganisir dan Menyiapkan Makanan',
    },
  });

  const elementsIa = [
    {
      title: 'Menyiapkan perlengkapan sesuai kebutuhan',
      details: [
        { description: 'Bahan kimia digunakan untuk pembersihan dan/atau sanitasi perlengkapan dapur secara benar', benchmark: 'Sesuai SOP' },
        { description: 'Perlengkapan dibersihkan dan/atau disanitasikan sesuai dengan instruksi perusahaan dan tanpa menyebabkan kerusakan', benchmark: 'Sesuai SOP' },
      ],
    },
  ];

  for (const el of elementsIa) {
    const element = await prisma.element_ia.create({
      data: {
        uc_id: ucIa.id,
        title: el.title,
      },
    });

    for (const detail of el.details) {
      await prisma.element_details_ia.create({
        data: {
          element_id: element.id,
          description: detail.description,
          benchmark: detail.benchmark,
        },
      });
    }
  }

  // Tambahkan pertanyaan IA03 untuk grup
  const ia03Questions = [
    'Apa yang harus dilakukan sebelum menggunakan perlengkapan masak?',
    'Bagaimana cara menyimpan bahan makanan yang benar?',
  ];

  for (const q of ia03Questions) {
    await prisma.ia03_question.create({
      data: {
        group_id: group1.id,
        question: q,
      },
    });
  }

  // Buat grup kedua (Kelompok Pekerjaan 2)
  const group2 = await prisma.group_ia.create({
    data: {
      assessment_id: assessment.id,
      name: 'Kelompok Pekerjaan 2',
      scenario: 'Pada sekenario kelompok 2 ini anda diminta untuk membuat: 1. 2 Porsi Maincourse 2. 2 Porsi Soup 3. 1 Porsi Sandwich',
      duration: 180,
    },
  });

  // Buat hasil asesmen untuk beberapa assessee
  const assessees = await prisma.assessee.findMany();
  const assessor = await prisma.assessor.findFirst();

  for (const assessee of assessees.slice(0, 3)) {
    if (assessor) {
      const result = await prisma.result.create({
        data: {
          assessment_id: assessment.id,
          assessor_id: assessor.id,
          assessee_id: assessee.id,
          approved: false,
          tuk: tuk.sewaktu,
        },
      });

      // Buat dokumen hasil
      await prisma.result_doc.create({
        data: {
          result_id: result.id,
          assessor_id: assessor.id,
          purpose: 'Sertifikasi',
          school_report_card: 'raport.pdf',
          field_work_practice_certificate: 'pkl.pdf',
          student_card: 'kartu_pelajar.pdf',
          family_card: 'kk.pdf',
          id_card: 'ktp.pdf',
          approved: false,
        },
      });


      // Buat hasil APL02
      const apl02Header = await prisma.result_apl02_header.create({
        data: {
          result_id: result.id,
          approved: false,
        },
      });

      const elements = await prisma.element_apl02.findMany();
      for (const element of elements) {
        const row = await prisma.result_apl02.create({
          data: {
            result_apl02_id: apl02Header.id,
            element_id: element.id,
            is_competent: Math.random() > 0.3, // 70% kompeten
          },
        });

        await prisma.apl02_evidence.create({
          data: {
            result_apl02_id: row.id,
            evidence: `Bukti untuk ${element.title}`,
          },
        });
      }

      // Buat hasil IA01
      const ia01Header = await prisma.result_ia01_header.create({
        data: {
          result_id: result.id,
          approved_assessee: false,
          approved_assessor: false,
        },
      });

      const elementDetails = await prisma.element_details_ia.findMany();
      for (const detail of elementDetails) {
        await prisma.result_ia01.create({
          data: {
            header_id: ia01Header.id,
            element_detail_id: detail.id,
            is_competent: Math.random() > 0.3, // 70% kompeten
            evaluation: 'Evaluasi untuk elemen ini',
          },
        });
      }
    }
  }

  console.log('Seeder berhasil dijalankan!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });