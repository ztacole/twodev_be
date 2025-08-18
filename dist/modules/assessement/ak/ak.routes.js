"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ak_controller_1 = require("./ak.controller");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// ========= AK01 Routes =========
/**
 * @swagger
 * /api/assessment/ak/ak01:
 *   post:
 *     summary: Create new AK01
 *     tags: [AK01]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - result_id
 *               - approved_assessee
 *               - approved_assessor
 *               - evidences
 *             properties:
 *               result_id:
 *                 type: integer
 *               approved_assessee:
 *                 type: boolean
 *               approved_assessor:
 *                 type: boolean
 *               evidences:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: AK01 created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: AK01 already exists for this result
 */
router.post('/ak01', ak_controller_1.AKController.createAK01);
/**
 * @swagger
 * /api/assessment/ak/ak01/{id}:
 *   get:
 *     summary: Get AK01 by ID
 *     tags: [AK01]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: AK01 retrieved successfully
 *       404:
 *         description: AK01 not found
 */
router.get('/ak01/:id', ak_controller_1.AKController.getAK01ById);
/**
 * @swagger
 * /api/assessment/ak/ak01/result/{resultId}:
 *   get:
 *     summary: Get AK01 by Result ID
 *     tags: [AK01]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: AK01 retrieved successfully
 *       404:
 *         description: AK01 not found
 */
router.get('/ak01/result/:resultId', ak_controller_1.AKController.getAK01ByResultId);
/**
 * @swagger
 * /api/assessment/ak/ak01/{id}:
 *   put:
 *     summary: Update AK01
 *     tags: [AK01]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approved_assessee:
 *                 type: boolean
 *               approved_assessor:
 *                 type: boolean
 *               evidences:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: AK01 updated successfully
 *       404:
 *         description: AK01 not found
 */
router.put('/ak01/:id', ak_controller_1.AKController.updateAK01);
/**
 * @swagger
 * /api/assessment/ak/ak01/{id}:
 *   delete:
 *     summary: Delete AK01
 *     tags: [AK01]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: AK01 deleted successfully
 *       404:
 *         description: AK01 not found
 */
router.delete('/ak01/:id', ak_controller_1.AKController.deleteAK01);
// ========= AK02 Routes =========
/**
 * @swagger
 * /api/assessment/ak/ak02:
 *   post:
 *     summary: Create new AK02
 *     tags: [AK02]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - result_id
 *               - approved_assessee
 *               - approved_assessor
 *               - is_competent
 *               - rows
 *             properties:
 *               result_id:
 *                 type: integer
 *               approved_assessee:
 *                 type: boolean
 *               approved_assessor:
 *                 type: boolean
 *               is_competent:
 *                 type: boolean
 *               follow_up:
 *                 type: string
 *               comment:
 *                 type: string
 *               rows:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     uc_id:
 *                       type: integer
 *                     evidence:
 *                       type: string
 *     responses:
 *       201:
 *         description: AK02 created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: AK02 already exists for this result
 */
router.post('/ak02', ak_controller_1.AKController.createAK02);
/**
 * @swagger
 * /api/assessment/ak/ak02/{id}:
 *   get:
 *     summary: Get AK02 by ID
 *     tags: [AK02]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: AK02 retrieved successfully
 *       404:
 *         description: AK02 not found
 */
router.get('/ak02/:id', ak_controller_1.AKController.getAK02ById);
/**
 * @swagger
 * /api/assessment/ak/ak02/result/{resultId}:
 *   get:
 *     summary: Get AK02 by Result ID
 *     tags: [AK02]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: AK02 retrieved successfully
 *       404:
 *         description: AK02 not found
 */
router.get('/ak02/result/:resultId', ak_controller_1.AKController.getAK02ByResultId);
/**
 * @swagger
 * /api/assessment/ak/ak02/{id}:
 *   put:
 *     summary: Update AK02
 *     tags: [AK02]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approved_assessee:
 *                 type: boolean
 *               approved_assessor:
 *                 type: boolean
 *               is_competent:
 *                 type: boolean
 *               follow_up:
 *                 type: string
 *               comment:
 *                 type: string
 *               rows:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     uc_id:
 *                       type: integer
 *                     evidence:
 *                       type: string
 *     responses:
 *       200:
 *         description: AK02 updated successfully
 *       404:
 *         description: AK02 not found
 */
router.put('/ak02/:id', ak_controller_1.AKController.updateAK02);
/**
 * @swagger
 * /api/assessment/ak/ak02/{id}:
 *   delete:
 *     summary: Delete AK02
 *     tags: [AK02]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: AK02 deleted successfully
 *       404:
 *         description: AK02 not found
 */
router.delete('/ak02/:id', ak_controller_1.AKController.deleteAK02);
// ========= Combined Routes =========
/**
 * @swagger
 * /api/assessment/ak/result/{resultId}:
 *   get:
 *     summary: Get all AK data by Result ID
 *     tags: [AK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: AK data retrieved successfully
 *       404:
 *         description: No AK data found
 */
router.get('/result/:resultId', ak_controller_1.AKController.getAKByResultId);
/**
 * @swagger
 * /api/assessment/ak:
 *   get:
 *     summary: Get all AK data
 *     tags: [AK]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All AK data retrieved successfully
 */
router.get('/', ak_controller_1.AKController.getAllAK);
exports.default = router;
