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
exports.AK03Service = void 0;
const db_1 = require("../../../config/db");
const error_1 = require("../../../common/error");
class AK03Service {
    static createAK03(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield db_1.prisma.result.findUnique({ where: { id: data.result_id } });
            if (!result)
                throw new error_1.NotFoundError('Result');
            const header = yield db_1.prisma.result_ak03_header.create({
                data: {
                    result_id: data.result_id,
                    comment: (_a = data.comment) !== null && _a !== void 0 ? _a : null,
                },
            });
            const rows = yield db_1.prisma.$transaction(data.items.map(item => {
                var _a;
                return db_1.prisma.result_ak03.create({
                    data: {
                        header_id: header.id,
                        component: item.component,
                        is_ok: item.is_ok,
                        comment: (_a = item.comment) !== null && _a !== void 0 ? _a : null,
                    },
                });
            }));
            const fullHeader = yield db_1.prisma.result_ak03_header.findUnique({
                where: { id: header.id },
                include: { rows: true },
            });
            return formatAK03Response(fullHeader);
        });
    }
    static getAK03ByResultId(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const header = yield db_1.prisma.result_ak03_header.findUnique({
                where: { result_id },
                include: { rows: true },
            });
            return header ? formatAK03Response(header) : null;
        });
    }
}
exports.AK03Service = AK03Service;
function formatAK03Response(header) {
    return {
        id: header.id,
        result_id: header.result_id,
        comment: header.comment,
        rows: header.rows.map((row) => ({
            id: row.id,
            header_id: row.header_id,
            component: row.component,
            is_ok: row.is_ok,
            comment: row.comment,
        })),
    };
}
