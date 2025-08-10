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
const id_ID_1 = require("@faker-js/faker/locale/id_ID");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Seed Roles
        yield prisma.role.createMany({
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
        yield prisma.schemes.createMany({
            data: schemesData,
            skipDuplicates: true,
        });
        const schemes = yield prisma.schemes.findMany();
        // Seed Occupations
        const occupationsData = [];
        for (const scheme of schemes) {
            const occupation = yield prisma.occupation.create({
                data: {
                    scheme_id: scheme.id,
                    name: id_ID_1.faker.person.jobTitle(),
                },
            });
            occupationsData.push(occupation);
        }
        // Seed Assessments
        const assessmentsData = [];
        for (const occupation of occupationsData) {
            const assessment = yield prisma.assessment.create({
                data: {
                    occupation_id: occupation.id,
                    code: id_ID_1.faker.string.alphanumeric(10),
                },
            });
            assessmentsData.push(assessment);
        }
        // Seed Assessment Questions
        const questionsData = [];
        for (const assessment of assessmentsData) {
            for (let i = 0; i < 3; i++) { // Create 3 questions per assessment
                const question = yield prisma.assessment_Question.create({
                    data: {
                        assessment_id: assessment.id,
                        type: 'PG', // Assuming PG for multiple choice
                        question: id_ID_1.faker.lorem.sentence(),
                    },
                });
                questionsData.push(question);
            }
        }
        // Seed Unit Competencies and Elements
        const unitCompetenciesData = [];
        for (const assessment of assessmentsData) {
            const unitCompetency = yield prisma.unit_Competency.create({
                data: {
                    assessment_id: assessment.id,
                    unit_code: id_ID_1.faker.string.alphanumeric(5),
                    title: id_ID_1.faker.lorem.sentence(),
                },
            });
            unitCompetenciesData.push(unitCompetency);
            // Create elements for each unit competency
            for (let i = 0; i < 2; i++) {
                yield prisma.element.create({
                    data: {
                        unit_competency_id: unitCompetency.id,
                        title: id_ID_1.faker.lorem.sentence(),
                    },
                });
            }
        }
        // Seed Users, Admins, Assessors, and Assessees
        const users = [];
        for (let i = 0; i < 10; i++) {
            const role_id = id_ID_1.faker.helpers.arrayElement([1, 2, 3]);
            const fullName = id_ID_1.faker.person.fullName();
            const user = yield prisma.user.create({
                data: {
                    email: id_ID_1.faker.internet.email(),
                    password: yield bcryptjs_1.default.hash("password", 10),
                    role_id,
                },
            });
            users.push(Object.assign(Object.assign({}, user), { role_id }));
            if (role_id === 1) {
                yield prisma.admin.create({
                    data: {
                        user_id: user.id,
                        full_name: fullName,
                        address: id_ID_1.faker.location.streetAddress(),
                        phone_no: id_ID_1.faker.phone.number(),
                        birth_date: id_ID_1.faker.date.past({ years: 30 }),
                    },
                });
            }
            if (role_id === 2) {
                const assessor = yield prisma.assessor.create({
                    data: {
                        user_id: user.id,
                        scheme_id: id_ID_1.faker.helpers.arrayElement(schemes).id,
                        full_name: fullName,
                        address: id_ID_1.faker.location.streetAddress(),
                        phone_no: id_ID_1.faker.phone.number(),
                        birth_date: id_ID_1.faker.date.past({ years: 30 }),
                    },
                });
                yield prisma.assessor_Details.create({
                    data: {
                        assessor_id: assessor.id,
                        tax_id_number: id_ID_1.faker.string.numeric(16),
                        bank_book_cover: id_ID_1.faker.image.url(),
                        certificate: id_ID_1.faker.image.url(),
                        national_id: id_ID_1.faker.string.numeric(16),
                    },
                });
            }
            if (role_id === 3) {
                const assessee = yield prisma.assessee.create({
                    data: {
                        user_id: user.id,
                        full_name: fullName,
                        identity_number: id_ID_1.faker.string.numeric(16),
                        birth_date: id_ID_1.faker.date.past({ years: 25 }),
                        birth_location: id_ID_1.faker.location.city(),
                        gender: id_ID_1.faker.helpers.arrayElement([client_1.Gender.Male, client_1.Gender.Female]),
                        nationality: 'Indonesia',
                        phone_no: id_ID_1.faker.phone.number(),
                        house_phone_no: null,
                        office_phone_no: null,
                        address: id_ID_1.faker.location.streetAddress(),
                        postal_code: null,
                        educational_qualifications: id_ID_1.faker.helpers.arrayElement([
                            'SMA/SMK',
                            'D3',
                            'S1',
                            'S2',
                        ]),
                    },
                });
                yield prisma.assessee_Job.create({
                    data: {
                        assessee_id: assessee.id,
                        institution_name: id_ID_1.faker.company.name(),
                        address: id_ID_1.faker.location.streetAddress(),
                        postal_code: id_ID_1.faker.location.zipCode(),
                        position: id_ID_1.faker.person.jobTitle(),
                        phone_no: id_ID_1.faker.phone.number(),
                        job_email: id_ID_1.faker.internet.email(),
                    },
                });
            }
        }
        console.log('Created users, admins, assessors, assessees, and jobs');
        // Seed Assessee Answers
        const assessees = yield prisma.assessee.findMany();
        const questions = yield prisma.assessment_Question.findMany();
        for (const assessee of assessees) {
            for (let i = 0; i < 2; i++) {
                const question = id_ID_1.faker.helpers.arrayElement(questions);
                yield prisma.assessee_Answer.create({
                    data: {
                        question_id: question.id,
                        assessee_id: assessee.id,
                        answer: id_ID_1.faker.lorem.word(),
                    },
                });
            }
        }
        // Seed Result, Result Details, and Result Docs
        const assessors = yield prisma.assessor.findMany();
        const allAssessments = yield prisma.assessment.findMany();
        for (const assessment of allAssessments) {
            for (const assessee of assessees) {
                const result = yield prisma.result.create({
                    data: {
                        assessment_id: assessment.id,
                        assessee_id: assessee.id,
                        approve: id_ID_1.faker.datatype.boolean(),
                    },
                });
                // Result Details
                // Skip creating result details if no elements exist
                const elements = yield prisma.element.findMany();
                if (elements.length > 0) {
                    for (let i = 0; i < 2; i++) {
                        yield prisma.result_Details.create({
                            data: {
                                result_id: result.id,
                                element_id: id_ID_1.faker.helpers.arrayElement(elements).id,
                                answer: id_ID_1.faker.datatype.boolean(),
                                proof: id_ID_1.faker.image.url(),
                            },
                        });
                    }
                }
                // Result Docs
                // Only create result docs if we have assessors
                if (assessors.length > 0) {
                    yield prisma.result_Docs.create({
                        data: {
                            result_id: result.id,
                            assessor_id: id_ID_1.faker.helpers.arrayElement(assessors).id,
                            purpose: id_ID_1.faker.lorem.sentence(),
                            school_report_card: id_ID_1.faker.image.url(),
                            field_work_practice_certificate: id_ID_1.faker.image.url(),
                            student_card: id_ID_1.faker.image.url(),
                            family_card: id_ID_1.faker.image.url(),
                            id_card: id_ID_1.faker.image.url(),
                        },
                    });
                }
            }
        }
        console.log('Created answers, results, result details, and result docs');
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
