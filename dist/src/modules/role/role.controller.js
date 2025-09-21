"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const role_service_1 = require("./role.service");
class RoleController {
    static getRoles(req, res) {
        const roles = role_service_1.RoleService.getRoles();
        res.json({
            success: true,
            message: 'Data role berhasil diambil',
            data: roles,
        });
    }
}
exports.RoleController = RoleController;
