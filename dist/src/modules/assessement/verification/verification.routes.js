"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificationController = __importStar(require("./verification.controller"));
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken, auth_middleware_1.adminMiddleware);
// admin-only endpoints (router mounted under /api/assessments)
router.get('/verification/pending', auth_middleware_1.authenticateToken, verificationController.getPending);
router.get('/verification/pending/:scheduleDetailId', auth_middleware_1.authenticateToken, verificationController.getPending);
router.get('/verification/approved', auth_middleware_1.authenticateToken, verificationController.getApproved);
router.get('/verification/approved/:scheduleDetailId', auth_middleware_1.authenticateToken, verificationController.getApproved);
router.get('/verification/schedule-detail/:scheduleDetailId', auth_middleware_1.authenticateToken, verificationController.getByScheduleDetail);
router.post('/verification/schedule-detail/:scheduleDetailId/approve', auth_middleware_1.authenticateToken, verificationController.approveByScheduleDetail);
router.get('/verification/result/:resultId', auth_middleware_1.authenticateToken, verificationController.getDetail);
router.post('/verification/result/:resultId/approve', auth_middleware_1.authenticateToken, verificationController.approve);
exports.default = router;
