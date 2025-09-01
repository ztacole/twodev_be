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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APL1Service = void 0;
const error_1 = require("../../../common/error");
const db_1 = require("../../../config/db");
const TUK_VALUES = {
    SEWAKTU: 'sewaktu',
    TEMPAT_KERJA: 'tempat_kerja',
    MANDIRI: 'mandiri'
};
class APL1Service {
    static createOrUpdateAssessee(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { jobs, id, user_id, full_name } = data, assesseeData = __rest(data, ["jobs", "id", "user_id", "full_name"]);
            let gender = assesseeData.gender.trim().toLowerCase();
            if (gender === 'laki-laki') {
                gender = 'male';
            }
            else if (gender === 'perempuan') {
                gender = 'female';
            }
            if (full_name) {
                yield db_1.prisma.user.update({
                    where: { id: user_id },
                    data: { full_name }
                });
            }
            if (id) {
                const updatedAssessee = yield db_1.prisma.assessee.update({
                    where: { id },
                    data: Object.assign(Object.assign({}, assesseeData), { gender, birth_date: new Date(assesseeData.birth_date).toISOString(), jobs: jobs && jobs.length > 0 ? {
                            deleteMany: {},
                            create: jobs
                        } : undefined }),
                    include: {
                        user: true,
                        jobs: true
                    }
                });
                return Object.assign(Object.assign({}, updatedAssessee), { full_name: updatedAssessee.user.full_name, jobs: updatedAssessee.jobs });
            }
            else {
                const newAssessee = yield db_1.prisma.assessee.create({
                    data: Object.assign(Object.assign({ user_id }, assesseeData), { gender, birth_date: new Date(assesseeData.birth_date).toISOString(), jobs: jobs && jobs.length > 0 ? {
                            create: jobs
                        } : undefined }),
                    include: {
                        user: true,
                        jobs: true
                    }
                });
                return Object.assign(Object.assign({}, newAssessee), { full_name: newAssessee.user.full_name, jobs: newAssessee.jobs });
            }
        });
    }
    static getAssesseeJobsByAssesseeId(assesseeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessee = yield db_1.prisma.assessee.findUnique({
                where: { id: assesseeId },
                include: { jobs: true }
            });
            if (!assessee) {
                throw new error_1.NotFoundError('Assessee');
            }
            return assessee.jobs;
        });
    }
    static createOrUploadCertificate(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { assesseeId, assessorId, assessmentId, bodyData, files } = params;
            const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
            const fieldMapping = {
                school_report_card: 'school_report_card',
                field_work_practice_certificate: 'field_work_practice_certificate',
                student_card: 'student_card',
                family_card: 'family_card',
                id_card: 'id_card'
            };
            const fileData = {};
            for (const file of files) {
                if (fieldMapping[file.fieldname]) {
                    fileData[fieldMapping[file.fieldname]] = `${BASE_URL}/uploads/apl-01/${assesseeId}_${assessorId}_${assessmentId}/${file.filename}`;
                }
            }
            const docsData = Object.assign({ purpose: bodyData.purpose || 'APL1 Certificate Documents' }, fileData);
            let results = yield db_1.prisma.result.findMany({
                where: {
                    assessee_id: assesseeId,
                    assessor_id: assessorId,
                    assessment_id: assessmentId
                },
                take: 1,
                orderBy: { id: 'desc' },
                include: {
                    assessment: true,
                    assessee: true,
                    assessor: true,
                    apl02_headers: true,
                    ia01_headers: true,
                    ia02_headers: true,
                    ia03_headers: true,
                    ia05_headers: true,
                    ia07_headers: true,
                    ak01_headers: true,
                    ak02_headers: true
                }
            });
            let result = results[0] || null;
            if (!result) {
                const assessment = yield db_1.prisma.assessment.findUnique({
                    where: { id: assessmentId }
                });
                if (!assessment) {
                    throw new error_1.NotFoundError('Assessment');
                }
                result = yield db_1.prisma.result.create({
                    data: {
                        assessment_id: assessmentId,
                        assessee_id: assesseeId,
                        assessor_id: assessorId,
                        tuk: TUK_VALUES.SEWAKTU,
                        is_competent: false,
                        apl02_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                                is_continue: false
                            }
                        },
                        ia01_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                                is_competent: false
                            }
                        },
                        ia02_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                            }
                        },
                        ia03_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                            }
                        },
                        ia05_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                                is_achieved: false
                            }
                        },
                        ia07_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                            }
                        },
                        ak01_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                            }
                        },
                        ak02_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                                is_competent: false
                            }
                        }
                    },
                    include: {
                        assessment: true,
                        assessee: true,
                        assessor: true,
                        apl02_headers: true,
                        ia01_headers: true,
                        ia02_headers: true,
                        ia03_headers: true,
                        ia05_headers: true,
                        ia07_headers: true,
                        ak01_headers: true,
                        ak02_headers: true
                    }
                });
            }
            if (!result.apl02_headers) {
                result = yield db_1.prisma.result.update({
                    where: { id: result.id },
                    data: {
                        apl02_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                                is_continue: false
                            }
                        },
                        ia01_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                                is_competent: false
                            }
                        },
                        ia02_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                            }
                        },
                        ia03_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                            }
                        },
                        ia05_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                                is_achieved: false
                            }
                        },
                        ia07_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                            }
                        },
                        ak01_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                            }
                        },
                        ak02_headers: {
                            create: {
                                approved_assessee: false,
                                approved_assessor: false,
                                is_competent: false
                            }
                        }
                    },
                    include: {
                        assessment: true,
                        assessee: true,
                        assessor: true,
                        apl02_headers: true,
                        ia01_headers: true,
                        ia02_headers: true,
                        ia03_headers: true,
                        ia05_headers: true,
                        ia07_headers: true,
                        ak01_headers: true,
                        ak02_headers: true
                    }
                });
            }
            const existingDocs = yield db_1.prisma.result_doc.findFirst({
                where: { result_id: result.id }
            });
            if (existingDocs) {
                return yield db_1.prisma.result_doc.update({
                    where: { id: existingDocs.id },
                    data: Object.assign({}, docsData),
                    include: {
                        result: {
                            include: {
                                assessment: true,
                                assessee: true,
                                assessor: true,
                                apl02_headers: true,
                                ia01_headers: true,
                                ia02_headers: true,
                                ia03_headers: true,
                                ia05_headers: true,
                                ia07_headers: true,
                                ak01_headers: true,
                                ak02_headers: true
                            }
                        }
                    }
                });
            }
            else {
                return yield db_1.prisma.result_doc.create({
                    data: Object.assign({ result_id: result.id, approved: false }, docsData),
                    include: {
                        result: {
                            include: {
                                assessment: true,
                                assessee: true,
                                assessor: true,
                                apl02_headers: true,
                                ia01_headers: true,
                                ia02_headers: true,
                                ia03_headers: true,
                                ia05_headers: true,
                                ia07_headers: true,
                                ak01_headers: true,
                                ak02_headers: true
                            }
                        }
                    }
                });
            }
        });
    }
    static getAllResultDoc() {
        return __awaiter(this, void 0, void 0, function* () {
            const result_doc = yield db_1.prisma.result_doc.findMany({
                include: {
                    result: {
                        include: {
                            assessment: true,
                            assessee: true
                        }
                    }
                }
            });
            return result_doc;
        });
    }
    static getResultDocsByAssessmentId(assessmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result_doc = yield db_1.prisma.result_doc.findMany({
                where: { result: { assessment_id: assessmentId } },
                include: {
                    result: {
                        include: {
                            assessment: true,
                            assessee: true
                        }
                    }
                }
            });
            return result_doc;
        });
    }
    static getResultDocsByAssessorId(assessorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result_doc = yield db_1.prisma.result_doc.findMany({
                where: { result: { assessee_id: assessorId } },
                include: {
                    result: {
                        include: {
                            assessment: true,
                            assessee: true
                        }
                    }
                }
            });
            return result_doc;
        });
    }
    static getUnapprovedResultDoc() {
        return __awaiter(this, void 0, void 0, function* () {
            const result_doc = yield db_1.prisma.result_doc.findMany({
                where: { approved: false },
                include: {
                    result: {
                        include: {
                            assessment: true,
                            assessee: true
                        }
                    }
                }
            });
            return result_doc;
        });
    }
    static approveResultDoc(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result_doc = yield db_1.prisma.result_doc.update({
                where: { id: resultId },
                data: { approved: true }
            });
            return result_doc;
        });
    }
}
exports.APL1Service = APL1Service;
