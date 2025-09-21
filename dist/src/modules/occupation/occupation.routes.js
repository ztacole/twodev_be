"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const occupation_controller_1 = require("./occupation.controller");
const upload_helper_1 = require("../../helper/upload.helper");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const string_1 = require("../../helper/string");
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
router.use(auth_middleware_1.authenticateToken, auth_middleware_1.adminMiddleware);
router.post('/', occupation_controller_1.OccupationController.createOccupation);
router.get('/', occupation_controller_1.OccupationController.getOccupations);
router.get('/:id', occupation_controller_1.OccupationController.getOccupationById);
router.put('/:id', uploadPDF.single('pdf'), occupation_controller_1.OccupationController.updateOccupation);
router.get('/:id/pdf', occupation_controller_1.OccupationController.getUploadedPdf);
router.delete('/:id', occupation_controller_1.OccupationController.deleteOccupation);
router.get('/export/excel', occupation_controller_1.OccupationController.exportOccupationsToExcel);
exports.default = router;
