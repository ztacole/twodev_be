import { Router } from 'express';
import { OccupationController } from './occupation.controller';
import { createUploader } from '../../helper/upload.helper';
import { adminMiddleware, adminOrAssessorMiddleware, authenticateToken } from '../../middleware/auth.middleware';
import { cleanString } from '../../helper/string';

const uploadPDF = createUploader({
  basePath: '../../public/uploads/occupations',
  folderResolver: (req) => {
    const occupationId = req.params.id;
    const schemaId = req.body.scheme_id;
    const name = cleanString(req.body.name);
    return `${occupationId}_${schemaId}_${name}` || 'unknown';
  },
  fileNameResolver: (req) => `${cleanString(req.body.name)}.pdf`,
  allowedMimeTypes: ['application/pdf'],
  maxSizeMB: 20,
  cleanBeforeUpload: true
})

const router = Router();

router.post('/', authenticateToken, adminMiddleware, OccupationController.createOccupation);
router.get('/', authenticateToken, adminMiddleware, OccupationController.getOccupations);
router.get('/:id', authenticateToken, adminMiddleware, OccupationController.getOccupationById);
router.put('/:id', authenticateToken, adminMiddleware, uploadPDF.single('pdf'), OccupationController.updateOccupation);
router.get('/:id/pdf', OccupationController.getUploadedPdf);
router.delete('/:id', authenticateToken, adminMiddleware, OccupationController.deleteOccupation);
router.get('/export/excel', authenticateToken, adminMiddleware, OccupationController.exportOccupationsToExcel);

export default router;