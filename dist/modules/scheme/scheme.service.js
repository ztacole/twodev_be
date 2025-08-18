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
const db_1 = require("../../config/db");
const exceljs_1 = __importDefault(require("exceljs"));
const error_1 = require("../../common/error");
class SchemeService {
}
exports.SchemeService = SchemeService;
_a = SchemeService;
SchemeService.getSchemes = () => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.scheme.findMany();
});
SchemeService.getSchemeById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const scheme = yield db_1.prisma.scheme.findUnique({ where: { id } });
    if (!scheme) {
        throw new error_1.NotFoundError('Scheme');
    }
    return scheme;
});
SchemeService.createScheme = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const existingSchemeCode = yield db_1.prisma.scheme.findFirst({ where: { code: data.code } });
    if (existingSchemeCode) {
        throw new error_1.DuplicateEntryError('Scheme code', data.code);
    }
    const existingSchemeName = yield db_1.prisma.scheme.findFirst({ where: { name: data.name } });
    if (existingSchemeName) {
        throw new error_1.DuplicateEntryError('Scheme name', data.name);
    }
    return db_1.prisma.scheme.create({ data });
});
SchemeService.updateScheme = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const existingScheme = yield db_1.prisma.scheme.findUnique({ where: { id } });
    if (!existingScheme) {
        throw new error_1.NotFoundError('Scheme');
    }
    const existingSchemeCode = yield db_1.prisma.scheme.findFirst({ where: { code: data.code } });
    if (existingSchemeCode) {
        throw new error_1.DuplicateEntryError('Scheme code', data.code);
    }
    const existingSchemeName = yield db_1.prisma.scheme.findFirst({ where: { name: data.name } });
    if (existingSchemeName) {
        throw new error_1.DuplicateEntryError('Scheme name', data.name);
    }
    const scheme = db_1.prisma.scheme.update({ where: { id }, data });
    if (!scheme) {
        throw new error_1.NotFoundError('Scheme');
    }
    return scheme;
});
SchemeService.deleteScheme = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingScheme = yield db_1.prisma.scheme.findUnique({ where: { id } });
    if (!existingScheme) {
        throw new error_1.NotFoundError('Scheme');
    }
    return yield db_1.prisma.scheme.delete({ where: { id: id } });
});
SchemeService.exportSchemesToExcel = () => __awaiter(void 0, void 0, void 0, function* () {
    const schemes = yield db_1.prisma.scheme.findMany();
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
