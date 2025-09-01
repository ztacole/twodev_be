"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password';
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcryptjs_1.default.hash(password, SALT_ROUNDS);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Memulai seeding...');
        // Hapus data yang ada (hati-hati di production!)
        console.log('Menghapus data lama...');
        yield prisma.result_ia07.deleteMany();
        yield prisma.result_ia07_header.deleteMany();
        yield prisma.ia07_question.deleteMany();
        yield prisma.result_ia05.deleteMany();
        yield prisma.result_ia05_header.deleteMany();
        yield prisma.question_option.deleteMany();
        yield prisma.ia05_question.deleteMany();
        yield prisma.result_ia03.deleteMany();
        yield prisma.result_ia03_header.deleteMany();
        yield prisma.ia03_question.deleteMany();
        yield prisma.result_ia02_header.deleteMany();
        yield prisma.result_ia01.deleteMany();
        yield prisma.result_ia01_header.deleteMany();
        yield prisma.result_ak05.deleteMany();
        yield prisma.result_ak04.deleteMany();
        yield prisma.result_ak03.deleteMany();
        yield prisma.result_ak03_header.deleteMany();
        yield prisma.result_ak02.deleteMany();
        yield prisma.ak02_evidence.deleteMany();
        yield prisma.result_ak02_header.deleteMany();
        yield prisma.result_ak01.deleteMany();
        yield prisma.result_ak01_header.deleteMany();
        yield prisma.apl02_evidence.deleteMany();
        yield prisma.result_apl02.deleteMany();
        yield prisma.result_apl02_header.deleteMany();
        yield prisma.element_details_apl02.deleteMany();
        yield prisma.element_apl02.deleteMany();
        yield prisma.uc_apl02.deleteMany();
        yield prisma.result_doc.deleteMany();
        yield prisma.result.deleteMany();
        yield prisma.schedule_detail.deleteMany();
        yield prisma.assessment_schedule.deleteMany();
        yield prisma.ia02_tool.deleteMany();
        yield prisma.uc_ia03.deleteMany();
        yield prisma.group_ia03.deleteMany();
        yield prisma.uc_ia02.deleteMany();
        yield prisma.group_ia02.deleteMany();
        yield prisma.element_details_ia.deleteMany();
        yield prisma.element_ia.deleteMany();
        yield prisma.uc_ia01.deleteMany();
        yield prisma.group_ia01.deleteMany();
        yield prisma.assessment.deleteMany();
        yield prisma.occupation.deleteMany();
        yield prisma.scheme.deleteMany();
        yield prisma.assessor_detail.deleteMany();
        yield prisma.assessor.deleteMany();
        yield prisma.assessee_job.deleteMany();
        yield prisma.assessee.deleteMany();
        yield prisma.admin.deleteMany();
        yield prisma.user.deleteMany();
        yield prisma.role.deleteMany();
        // Buat role
        console.log('Membuat role...');
        const adminRole = yield prisma.role.create({
            data: {
                name: 'Admin',
            },
        });
        const assessorRole = yield prisma.role.create({
            data: {
                name: 'Assessor',
            },
        });
        const assesseeRole = yield prisma.role.create({
            data: {
                name: 'Assessee',
            },
        });
        // Buat user dengan password ter-hash
        console.log('Membuat user...');
        const hashedPassword = yield hashPassword(DEFAULT_PASSWORD);
        // Admin
        const adminUser = yield prisma.user.create({
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
        const schemeRPL = yield prisma.scheme.create({
            data: {
                code: 'RPL',
                name: 'Rekayasa Perangkat Lunak',
            },
        });
        const schemePH = yield prisma.scheme.create({
            data: {
                code: 'PH',
                name: 'Perhotelan',
            },
        });
        // Assessor 1
        const assessorUser1 = yield prisma.user.create({
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
        const assessorUser2 = yield prisma.user.create({
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
        const assesseeUser1 = yield prisma.user.create({
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
        const assesseeUser2 = yield prisma.user.create({
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
        yield prisma.assessor_detail.create({
            data: {
                assessor_id: assessorUser1.assessor.id,
                tax_id_number: '123456789012345',
                bank_book_cover: 'buku_bank_1.jpg',
                certificate: 'sertifikat_1.pdf',
                national_id: 'ktp_1.jpg',
            },
        });
        // Tambah pekerjaan asesi
        console.log('Membuat pekerjaan asesi...');
        yield prisma.assessee_job.create({
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
        const occupation1 = yield prisma.occupation.create({
            data: {
                scheme_id: schemeRPL.id,
                name: 'Pengembang Web',
            },
        });
        const occupation2 = yield prisma.occupation.create({
            data: {
                scheme_id: schemeRPL.id,
                name: 'Pengembang Mobile',
            },
        });
        const occupation3 = yield prisma.occupation.create({
            data: {
                scheme_id: schemePH.id,
                name: 'Pelayanan Hotel',
            },
        });
        // Buat assessment
        console.log('Membuat assessment...');
        const assessment1 = yield prisma.assessment.create({
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
        const assessmentSchedule = yield prisma.assessment_schedule.create({
            data: {
                assessment_id: assessment1.id,
                start_date: new Date('2023-12-01'),
                end_date: new Date('2023-12-05'),
                schedule_details: {
                    create: {
                        assessor_id: assessorUser1.assessor.id,
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
        const result = yield prisma.result.create({
            data: {
                assessment_id: assessment1.id,
                assessor_id: assessorUser1.assessor.id,
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
                        rows: {
                            create: [
                                {
                                    component: 'Komputer',
                                    is_ok: true,
                                    comment: 'Spesifikasi memadai untuk pengembangan web'
                                },
                                {
                                    component: 'Koneksi Internet',
                                    is_ok: true,
                                    comment: 'Kecepatan stabil 50Mbps'
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
                        improvement_suggestions: 'Disarankan untuk mempelajari CSS Grid dan Flexbox lebih dalam'
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
                        rows: true
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
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
