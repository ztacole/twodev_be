"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// import { upload as uploadCertificate } from "./apl-01/upload-config";
// import { uploadIA02 } from "./ia-02/upload-conifg";
const upload_helper_1 = require("../../helper/upload.helper");
const apl_02_controller_1 = require("./apl-02/apl-02.controller");
const apl_01_controller_1 = require("./apl-01/apl-01.controller");
const ia_01_controller_1 = require("./ia-01/ia-01.controller");
const ia_02_controller_1 = require("./ia-02/ia-02.controller");
const ia_03_controller_1 = require("./ia-03/ia-03.controller");
const ia_05_controller_1 = require("./ia-05/ia-05.controller");
const assessment_controller_1 = require("./assessment.controller");
const ak_01_controller_1 = require("./ak-01/ak-01.controller");
const ak_02_controller_1 = require("./ak-02/ak-02.controller");
const ak_03_controller_1 = require("./ak-03/ak-03.controller");
const ak_04_controller_1 = require("./ak-04/ak-04.controller");
const ak_05_controller_1 = require("./ak-05/ak-05.controller");
const auth_middleware_2 = require("../../middleware/auth.middleware");
// import { uploadIA02 } from "./ia-02/upload-conifg";
const approval_middleware_1 = require("../../middleware/approval.middleware");
const uploadAPL01 = (0, upload_helper_1.createUploader)({
    basePath: '../../public/uploads/apl-01',
    folderResolver: (req) => {
        var _a, _b, _c, _d, _e, _f;
        const assesseeId = ((_a = req.params) === null || _a === void 0 ? void 0 : _a.assessee_id) || ((_b = req.body) === null || _b === void 0 ? void 0 : _b.assessee_id) || 'unknown';
        const assessorId = ((_c = req.params) === null || _c === void 0 ? void 0 : _c.assessor_id) || ((_d = req.body) === null || _d === void 0 ? void 0 : _d.assessor_id) || 'unknown';
        const assessmentId = ((_e = req.params) === null || _e === void 0 ? void 0 : _e.assessment_id) || ((_f = req.body) === null || _f === void 0 ? void 0 : _f.assessment_id) || 'unknown';
        return `${assesseeId}_${assessorId}_${assessmentId}`;
    },
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
    maxSizeMB: 10,
    cleanBeforeUpload: true
});
const uploadIA02 = (0, upload_helper_1.createUploader)({
    basePath: '../../public/uploads/ia-02',
    folderResolver: (req) => {
        const { assessmentId } = req.params;
        return `assessment-${assessmentId}` || 'unknown';
    },
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
    maxSizeMB: 30,
    cleanBeforeUpload: true
});
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_middleware_2.authenticateToken);
router.post('/create', auth_middleware_2.authenticateToken, auth_middleware_1.adminMiddleware, assessment_controller_1.AssessmentController.createAssessment);
router.get('/', assessment_controller_1.AssessmentController.getAssessments);
router.put('/:id', auth_middleware_2.authenticateToken, auth_middleware_1.adminMiddleware, assessment_controller_1.AssessmentController.updateAssessment);
router.get('/:id', assessment_controller_1.AssessmentController.getAssessmentById);
router.delete('/:id', auth_middleware_2.authenticateToken, auth_middleware_1.adminMiddleware, (0, approval_middleware_1.requireApproval)('assessment'), assessment_controller_1.AssessmentController.deleteAssessment);
router.get('/result/:assessmentId/:assessorId/:assesseeId', assessment_controller_1.AssessmentController.getAssessmentResultDetails);
router.get('/results/status/admin', auth_middleware_2.authenticateToken, auth_middleware_1.adminMiddleware, assessment_controller_1.AssessmentController.getAssessmentResultsForAdmin);
router.get('/results/status/admin/assessees/:assessmentId/:assessorId', auth_middleware_2.authenticateToken, auth_middleware_1.adminMiddleware, assessment_controller_1.AssessmentController.getAssesseesByAssessmentAndAssessor);
router.get('/navigation/assessee/:assessmentId/:assessorId/:assesseeId', auth_middleware_2.authenticateToken, auth_middleware_1.assesseeMiddleware, assessment_controller_1.AssessmentController.getNavigationAssessee);
router.get('/navigation/assessor/:assessmentId', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, assessment_controller_1.AssessmentController.getNavigationAssessor);
router.get('/navigation/admin/:resultId', auth_middleware_2.authenticateToken, auth_middleware_1.adminMiddleware, assessment_controller_1.AssessmentController.getNavigationAdmin);
router.get('/assessment-recapt/:scheduleDetailId', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, assessment_controller_1.AssessmentController.getAssessmentRecapt);
router.get('/assessment-recapt/admin/:scheduleDetailId/:assessorId', auth_middleware_2.authenticateToken, auth_middleware_1.adminMiddleware, assessment_controller_1.AssessmentController.getAssessmentRecaptForAdmin);
router.get('/recap/:scheduleDetailId/pdf', auth_middleware_2.authenticateToken, auth_middleware_1.adminOrAssessorMiddleware, assessment_controller_1.AssessmentController.generateRecaptPdf);
router.get('/ukk-evaluation/:scheduleDetailId/pdf', auth_middleware_2.authenticateToken, auth_middleware_1.adminOrAssessorMiddleware, assessment_controller_1.AssessmentController.generateUkkEvaluationPdf);
router.post('/apl-01/create-self-data', auth_middleware_2.authenticateToken, auth_middleware_1.assesseeMiddleware, apl_01_controller_1.APL1Controller.createAssesseeAPL1);
router.post('/apl-01/create-certificate-docs', auth_middleware_2.authenticateToken, auth_middleware_1.assesseeMiddleware, uploadAPL01.any(), apl_01_controller_1.APL1Controller.createOrUploadCertificateDocs);
router.get('/uploads/apl-01/:folder/:filename', auth_middleware_1.authUpload, (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path_1.default.join(__dirname, '../public/uploads/apl-01', folder, filename);
    if (!fs_1.default.existsSync(filePath))
        return res.status(404).json({ message: 'File not found' });
    res.sendFile(filePath);
});
router.get('/apl-01/results', apl_01_controller_1.APL1Controller.getAllResult);
router.get('/apl-01/results/assessor/:assessorId', apl_01_controller_1.APL1Controller.getResultDocsByAssessorId);
router.get('/apl-01/results/unapproved', apl_01_controller_1.APL1Controller.getUnapprovedResult);
router.put('/apl-01/results/:resultId/approve', apl_01_controller_1.APL1Controller.approveResult);
router.get('/apl-01/results/:assessmentId', apl_01_controller_1.APL1Controller.getResultDocsByAssessmentId);
;
router.get('/apl-01/result/:resultId', apl_01_controller_1.APL1Controller.getResultDetails);
router.get('/apl-01/result/docs/:resultId', apl_01_controller_1.APL1Controller.getResultDocsByResultId);
router.get('/apl-02/units/:resultId', apl_02_controller_1.APL02Controller.getUnitsAPL02);
router.get('/apl-02/units/:resultId/elements/:unitId', apl_02_controller_1.APL02Controller.getElementsByUnitId);
router.post('/apl-02/result/send', auth_middleware_2.authenticateToken, auth_middleware_1.assesseeMiddleware, apl_02_controller_1.APL02Controller.sendResult);
router.post('/apl-02/result/send-header', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, apl_02_controller_1.APL02Controller.sendResultHeader);
router.get('/apl-02/result/units/:resultId', apl_02_controller_1.APL02Controller.getUnitsResult);
router.get('/apl-02/result/units/:resultId/elements/:unitId', apl_02_controller_1.APL02Controller.getElementsResult);
router.put('/apl-02/result/assessor/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, apl_02_controller_1.APL02Controller.approvedByAssessor);
router.put('/apl-02/result/assessee/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assesseeMiddleware, apl_02_controller_1.APL02Controller.approvedByAssessee);
router.get('/apl-02/result/:resultId', apl_02_controller_1.APL02Controller.getResultDetails);
router.get('/ia-01/units/:resultId', ia_01_controller_1.IA01Controller.getIA01Groups);
router.get('/ia-01/units/:resultId/elements/:unitId', ia_01_controller_1.IA01Controller.getElementsByUnitId);
router.post('/ia-01/result/send', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, ia_01_controller_1.IA01Controller.sendResult);
router.post('/ia-01/result/send-header', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, ia_01_controller_1.IA01Controller.sendResultHeader);
router.put('/ia-01/result/assessor/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, ia_01_controller_1.IA01Controller.approvedByAssessor);
router.put('/ia-01/result/assessee/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assesseeMiddleware, ia_01_controller_1.IA01Controller.approvedByAssessee);
router.get('/ia-01/result/:resultId', ia_01_controller_1.IA01Controller.getResultDetails);
router.get('/ia-01/result/incomplete-criteria/:resultId', ia_01_controller_1.IA01Controller.getIncompleteCriterias);
router.get('/ia-02/units/:assessmentId', ia_02_controller_1.IA02Controller.getIA02Groups);
router.put('/ia-02/result/assessor/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, ia_02_controller_1.IA02Controller.approvedByAssessor);
router.put('/ia-02/result/assessee/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assesseeMiddleware, ia_02_controller_1.IA02Controller.approvedByAssessee);
router.get('/ia-02/result/:resultId', ia_02_controller_1.IA02Controller.getResultDetails);
router.post('/ia-02/upload-pdf/:assessmentId', auth_middleware_2.authenticateToken, auth_middleware_1.adminMiddleware, uploadIA02.single('pdf'), ia_02_controller_1.IA02Controller.uploadPdf);
router.get('/ia-02/pdf/:assessmentId', ia_02_controller_1.IA02Controller.getPdf);
router.get('/ia-03/units/:resultId', ia_03_controller_1.IA03Controller.getIA03Groups);
router.post('/ia-03/result/send', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, ia_03_controller_1.IA03Controller.sendResult);
router.put('/ia-03/result/assessor/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, ia_03_controller_1.IA03Controller.approvedByAssessor);
router.put('/ia-03/result/assessee/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assesseeMiddleware, ia_03_controller_1.IA03Controller.approvedByAssessee);
router.get('/ia-03/result/:resultId', ia_03_controller_1.IA03Controller.getResultDetails);
router.get('/ia-05/questions/:assessmentId', ia_05_controller_1.IA05Controller.getQuestions);
router.get('/ia-05/result/answers/keys/:assessmentId', ia_05_controller_1.IA05Controller.getAnswerKeys);
router.get('/ia-05/result/answers/:resultId', ia_05_controller_1.IA05Controller.getAssesseeAnswers);
router.post('/ia-05/result/assessee/send', auth_middleware_2.authenticateToken, auth_middleware_1.assesseeMiddleware, ia_05_controller_1.IA05Controller.sendAssesseeResult);
router.post('/ia-05/result/assessor/send', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, ia_05_controller_1.IA05Controller.sendAssessorResult);
router.put('/ia-05/result/assessor/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, ia_05_controller_1.IA05Controller.approvedByAssessor);
router.put('/ia-05/result/assessee/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assesseeMiddleware, ia_05_controller_1.IA05Controller.approvedByAssessee);
router.get('/ia-05/result/:resultId', ia_05_controller_1.IA05Controller.getResultDetails);
router.post('/ak-01', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, ak_01_controller_1.AK01Controller.createAK01);
router.get('/ak-01/:id', ak_01_controller_1.AK01Controller.getAK01ById);
router.put('/ak-01/:id', ak_01_controller_1.AK01Controller.updateAK01);
router.delete('/ak-01/:id', ak_01_controller_1.AK01Controller.deleteAK01);
router.get('/ak-01/data/:resultId', ak_01_controller_1.AK01Controller.getDataForAK01);
router.put('/ak-01/result/assessor/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, ak_01_controller_1.AK01Controller.approvedByAssessor);
router.put('/ak-01/result/assessee/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assesseeMiddleware, ak_01_controller_1.AK01Controller.approvedByAssessee);
router.get('/ak-01/result/:resultId', ak_01_controller_1.AK01Controller.getAK01ByResultId);
router.post('/ak-02/result/send', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, ak_02_controller_1.AK02Controller.sendResult);
router.get('/ak-02/units/:assessmentId', ak_02_controller_1.AK02Controller.getUnits);
router.get('/ak-02/result/:resultId', ak_02_controller_1.AK02Controller.getAK02ByResultId);
router.put('/ak-02/result/assessor/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, ak_02_controller_1.AK02Controller.approvedByAssessor);
router.put('/ak-02/result/assessee/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assesseeMiddleware, ak_02_controller_1.AK02Controller.approvedByAssessee);
router.post('/ak-03', ak_03_controller_1.AK03Controller.createAK03);
router.post('/ak-03/answer', auth_middleware_2.authenticateToken, auth_middleware_1.assesseeMiddleware, ak_03_controller_1.AK03Controller.createAnswerAK03);
router.get('/ak-03/:result_id', ak_03_controller_1.AK03Controller.getAK03ByResultId);
router.post('/ak-04', auth_middleware_2.authenticateToken, auth_middleware_1.assesseeMiddleware, ak_04_controller_1.AK04Controller.createAK04);
router.get('/ak-04/:resultId', ak_04_controller_1.AK04Controller.getAK04ByResultId);
router.put('/ak-04/result/assessee/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assesseeMiddleware, ak_04_controller_1.AK04Controller.approvedByAssessee);
router.post('/ak-05', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, ak_05_controller_1.AK05Controller.createAK05);
router.get('/ak-05/:result_id', ak_05_controller_1.AK05Controller.getAK05ByResultId);
router.put('/ak-05/result/assessor/:resultId/approve', auth_middleware_2.authenticateToken, auth_middleware_1.assessorMiddleware, ak_05_controller_1.AK05Controller.approvedByAssessor);
exports.default = router;
