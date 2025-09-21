"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_controller_1 = require("./role.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken, auth_middleware_1.adminMiddleware);
router.get('/', role_controller_1.RoleController.getRoles);
exports.default = router;
