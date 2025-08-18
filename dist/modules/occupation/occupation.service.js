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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OccupationService = void 0;
const db_1 = require("../../config/db");
const exceljs_1 = __importDefault(require("exceljs"));
const error_1 = require("../../common/error");
class OccupationService {
    static getOccupations() {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.occupation.findMany({
                include: {
                    scheme: true
                }
            });
        });
    }
    static getOccupationById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const occupation = yield db_1.prisma.occupation.findUnique({
                where: { id },
                include: {
                    scheme: true
                }
            });
            if (!occupation) {
                throw new error_1.NotFoundError('Occupation');
            }
            return occupation;
        });
    }
    static createOccupation(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const scheme = yield db_1.prisma.scheme.findFirst({
                where: {
                    id: data.scheme_id
                }
            });
            if (!scheme) {
                throw new error_1.NotFoundError('Scheme');
            }
            const existingOccupation = yield db_1.prisma.occupation.findFirst({
                where: {
                    name: data.name
                }
            });
            if (existingOccupation) {
                throw new error_1.DuplicateEntryError('Occupation name', data.name);
            }
            return db_1.prisma.occupation.create({ data });
        });
    }
    static updateOccupation(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingOccupation = yield db_1.prisma.occupation.findUnique({ where: { id } });
            if (!existingOccupation) {
                throw new error_1.NotFoundError('Occupation');
            }
            const scheme = yield db_1.prisma.scheme.findFirst({
                where: {
                    id: data.scheme_id
                }
            });
            if (!scheme) {
                throw new error_1.NotFoundError('Scheme');
            }
            const existingOccupationName = yield db_1.prisma.occupation.findFirst({
                where: {
                    name: data.name
                }
            });
            if (existingOccupationName) {
                throw new error_1.DuplicateEntryError('Occupation name', data.name);
            }
            const occupation = yield db_1.prisma.occupation.update({ where: { id }, data });
            if (!occupation) {
                throw new error_1.NotFoundError('Occupation');
            }
            return occupation;
        });
    }
    static deleteOccupation(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingOccupation = yield db_1.prisma.occupation.findUnique({ where: { id } });
            if (!existingOccupation) {
                throw new error_1.NotFoundError('Occupation');
            }
            return yield db_1.prisma.occupation.delete({ where: { id } });
        });
    }
    static exportOccupationsToExcel() {
        return __awaiter(this, void 0, void 0, function* () {
            const occupations = yield db_1.prisma.occupation.findMany({
                include: { scheme: true }
            });
            if (!occupations.length) {
                throw new error_1.NotFoundError('Occupations');
            }
            const workbook = new exceljs_1.default.Workbook();
            const worksheet = workbook.addWorksheet('Occupations');
            const headerRow = worksheet.addRow(['Nama Jurusan', 'Okupasi']);
            headerRow.eachCell((cell) => {
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
            occupations.forEach(occ => {
                var _a;
                const row = worksheet.addRow([
                    ((_a = occ.scheme) === null || _a === void 0 ? void 0 : _a.code) || '',
                    occ.name
                ]);
                row.eachCell((cell) => {
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
                { width: 40 } // Okupasi
            ];
            return yield workbook.xlsx.writeBuffer();
        });
    }
}
exports.OccupationService = OccupationService;
