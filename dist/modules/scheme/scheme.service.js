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
exports.exportSchemesToExcel = exports.deleteScheme = exports.updateScheme = exports.createScheme = exports.getSchemeById = exports.getSchemes = void 0;
const db_1 = require("../../config/db");
const XLSX = __importStar(require("xlsx"));
const getSchemes = () => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.schemes.findMany();
});
exports.getSchemes = getSchemes;
const getSchemeById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.schemes.findUnique({ where: { id } });
});
exports.getSchemeById = getSchemeById;
const createScheme = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.schemes.create({ data });
});
exports.createScheme = createScheme;
const updateScheme = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.schemes.update({ where: { id }, data });
});
exports.updateScheme = updateScheme;
const deleteScheme = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.schemes.delete({ where: { id } });
});
exports.deleteScheme = deleteScheme;
const exportSchemesToExcel = () => __awaiter(void 0, void 0, void 0, function* () {
    const schemes = yield db_1.prisma.schemes.findMany();
    const formattedData = schemes.map(scheme => ({
        'Nama Jurusan': scheme.code,
        'Deskripsi': scheme.name
    }));
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Schemes');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
});
exports.exportSchemesToExcel = exportSchemesToExcel;
