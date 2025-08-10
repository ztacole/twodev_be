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
exports.exportOccupationsToExcel = exports.deleteOccupation = exports.updateOccupation = exports.createOccupation = exports.getOccupationById = exports.getOccupations = void 0;
const db_1 = require("../../config/db");
const XLSX = __importStar(require("xlsx"));
const getOccupations = () => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.occupation.findMany({
        include: {
            scheme: true
        }
    });
});
exports.getOccupations = getOccupations;
const getOccupationById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.occupation.findUnique({
        where: { id },
        include: {
            scheme: true
        }
    });
});
exports.getOccupationById = getOccupationById;
const createOccupation = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.occupation.create({ data });
});
exports.createOccupation = createOccupation;
const updateOccupation = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.occupation.update({ where: { id }, data });
});
exports.updateOccupation = updateOccupation;
const deleteOccupation = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.occupation.delete({ where: { id } });
});
exports.deleteOccupation = deleteOccupation;
const exportOccupationsToExcel = () => __awaiter(void 0, void 0, void 0, function* () {
    const occupations = yield db_1.prisma.occupation.findMany({
        include: {
            scheme: true
        }
    });
    const formattedData = occupations.map(occupation => ({
        'Nama Jurusan': occupation.scheme.code,
        'Okupasi': occupation.name
    }));
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Occupations');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
});
exports.exportOccupationsToExcel = exportOccupationsToExcel;
