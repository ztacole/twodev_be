import { Router } from 'express';
import { SchemeController } from './scheme.controller';

const router = Router();

router.post('/', SchemeController.createScheme);
router.get('/', SchemeController.getSchemes);
router.get('/:id', SchemeController.getSchemeById);
router.put('/:id', SchemeController.updateScheme);
router.delete('/:id', SchemeController.deleteScheme);
router.get('/export/excel', SchemeController.exportSchemesToExcel);

export default router;
