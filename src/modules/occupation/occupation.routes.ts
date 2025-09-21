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

router.use(authenticateToken, adminMiddleware);

router.post('/', OccupationController.createOccupation);
router.get('/', OccupationController.getOccupations);
router.get('/:id', OccupationController.getOccupationById);
router.put('/:id', uploadPDF.single('pdf'), OccupationController.updateOccupation);
router.get('/:id/pdf', OccupationController.getUploadedPdf);
router.delete('/:id', OccupationController.deleteOccupation);
router.get('/export/excel', OccupationController.exportOccupationsToExcel);

export default router;