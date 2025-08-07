import { Router } from 'express';
import * as schemeController from './scheme.controller';

const router = Router();

router.post('/', schemeController.createScheme);
router.get('/', schemeController.getSchemes);
router.get('/:id', schemeController.getSchemeById);
router.put('/:id', schemeController.updateScheme);
router.delete('/:id', schemeController.deleteScheme);

export default router;
