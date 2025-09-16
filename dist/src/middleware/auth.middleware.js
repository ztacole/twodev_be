"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUpload = exports.assessorOrAssesseeMiddleware = exports.adminOrAssesseeMiddleware = exports.adminOrAssessorMiddleware = exports.assessorMiddleware = exports.assesseeMiddleware = exports.adminMiddleware = exports.authenticateToken = void 0;
const auth_service_1 = require("../modules/auth/auth.service");
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token akses diperlukan'
            });
        }
        const decoded = yield auth_service_1.AuthService.verifyToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Token tidak valid atau sudah kedaluwarsa'
        });
    }
});
exports.authenticateToken = authenticateToken;
const adminMiddleware = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== 1) {
        return res.status(403).json({ message: 'Akses hanya untuk admin' });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
const assesseeMiddleware = (req, res, next) => {
    var _a;
    return (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) === 3 ? next() : res.status(403).json({ message: 'Akses hanya untuk assessee' }));
};
exports.assesseeMiddleware = assesseeMiddleware;
const assessorMiddleware = (req, res, next) => {
    var _a;
    return (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) === 2 ? next() : res.status(403).json({ message: 'Akses hanya untuk assessor' }));
};
exports.assessorMiddleware = assessorMiddleware;
const adminOrAssessorMiddleware = (req, res, next) => {
    var _a, _b;
    return (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) === 1 || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role_id) === 2 ? next() : res.status(403).json({ message: 'Akses hanya untuk admin atau assessor' }));
};
exports.adminOrAssessorMiddleware = adminOrAssessorMiddleware;
const adminOrAssesseeMiddleware = (req, res, next) => {
    var _a, _b;
    return (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) === 1 || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role_id) === 3 ? next() : res.status(403).json({ message: 'Akses hanya untuk admin atau assessee' }));
};
exports.adminOrAssesseeMiddleware = adminOrAssesseeMiddleware;
const assessorOrAssesseeMiddleware = (req, res, next) => {
    var _a, _b;
    return (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) === 2 || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role_id) === 3 ? next() : res.status(403).json({ message: 'Akses hanya untuk assessor atau assessee' }));
};
exports.assessorOrAssesseeMiddleware = assessorOrAssesseeMiddleware;
const authUpload = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token akses diperlukan'
            });
        }
        const decoded = yield auth_service_1.AuthService.verifyToken(token);
        req.user = decoded;
        yield (0, exports.adminOrAssesseeMiddleware)(req, res, next);
    }
    catch (error) {
        return res.status(403).json({ message: error.message });
    }
});
exports.authUpload = authUpload;
