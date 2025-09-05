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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemeService = void 0;
const drizzle_1 = require("../../config/drizzle");
const exceljs_1 = __importDefault(require("exceljs"));
const error_1 = require("../../common/error");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class SchemeService {
}
exports.SchemeService = SchemeService;
_a = SchemeService;
SchemeService.getSchemes = () => __awaiter(void 0, void 0, void 0, function* () {
    return drizzle_1.db.select().from(schema_1.scheme);
});
SchemeService.getSchemeById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, id) });
    if (!scheme) {
        throw new error_1.NotFoundError('Scheme');
    }
    return scheme;
});
SchemeService.createScheme = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const existingSchemeCode = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.code, data.code) });
    if (existingSchemeCode) {
        throw new error_1.DuplicateEntryError('Scheme code', data.code);
    }
    yield drizzle_1.db.insert(schema_1.scheme).values({ code: data.code, name: data.name });
    return yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.code, data.code) });
});
SchemeService.updateScheme = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const existingScheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, id) });
    if (!existingScheme) {
        throw new error_1.NotFoundError('Scheme');
    }
    const existingSchemeCode = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.code, data.code) });
    if (existingSchemeCode && existingSchemeCode.id !== id) {
        throw new error_1.DuplicateEntryError('Scheme code', data.code);
    }
    yield drizzle_1.db.update(schema_1.scheme).set({ code: data.code, name: data.name }).where((0, drizzle_orm_1.eq)(schema_1.scheme.id, id));
    const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, id) });
    return scheme;
});
SchemeService.deleteScheme = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingScheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, id) });
    if (!existingScheme) {
        throw new error_1.NotFoundError('Scheme');
    }
    yield drizzle_1.db.delete(schema_1.scheme).where((0, drizzle_orm_1.eq)(schema_1.scheme.id, id));
});
SchemeService.exportSchemesToExcel = () => __awaiter(void 0, void 0, void 0, function* () {
    const schemes = yield drizzle_1.db.select().from(schema_1.scheme);
    if (!schemes.length) {
        throw new error_1.NotFoundError('Schemes');
    }
    const workbook = new exceljs_1.default.Workbook();
    const worksheet = workbook.addWorksheet('Schemes');
    const headerRow = worksheet.addRow(['Nama Jurusan', 'Deskripsi']);
    headerRow.eachCell(cell => {
        cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE77D35' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    schemes.forEach(scheme => {
        const row = worksheet.addRow([scheme.code, scheme.name]);
        row.eachCell(cell => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });
    worksheet.columns = [
        { width: 25 }, // Nama Jurusan
        { width: 50 } // Deskripsi
    ];
    return yield workbook.xlsx.writeBuffer();
});
