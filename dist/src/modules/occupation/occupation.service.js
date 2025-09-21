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
const drizzle_1 = require("../../config/drizzle");
const exceljs_1 = __importDefault(require("exceljs"));
const error_1 = require("../../common/error");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const string_1 = require("../../helper/string");
class OccupationService {
    static getOccupations(schemeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const occupations = yield drizzle_1.db.select({
                id: schema_1.occupation.id,
                scheme_id: schema_1.occupation.scheme_id,
                name: schema_1.occupation.name,
                created_at: schema_1.occupation.created_at,
                updated_at: schema_1.occupation.updated_at,
                scheme: schema_1.scheme
            }).from(schema_1.occupation)
                .leftJoin(schema_1.scheme, (0, drizzle_orm_1.eq)(schema_1.occupation.scheme_id, schema_1.scheme.id))
                .where(schemeId ? (0, drizzle_orm_1.eq)(schema_1.occupation.scheme_id, schemeId) : undefined)
                .orderBy((0, drizzle_orm_1.asc)(schema_1.scheme.name));
            for (const occ of occupations) {
                let status = false;
                const cleanName = (0, string_1.cleanString)(occ.name);
                const filePath = path_1.default.join(__dirname, `../../../public/uploads/occupations/${occ.id}_${occ.scheme_id}_${cleanName}/${cleanName}.pdf`);
                if (fs_1.default.existsSync(filePath))
                    status = true;
                occ.uploaded_file = status;
            }
            return occupations;
        });
    }
    static getOccupationById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [occupation] = yield drizzle_1.db.select({
                id: schema_1.occupation.id,
                scheme_id: schema_1.occupation.scheme_id,
                name: schema_1.occupation.name,
                created_at: schema_1.occupation.created_at,
                updated_at: schema_1.occupation.updated_at,
                scheme: schema_1.scheme
            }).from(schema_1.occupation)
                .leftJoin(schema_1.scheme, (0, drizzle_orm_1.eq)(schema_1.occupation.scheme_id, schema_1.scheme.id))
                .where((0, drizzle_orm_1.eq)(schema_1.occupation.id, id));
            if (!occupation) {
                throw new error_1.NotFoundError('Occupation');
            }
            let status = false;
            const cleanName = (0, string_1.cleanString)(occupation.name);
            const filePath = path_1.default.join(__dirname, `../../../public/uploads/occupations/${occupation.id}_${occupation.scheme_id}_${cleanName}/${cleanName}.pdf`);
            if (fs_1.default.existsSync(filePath))
                status = true;
            occupation.uploaded_file = status;
            return occupation;
        });
    }
    static createOccupation(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, data.scheme_id) });
            if (!scheme) {
                throw new error_1.NotFoundError('Scheme');
            }
            const existingOccupation = yield drizzle_1.db.query.occupation.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.occupation.scheme_id, data.scheme_id), (0, drizzle_orm_1.eq)(schema_1.occupation.name, data.name)),
            });
            if (existingOccupation) {
                throw new error_1.DuplicateEntryError('Occupation name', data.name);
            }
            yield drizzle_1.db.insert(schema_1.occupation).values({ scheme_id: data.scheme_id, name: data.name });
            return yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.occupation.scheme_id, data.scheme_id), (0, drizzle_orm_1.eq)(schema_1.occupation.name, data.name)) });
        });
    }
    static updateOccupation(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingOccupation = yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, id) });
                if (!existingOccupation) {
                    throw new error_1.NotFoundError('Occupation');
                }
                const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, data.scheme_id) });
                if (!scheme) {
                    throw new error_1.NotFoundError('Scheme');
                }
                const existingOccupationName = yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.name, data.name) });
                if (existingOccupationName && existingOccupationName.id !== id) {
                    throw new error_1.DuplicateEntryError('Occupation name', data.name);
                }
                yield drizzle_1.db.update(schema_1.occupation)
                    .set({ scheme_id: data.scheme_id, name: data.name })
                    .where((0, drizzle_orm_1.eq)(schema_1.occupation.id, id));
                const occupation = yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, id) });
                if (!occupation) {
                    throw new error_1.NotFoundError('Occupation');
                }
                return occupation;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    static deleteOccupation(id, schemeId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = path_1.default.join(__dirname, `../../../public/uploads/occupations/${id}_${schemeId}_${name}`);
            if (fs_1.default.existsSync(filePath)) {
                const stat = fs_1.default.statSync(filePath);
                if (stat.isDirectory()) {
                    fs_1.default.rmSync(filePath, { recursive: true, force: true });
                }
                else if (stat.isFile()) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            const existingOccupation = yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, id) });
            if (!existingOccupation) {
                throw new error_1.NotFoundError('Occupation');
            }
            yield drizzle_1.db.delete(schema_1.occupation).where((0, drizzle_orm_1.eq)(schema_1.occupation.id, id));
        });
    }
    static exportOccupationsToExcel() {
        return __awaiter(this, void 0, void 0, function* () {
            const occupations = yield drizzle_1.db.select().from(schema_1.occupation);
            if (!occupations.length) {
                throw new error_1.NotFoundError('Occupations');
            }
            const scheme_ids = [...new Set(occupations.map(o => o.scheme_id))];
            const schemes = scheme_ids.length ? yield drizzle_1.db.select().from(schema_1.scheme).where((0, drizzle_orm_1.eq)(schema_1.scheme.id, scheme_ids[0])) : [];
            const schemeById = new Map(schemes.map(s => [s.id, s]));
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
                    ((_a = schemeById.get(occ.scheme_id)) === null || _a === void 0 ? void 0 : _a.code) || '',
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
    static getUploadedPdf(id, schemaId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = path_1.default.join(__dirname, `../../../public/uploads/occupations/${id}_${schemaId}_${name}/${name}.pdf`);
            if (!fs_1.default.existsSync(filePath)) {
                throw new error_1.AppError(`File PDF tidak ditemukan di server`, 404);
            }
            const fileBuffer = yield fs_1.default.promises.readFile(filePath);
            return fileBuffer;
        });
    }
}
exports.OccupationService = OccupationService;
