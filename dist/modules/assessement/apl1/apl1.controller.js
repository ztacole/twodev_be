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
exports.Apl1Controller = void 0;
const apl1_service_1 = require("./apl1.service");
class Apl1Controller {
    constructor() {
        this.apl1Service = new apl1_service_1.APL1Service();
    }
    createAssesseAPL1(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assesse = yield this.apl1Service.createOrUpdateAssesse(req.body);
                res.status(201).json({
                    success: true,
                    message: 'Asesmen berhasil dibuat',
                    data: {
                        id: assesse.id,
                        user_id: assesse.user_id,
                        full_name: assesse.full_name,
                        identity_number: assesse.identity_number,
                        birth_date: assesse.birth_date,
                        birth_location: assesse.birth_location,
                        gender: assesse.gender,
                        nationality: assesse.nationality,
                        phone_no: assesse.phone_no,
                        house_phone_no: assesse.house_phone_no,
                        office_phone_no: assesse.office_phone_no,
                        address: assesse.address,
                        postal_code: assesse.postal_code,
                        educational_qualifications: assesse.educational_qualifications,
                        jobs: req.body.jobs.map((job) => ({
                            institution_name: job.institution_name,
                            address: job.address,
                            postal_code: job.postal_code,
                            position: job.position,
                            phone_no: job.phone_no,
                            job_email: job.job_email,
                        })),
                    },
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    createAssesseCertificate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const certificate = yield this.apl1Service.createAssesseCertificate(req.body);
                res.status(201).json({
                    success: true,
                    message: 'Data sertifikat berhasil dibuat',
                    data: {
                        id: certificate.id,
                        result_id: certificate.result_id,
                        assessor_id: certificate.assessor_id,
                        purpose: certificate.purpose,
                        school_report_card: certificate.school_report_card,
                        field_work_practice_certificate: certificate.field_work_practice_certificate,
                        student_card: certificate.student_card,
                        family_card: certificate.family_card,
                        id_card: certificate.id_card,
                    },
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    uploadCertificateDocs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessorId = parseInt(req.params.assessorId);
                const assesseeId = parseInt(req.params.assesseeId);
                if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
                    return res.status(400).json({
                        success: false,
                        message: 'No files were uploaded'
                    });
                }
                const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
                const result = yield this.apl1Service.uploadCertificateDocs(assessorId, assesseeId, files);
                res.status(200).json({
                    success: true,
                    message: 'Certificate documents uploaded successfully',
                    data: result
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
}
exports.Apl1Controller = Apl1Controller;
