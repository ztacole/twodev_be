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
  console.log('Menghapus data lama...');
  await prisma.result_ia07.deleteMany();
  await prisma.result_ia07_header.deleteMany();
  await prisma.ia07_question.deleteMany();
  await prisma.result_ia05.deleteMany();
  await prisma.result_ia05_header.deleteMany();
  await prisma.question_option.deleteMany();
  await prisma.ia05_question.deleteMany();
  await prisma.result_ia03.deleteMany();
  await prisma.result_ia03_header.deleteMany();
  await prisma.ia03_question.deleteMany();
  await prisma.result_ia02_header.deleteMany();
  await prisma.result_ia01.deleteMany();
  await prisma.result_ia01_header.deleteMany();
  await prisma.result_ak05.deleteMany();
  await prisma.result_ak04.deleteMany();
  await prisma.result_ak03.deleteMany();
  await prisma.result_ak03_header.deleteMany();
  await prisma.result_ak02.deleteMany();
  await prisma.ak02_evidence.deleteMany();
  await prisma.result_ak02_header.deleteMany();
  await prisma.result_ak01.deleteMany();
  await prisma.result_ak01_header.deleteMany();
  await prisma.apl02_evidence.deleteMany();
  await prisma.result_apl02.deleteMany();
  await prisma.result_apl02_header.deleteMany();
  await prisma.element_details_apl02.deleteMany();
  await prisma.element_apl02.deleteMany();
  await prisma.uc_apl02.deleteMany();
  await prisma.result_doc.deleteMany();
  await prisma.result.deleteMany();
  await prisma.schedule_detail.deleteMany();
  await prisma.assessment_schedule.deleteMany();
  await prisma.ia02_tool.deleteMany();
  await prisma.uc_ia03.deleteMany();
  await prisma.group_ia03.deleteMany();
  await prisma.uc_ia02.deleteMany();
  await prisma.group_ia02.deleteMany();
  await prisma.element_details_ia.deleteMany();
  await prisma.element_ia.deleteMany();
  await prisma.uc_ia01.deleteMany();
  await prisma.group_ia01.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.occupation.deleteMany();
  await prisma.scheme.deleteMany();
  await prisma.assessor_detail.deleteMany();
  await prisma.assessor.deleteMany();
  await prisma.assessee_job.deleteMany();
  await prisma.assessee.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

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

  // Buat skema terlebih dahulu
  console.log('Membuat skema...');
  const schemeRPL = await prisma.scheme.create({
    data: {
      code: 'RPL',
      name: 'Rekayasa Perangkat Lunak',
    },
  });

  const schemePH = await prisma.scheme.create({
    data: {
      code: 'PH',
      name: 'Perhotelan',
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
          no_reg_met: `MET.000.${Math.floor(Math.random() * 100000)}.${new Date().getFullYear()}`,
          scheme_id: schemeRPL.id,
        },
      },
    },
    include: {
      assessor: true,
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
          no_reg_met: `MET.000.${Math.floor(Math.random() * 100000)}.${new Date().getFullYear()}`,
          scheme_id: schemeRPL.id,
        },
      },
    },
    include: {
      assessor: true,
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
      assessor_id: assessorUser1.assessor!.id,
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
      assessee_id: assesseeUser1.assessee[0].id,
      institution_name: 'Perusahaan Teknologi Inc.',
      address: 'Gedung Perkantoran Tower 200',
      postal_code: '12345',
      position: 'Pengembang Software',
      phone_no: '0211234567',
      job_email: 'asesi1@perusahaan.com',
    },
  });

  // Buat okupasi
  console.log('Membuat okupasi...');
  const occupation1 = await prisma.occupation.create({
    data: {
      scheme_id: schemeRPL.id,
      name: 'Pengembang Web',
    },
  });

  const occupation2 = await prisma.occupation.create({
    data: {
      scheme_id: schemeRPL.id,
      name: 'Pengembang Mobile',
    },
  });

  const occupation3 = await prisma.occupation.create({
    data: {
      scheme_id: schemePH.id,
      name: 'Pelayanan Hotel',
    },
  });

  // Buat assessment
  console.log('Membuat assessment...');
  const assessment1 = await prisma.assessment.create({
    data: {
      occupation_id: occupation1.id,
      code: 'SKM.RPL.PS/LSPSMK24/2025',
      // Buat grup IA01
      groups_ia01: {
        create: {
          name: 'Pengembangan Web Dasar',
          units: {
            create: {
              unit_code: 'RPL.WEB.01',
              title: 'Membangun Halaman Web Statis',
              elements: {
                create: {
                  title: 'Memahami HTML dan CSS',
                  details: {
                    create: [
                      {
                        description: 'Mampu membuat struktur HTML yang semantik',
                        benchmark: 'Struktur HTML valid dan mengikuti standar W3C'
                      },
                      {
                        description: 'Mampu menerapkan styling dengan CSS',
                        benchmark: 'Desain responsif dan kompatibel dengan berbagai browser'
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      // Buat grup IA02
      groups_ia02: {
        create: {
          name: 'Proyek Pengembangan Web',
          scenario: 'Membangun website portofolio pribadi dengan HTML, CSS, dan JavaScript',
          duration: 120,
          tools: {
            create: [
              { name: 'Text Editor (VS Code)' },
              { name: 'Web Browser' },
              { name: 'Git untuk Version Control' }
            ]
          },
          units: {
            create: {
              unit_code: 'RPL.WEB.02',
              title: 'Membangun Website Dinamis'
            }
          }
        }
      },
      // Buat grup IA03
      groups_ia03: {
        create: {
          name: 'Wawancara Teknis',
          qa_ia03: {
            create: [
              { question: 'Apa perbedaan antara let, const, dan var dalam JavaScript?' },
              { question: 'Jelaskan apa itu responsive design dan bagaimana menerapkannya?' }
            ]
          },
          units: {
            create: {
              unit_code: 'RPL.WEB.03',
              title: 'Pemecahan Masalah Pengembangan Web'
            }
          }
        }
      },
      // Buat unit kompetensi APL02
      uc_apl02s: {
        create: {
          unit_code: 'RPL.WEB.01',
          title: 'Membangun Halaman Web Statis',
          elements: {
            create: {
              title: 'Memahami HTML dan CSS',
              details: {
                create: [
                  { description: 'Mampu membuat struktur HTML yang semantik' },
                  { description: 'Mampu menerapkan styling dengan CSS' }
                ]
              }
            }
          }
        }
      },
      // Buat soal IA05 (pilihan ganda)
      ia05_questions: {
        create: {
          order: 1,
          question: 'Apa kepanjangan dari CSS?',
          options: {
            create: [
              { option: 'Cascading Style Sheets', is_answer: true },
              { option: 'Computer Style Sheets', is_answer: false },
              { option: 'Creative Style System', is_answer: false },
              { option: 'Colorful Style Sheets', is_answer: false }
            ]
          }
        }
      },
      // Buat soal IA07 (essay)
      ia07_questions: {
        create: {
          question: 'Jelaskan apa yang dimaksud dengan Box Model dalam CSS dan sebutkan komponen-komponennya!',
          answer_key: 'Box Model adalah konsep dalam CSS yang menggambarkan bagaimana elemen HTML dirender. Komponennya terdiri dari: content, padding, border, dan margin.'
        }
      }
    },
    include: {
      groups_ia01: {
        include: {
          units: {
            include: {
              elements: {
                include: {
                  details: true
                }
              }
            }
          }
        }
      },
      groups_ia02: {
        include: {
          tools: true,
          units: true
        }
      },
      groups_ia03: {
        include: {
          qa_ia03: true,
          units: true
        }
      },
      uc_apl02s: {
        include: {
          elements: {
            include: {
              details: true
            }
          }
        }
      },
      ia05_questions: {
        include: {
          options: true
        }
      },
      ia07_questions: true
    }
  });

  // Buat jadwal assessment
  console.log('Membuat jadwal assessment...');
  const assessmentSchedule = await prisma.assessment_schedule.create({
    data: {
      assessment_id: assessment1.id,
      start_date: new Date('2023-12-01'),
      end_date: new Date('2023-12-05'),
      schedule_details: {
        create: {
          assessor_id: assessorUser1.assessor!.id,
          location: 'Gedung LSP Teknologi Lt. 3'
        }
      }
    },
    include: {
      schedule_details: true
    }
  });

  // Buat hasil assessment
  console.log('Membuat hasil assessment...');
  const result = await prisma.result.create({
    data: {
      assessment_id: assessment1.id,
      assessor_id: assessorUser1.assessor!.id,
      assessee_id: assesseeUser1.assessee[0].id,
      is_competent: false,
      tuk: 'sewaktu',
      // Dokumen hasil
      docs: {
        create: {
          purpose: 'Sertifikasi Profesi',
          school_report_card: 'ijazah.pdf',
          field_work_practice_certificate: 'sertifikat_pkl.pdf',
          student_card: 'kartu_mahasiswa.pdf',
          family_card: 'kartu_keluarga.pdf',
          id_card: 'ktp.pdf',
          approved: true
        }
      },
      // Hasil APL02
      apl02_headers: {
        create: {
          approved_assessee: false,
          approved_assessor: false,
          is_continue: false,
          rows: {
            create: {
              element: {
                connect: {
                  id: assessment1.uc_apl02s[0].elements[0].id
                }
              },
              is_competent: false,
              evidences: {
                create: [
                  { evidence: 'portofolio_proyek_web.pdf' },
                  { evidence: 'sertifikat_pelatihan_html_css.pdf' }
                ]
              }
            }
          }
        }
      },
      // Hasil AK01
      ak01_headers: {
        create: {
          approved_assessee: false,
          approved_assessor: false,
          rows: {
            create: [
              { evidence: 'portofolio_proyek_web.pdf' },
              { evidence: 'sertifikat_pelatihan.pdf' }
            ]
          }
        }
      },
      // Hasil AK02
      ak02_headers: {
        create: {
          approved_assessee: false,
          approved_assessor: false,
          is_competent: false,
          follow_up: 'Perlu peningkatan dalam penggunaan CSS Grid',
          comment: 'Kandidat menunjukkan pemahaman yang baik tentang HTML dan CSS dasar',
          rows: {
            create: {
              uc: {
                connect: {
                  id: assessment1.uc_apl02s[0].id
                }
              },
              evidences: {
                create: [
                  { evidence: 'file_proyek_html.zip' },
                  { evidence: 'screenshot_tampilan_web.png' }
                ]
              }
            }
          }
        }
      },
      // Hasil AK03
      result_ak03_header: {
        create: {
          comment: 'Semua peralatan dalam kondisi baik dan siap digunakan',
          answers: {
            create: [
              {
                question: 'Apakah komputer tersedia dan berfungsi?',
                answer: true,
                comment: 'Tersedia 1 unit komputer yang berfungsi dengan baik'
              },
              {
                question: 'Apakah koneksi internet stabil?',
                answer: true,
                comment: 'Stabil 50Mbps, tapi kadang-kadang kurang stabil'
              },
              {
                question: 'Apakah ruangan assessment sesuai standar?',
                answer: true,
                comment: 'Standar ruangan cukup baik'
              },
              {
                question: 'Apakah perangkat keras tersedia?',
                answer: true,
                comment: 'Perangkat keras lengkap dan berfungsi'
              },
              {
                question: 'Apakah perangkat lunak tersedia?',
                answer: true,
                comment: 'Seluruh perangkat lunak yang diperlukan tersedia'
              },
              {
                question: 'Apakah dokumen panduan tersedia?',
                answer: true,
                comment: 'Seluruh dokumen panduan assessment tersedia'
              },
              {
                question: 'Apakah instrumen assessment tersedia?',
                answer: true,
                comment: 'Seluruh instrumen assessment tersedia'
              },
              {
                question: 'Apakah ruangan assessment memiliki ventilasi yang baik?',
                answer: true,
                comment: 'Ventilasi ruangan cukup baik'
              },
              {
                question: 'Apakah ruangan assessment memiliki pencahayaan yang baik?',
                answer: true,
                comment: 'Pencahayaan ruangan cukup baik'
              },
              {
                question: 'Apakah ruangan assessment memiliki keamanan yang baik?',
                answer: true,
                comment: 'Keamanan ruangan cukup baik'
              }
            ]
          }
        }
      },
      // Hasil AK04
      result_ak04: {
        create: {
          approved_assessee: false,
          q1_yes: false,
          q2_yes: false,
          q3_yes: false,
          reason: 'Asesi telah memenuhi semua persyaratan dan siap mengikuti assessment'
        }
      },
      // Hasil AK05
      result_ak05: {
        create: {
          approved_assessor: false,
          is_competent: false,
          description: 'Asesi menunjukkan kompetensi dalam pengembangan web dasar',
          negative_positive_aspects: 'Positif: Kreatif dalam desain. Negatif: Perlu meningkatkan pemahaman CSS advanced',
          improvement_suggestions: 'Disarankan untuk mempelajari CSS Grid dan Flexbox lebih dalam',
          notes: 'Asesi menunjukkan kemampuan dalam pengembangan web dasar'
        }
      },
      // Hasil IA01
      ia01_headers: {
        create: {
          approved_assessee: false,
          approved_assessor: false,
          is_competent: false,
          group: assessment1.groups_ia01[0].name,
          unit: assessment1.groups_ia01[0].units[0].title,
          element: assessment1.groups_ia01[0].units[0].elements[0].title,
          kuk: assessment1.groups_ia01[0].units[0].elements[0].details[0].benchmark,
          rows: {
            create: {
              elementDetail: {
                connect: {
                  id: assessment1.groups_ia01[0].units[0].elements[0].details[0].id
                }
              },
              is_competent: true,
              evaluation: 'Asesi mampu membuat struktur HTML yang semantik dengan baik'
            }
          }
        }
      },
      // Hasil IA02
      ia02_headers: {
        create: {
          approved_assessee: false,
          approved_assessor: false
        }
      },
      // Hasil IA03
      ia03_headers: {
        create: {
          approved_assessee: false,
          approved_assessor: false,
          rows: {
            create: [
              {
                question: {
                  connect: {
                    id: assessment1.groups_ia03[0].qa_ia03[0].id
                  }
                },
                answer: 'Let dan const adalah block-scoped, sedangkan var adalah function-scoped. Let dapat diubah nilainya, const tidak dapat diubah setelah dideklarasikan',
                approved: true
              },
              {
                question: {
                  connect: {
                    id: assessment1.groups_ia03[0].qa_ia03[1].id
                  }
                },
                answer: 'Responsive design adalah pendekatan desain web yang membuat halaman web terlihat baik di semua perangkat. Diterapkan dengan media queries, fluid grids, dan flexible images',
                approved: true
              }
            ]
          }
        }
      },
      // Hasil IA05
      ia05_headers: {
        create: {
          approved_assessee: false,
          approved_assessor: false,
          is_achieved: false,
          rows: {
            create: {
              option: {
                connect: {
                  id: assessment1.ia05_questions[0].options[0].id
                }
              },
              approved: false
            }
          }
        }
      },
      // Hasil IA07
      ia07_headers: {
        create: {
          approved_assessee: false,
          approved_assessor: false,
          rows: {
            create: {
              question: {
                connect: {
                  id: assessment1.ia07_questions[0].id
                }
              },
              approved: false
            }
          }
        }
      }
    },
    include: {
      docs: true,
      apl02_headers: {
        include: {
          rows: {
            include: {
              evidences: true
            }
          }
        }
      },
      ak01_headers: {
        include: {
          rows: true
        }
      },
      ak02_headers: {
        include: {
          rows: {
            include: {
              evidences: true
            }
          }
        }
      },
      result_ak03_header: {
        include: {
          answers: true
        }
      },
      result_ak04: true,
      result_ak05: true,
      ia01_headers: {
        include: {
          rows: true
        }
      },
      ia03_headers: {
        include: {
          rows: true
        }
      },
      ia05_headers: {
        include: {
          rows: true
        }
      },
      ia07_headers: {
        include: {
          rows: true
        }
      }
    }
  });

  console.log('Seeding selesai!');
  console.log('Data yang dibuat:');
  console.log(`- Admin: ${adminUser.email}`);
  console.log(`- Assessor: ${assessorUser1.email}, ${assessorUser2.email}`);
  console.log(`- Assessee: ${assesseeUser1.email}, ${assesseeUser2.email}`);
  console.log(`- Scheme: ${schemeRPL.name}, ${schemePH.name}`);
  console.log(`- Assessment: ${assessment1.code}`);
  console.log(`- Result ID: ${result.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });