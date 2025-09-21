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
exports.RoleService = void 0;
const schema_1 = require("../../../drizzle/schema");
const drizzle_1 = require("../../config/drizzle");
class RoleService {
    static getRoles() {
        return __awaiter(this, void 0, void 0, function* () {
            const roles = yield drizzle_1.db.select().from(schema_1.role);
            return roles;
        });
    }
}
exports.RoleService = RoleService;
