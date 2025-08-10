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
const db_1 = require("../../../config/db");
class APL1Service {
    createOrUpdateAssesse(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { jobs, id, user_id } = data, assesseeData = __rest(data, ["jobs", "id", "user_id"]);
            if (!id && !user_id) {
                return db_1.prisma.assessee.create({
                    data: Object.assign(Object.assign({ user_id }, assesseeData), { jobs: jobs && jobs.length > 0 ? {
                            create: jobs
                        } : undefined }),
                    include: { jobs: true }
                });
            }
            return db_1.prisma.assessee.upsert({
                where: id ? { id } : { user_id },
                update: Object.assign(Object.assign({}, assesseeData), { jobs: jobs && jobs.length > 0 ? {
                        deleteMany: {},
                        createMany: { data: jobs }
                    } : undefined }),
                create: Object.assign(Object.assign({ user_id }, assesseeData), { jobs: jobs && jobs.length > 0 ? {
                        create: jobs
                    } : undefined }),
                include: { jobs: true }
            });
        });
    }
    getAssesseJobsByAssesseeId(assesseeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.assessee_Job.findMany({
                where: { assessee_id: assesseeId }
            });
        });
    }
    createAssesseCertificate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { assessee_id, assessor_id } = data, docsData = __rest(data, ["assessee_id", "assessor_id"]);
            const existingDocs = yield db_1.prisma.result_Docs.findFirst({
                where: {
                    assessor_id: assessor_id,
                    result: {
                        assessee_id: assessee_id
                    }
                }
            });
            if (existingDocs) {
                return db_1.prisma.result_Docs.update({
                    where: { id: existingDocs.id },
                    data: Object.assign({}, docsData)
                });
            }
            else {
                return db_1.prisma.result_Docs.create({
                    data: Object.assign({ result: {
                            create: {
                                assessee_id: assessee_id,
                                approve: false,
                                assessment_id: ((_a = (yield db_1.prisma.assessment.findFirst())) === null || _a === void 0 ? void 0 : _a.id) || 1
                            }
                        }, assessor_id: assessor_id, purpose: 'APL1 Certificate Documents' }, docsData)
                });
            }
        });
    }
    uploadCertificateDocs(assessorId, assesseeId, files) {
        return __awaiter(this, void 0, void 0, function* () {
            const uploadPath = `apl1/${assessorId}`;
            const fileData = {};
            if (files) {
                const fieldMapping = {
                    school_report_card: 'school_report_card',
                    field_work_practice_certificate: 'field_work_practice_certificate',
                    student_card: 'student_card',
                    family_card: 'family_card',
                    id_card: 'id_card'
                };
                for (const file of files) {
                    if (fieldMapping[file.fieldname]) {
                        fileData[fieldMapping[file.fieldname]] = `${uploadPath}/${file.filename}`;
                    }
                }
            }
            const existingDocs = yield db_1.prisma.result_Docs.findFirst({
                where: {
                    assessor_id: assessorId,
                    result: {
                        assessee_id: assesseeId
                    }
                }
            });
            if (existingDocs) {
                return db_1.prisma.result_Docs.update({
                    where: { id: existingDocs.id },
                    data: Object.assign({}, fileData)
                });
            }
            else {
                let result = yield db_1.prisma.result.findFirst({
                    where: {
                        assessee_id: assesseeId
                    }
                });
                if (!result) {
                    const assessment = yield db_1.prisma.assessment.findFirst();
                    if (assessment) {
                        result = yield db_1.prisma.result.create({
                            data: {
                                assessment_id: assessment.id,
                                assessee_id: assesseeId,
                                approve: false
                            }
                        });
                    }
                    else {
                        return db_1.prisma.result_Docs.create({
                            data: Object.assign({ result: {
                                    create: {
                                        assessee_id: assesseeId,
                                        approve: false,
                                        assessment_id: 1 // Default to ID 1 if no assessments exist
                                    }
                                }, assessor_id: assessorId, purpose: 'APL1 Certificate Documents' }, fileData)
                        });
                    }
                }
                return db_1.prisma.result_Docs.create({
                    data: Object.assign({ result_id: result.id, assessor_id: assessorId, purpose: 'APL1 Certificate Documents' }, fileData)
                });
            }
        });
    }
}
exports.APL1Service = APL1Service;
