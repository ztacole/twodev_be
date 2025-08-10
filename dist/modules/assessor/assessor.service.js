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
exports.deleteAssessor = exports.updateAssessor = exports.getAssessorById = exports.getAssessors = exports.createAssessor = void 0;
const db_1 = require("../../config/db");
const createAssessor = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.assessor.create({ data });
});
exports.createAssessor = createAssessor;
const getAssessors = () => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.assessor.findMany();
});
exports.getAssessors = getAssessors;
const getAssessorById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.assessor.findUnique({ where: { id } });
});
exports.getAssessorById = getAssessorById;
const updateAssessor = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.assessor.update({ where: { id }, data });
});
exports.updateAssessor = updateAssessor;
const deleteAssessor = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.prisma.assessor.delete({ where: { id } });
});
exports.deleteAssessor = deleteAssessor;
