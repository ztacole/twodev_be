"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const occupation_controller_1 = require("./occupation.controller");
const upload_helper_1 = require("../../helper/upload.helper");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const string_1 = require("../../helper/string");
const approval_middleware_1 = require("../../middleware/approval.middleware");
const uploadPDF = (0, upload_helper_1.createUploader)({
    basePath: '../../public/uploads/occupations',
    folderResolver: (req) => {
        const occupationId = req.params.id;
        const schemaId = req.body.scheme_id;
        const name = (0, string_1.cleanString)(req.body.name);
        return `${occupationId}_${schemaId}_${name}` || 'unknown';
    },
    fileNameResolver: (req) => `${(0, string_1.cleanString)(req.body.name)}.pdf`,
    allowedMimeTypes: ['application/pdf'],
    maxSizeMB: 20,
    cleanBeforeUpload: true
});
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authenticateToken, auth_middleware_1.adminMiddleware, occupation_controller_1.OccupationController.createOccupation);
router.get('/', auth_middleware_1.authenticateToken, auth_middleware_1.adminMiddleware, occupation_controller_1.OccupationController.getOccupations);
router.get('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.adminMiddleware, occupation_controller_1.OccupationController.getOccupationById);
router.put('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.adminMiddleware, uploadPDF.single('pdf'), occupation_controller_1.OccupationController.updateOccupation);
router.get('/:id/pdf', occupation_controller_1.OccupationController.getUploadedPdf);
router.delete('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.adminMiddleware, (0, approval_middleware_1.requireApproval)('occupation'), occupation_controller_1.OccupationController.deleteOccupation);
router.get('/export/excel', auth_middleware_1.authenticateToken, auth_middleware_1.adminMiddleware, occupation_controller_1.OccupationController.exportOccupationsToExcel);
exports.default = router;
