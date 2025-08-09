import { Router } from 'express';
import * as schemeController from './scheme.controller';

const router = Router();

router.post('/', schemeController.createScheme);
router.get('/', schemeController.getSchemes);
router.get('/:id', schemeController.getSchemeById);
router.put('/:id', schemeController.updateScheme);
router.delete('/:id', schemeController.deleteScheme);
router.get('/export/excel', schemeController.exportSchemesToExcel);

export default router;
