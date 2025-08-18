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
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed.ts
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Hapus semua data yang ada (untuk development saja)
        yield prisma.result_apl02.deleteMany();
        yield prisma.apl02_evidence.deleteMany();
        yield prisma.result_apl02_header.deleteMany();
        yield prisma.element_details_apl02.deleteMany();
        yield prisma.element_apl02.deleteMany();
        yield prisma.uc_apl02.deleteMany();
        yield prisma.result_detail.deleteMany();
        yield prisma.result_doc.deleteMany();
        yield prisma.result.deleteMany();
        yield prisma.assessee_answer.deleteMany();
        yield prisma.question_pg_detail.deleteMany();
        yield prisma.assessment_question.deleteMany();
        yield prisma.element_detail.deleteMany();
        yield prisma.element.deleteMany();
        yield prisma.unit_competency.deleteMany();
        yield prisma.assessment_schedule.deleteMany();
        yield prisma.schedule_detail.deleteMany();
        yield prisma.assessment.deleteMany();
        yield prisma.occupation.deleteMany();
        yield prisma.scheme.deleteMany();
        yield prisma.assessee_job.deleteMany();
        yield prisma.assessee.deleteMany();
        yield prisma.assessor_detail.deleteMany();
        yield prisma.assessor.deleteMany();
        yield prisma.admin.deleteMany();
        yield prisma.user.deleteMany();
        yield prisma.role.deleteMany();
        // Buat role
        const roles = yield prisma.role.createMany({
            data: [
                { name: 'Admin' },
                { name: 'Assessor' },
                { name: 'Assessee' },
            ],
        });
        // Buat skema sertifikasi
        const scheme = yield prisma.scheme.create({
            data: {
                code: 'TBG',
                name: 'Tata Boga',
            },
        });
        // Buat okupasi
        const occupation = yield prisma.occupation.create({
            data: {
                scheme_id: scheme.id,
                name: 'Butcher Commis',
            },
        });
        // Buat admin
        const adminUser = yield prisma.user.create({
            data: {
                email: 'admin1@example.com',
                password: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // password
                role_id: 1, // Admin
            },
        });
        const admin = yield prisma.admin.create({
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
            const assessorUser = yield prisma.user.create({
                data: {
                    email: `assessor${i}@example.com`,
                    password: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // password
                    role_id: 2, // Assessor
                },
            });
            const assessor = yield prisma.assessor.create({
                data: {
                    user_id: assessorUser.id,
                    scheme_id: scheme.id,
                    full_name: `Assesor ${i}`,
                    address: `Jl. Assessor No. ${i}, Jakarta`,
                    phone_no: `0812345678${i}${i}`,
                    birth_date: new Date(`198${i}-01-01`),
                },
            });
            yield prisma.assessor_detail.create({
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
            const assesseeUser = yield prisma.user.create({
                data: {
                    email: `assessee${i}@example.com`,
                    password: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // password
                    role_id: 3, // Assessee
                },
            });
            const assessee = yield prisma.assessee.create({
                data: {
                    user_id: assesseeUser.id,
                    full_name: `Assessee ${i}`,
                    identity_number: `1234567890${i}`,
                    birth_date: new Date(`199${i}-01-01`),
                    birth_location: `Jakarta`,
                    gender: i % 2 === 0 ? client_2.gender.male : client_2.gender.female,
                    nationality: 'Indonesia',
                    phone_no: `0812345678${i}${i}`,
                    house_phone_no: `021123456${i}`,
                    office_phone_no: `021987654${i}`,
                    address: `Jl. Assessee No. ${i}, Jakarta`,
                    postal_code: `1234${i}`,
                    educational_qualifications: 'SMA/SMK',
                },
            });
            yield prisma.assessee_job.create({
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
        const assessment = yield prisma.assessment.create({
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
            const unit = yield prisma.unit_competency.create({
                data: {
                    assessment_id: assessment.id,
                    unit_code: uc.code,
                    title: uc.title,
                },
            });
            for (const element of uc.elements) {
                const el = yield prisma.element.create({
                    data: {
                        unit_competency_id: unit.id,
                        title: element,
                    },
                });
                // Tambahkan beberapa detail elemen
                yield prisma.element_detail.create({
                    data: {
                        element_id: el.id,
                        description: `Detail kriteria unjuk kerja untuk ${element}`,
                    },
                });
            }
        }
        // Buat jadwal asesmen
        const schedule = yield prisma.assessment_schedule.create({
            data: {
                assessment_id: assessment.id,
                start_date: new Date('2023-11-01'),
                end_date: new Date('2023-11-30'),
            },
        });
        // Assign assessor ke jadwal
        const assessors = yield prisma.assessor.findMany();
        for (const assessor of assessors) {
            yield prisma.schedule_detail.create({
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
                type: client_2.question_type.pg,
                options: [
                    { option: 'Memastikan perlengkapan dalam keadaan bersih', isAnswer: true },
                    { option: 'Menggunakan perlengkapan tanpa pemeriksaan', isAnswer: false },
                    { option: 'Menyimpan perlengkapan di tempat yang tidak sesuai', isAnswer: false },
                ],
            },
            {
                question: 'Bagaimana cara menyimpan bahan makanan yang benar?',
                type: client_2.question_type.pg,
                options: [
                    { option: 'Di tempat yang sesuai dengan jenis bahan', isAnswer: true },
                    { option: 'Semua bahan dicampur dalam satu wadah', isAnswer: false },
                    { option: 'Tanpa memperhatikan suhu penyimpanan', isAnswer: false },
                ],
            },
            {
                question: 'Jelaskan prosedur membersihkan peralatan dapur!',
                type: client_2.question_type.essay,
            },
        ];
        for (const q of questions) {
            const question = yield prisma.assessment_question.create({
                data: {
                    assessment_id: assessment.id,
                    type: q.type,
                    question: q.question,
                },
            });
            if (q.type === client_2.question_type.pg) {
                for (const opt of q.options) {
                    yield prisma.question_pg_detail.create({
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
        const ucApl02 = yield prisma.uc_apl02.create({
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
            const element = yield prisma.element_apl02.create({
                data: {
                    uc_id: ucApl02.id,
                    title: el.title,
                },
            });
            for (const detail of el.details) {
                yield prisma.element_details_apl02.create({
                    data: {
                        element_id: element.id,
                        description: detail,
                    },
                });
            }
        }
        // Buat grup IA (IA02/IA03)
        const group1 = yield prisma.group_ia.create({
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
            yield prisma.ia02_tool.create({
                data: {
                    group_id: group1.id,
                    name: tool,
                },
            });
        }
        // Tambahkan UC untuk grup IA
        const ucIa = yield prisma.uc_ia.create({
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
            const element = yield prisma.element_ia.create({
                data: {
                    uc_id: ucIa.id,
                    title: el.title,
                },
            });
            for (const detail of el.details) {
                yield prisma.element_details_ia.create({
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
            yield prisma.ia03_question.create({
                data: {
                    group_id: group1.id,
                    question: q,
                },
            });
        }
        // Buat grup kedua (Kelompok Pekerjaan 2)
        const group2 = yield prisma.group_ia.create({
            data: {
                assessment_id: assessment.id,
                name: 'Kelompok Pekerjaan 2',
                scenario: 'Pada sekenario kelompok 2 ini anda diminta untuk membuat: 1. 2 Porsi Maincourse 2. 2 Porsi Soup 3. 1 Porsi Sandwich',
                duration: 180,
            },
        });
        // Buat hasil asesmen untuk beberapa assessee
        const assessees = yield prisma.assessee.findMany();
        const assessor = yield prisma.assessor.findFirst();
        for (const assessee of assessees.slice(0, 3)) {
            if (assessor) {
                const result = yield prisma.result.create({
                    data: {
                        assessment_id: assessment.id,
                        assessor_id: assessor.id,
                        assessee_id: assessee.id,
                        approved: false,
                        tuk: client_2.tuk.sewaktu,
                    },
                });
                // Buat dokumen hasil
                yield prisma.result_doc.create({
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
                const apl02Header = yield prisma.result_apl02_header.create({
                    data: {
                        result_id: result.id,
                        approved: false,
                    },
                });
                const elements = yield prisma.element_apl02.findMany();
                for (const element of elements) {
                    const row = yield prisma.result_apl02.create({
                        data: {
                            result_apl02_id: apl02Header.id,
                            element_id: element.id,
                            is_competent: Math.random() > 0.3, // 70% kompeten
                        },
                    });
                    yield prisma.apl02_evidence.create({
                        data: {
                            result_apl02_id: row.id,
                            evidence: `Bukti untuk ${element.title}`,
                        },
                    });
                }
                // Buat hasil IA01
                const ia01Header = yield prisma.result_ia01_header.create({
                    data: {
                        result_id: result.id,
                        approved_assessee: false,
                        approved_assessor: false,
                    },
                });
                const elementDetails = yield prisma.element_details_ia.findMany();
                for (const detail of elementDetails) {
                    yield prisma.result_ia01.create({
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
