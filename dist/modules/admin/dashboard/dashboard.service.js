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
exports.getDashboardData = void 0;
const db_1 = require("../../../config/db");
const getDashboardData = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalSchemes = yield db_1.prisma.schemes.count();
    const totalAssessments = yield db_1.prisma.assessment.count();
    const totalAssessors = yield db_1.prisma.assessor.count();
    const totalAssesses = yield db_1.prisma.assessee.count();
    const totalAll = totalSchemes + totalAssessments + totalAssessors + totalAssesses;
    // const assessmentResults = await prisma.assessment_Result.findMany();
    return {
        totalSchemes,
        totalAssessments,
        totalAssessors,
        totalAssesses,
        totalAll,
        // assessmentResults
    };
});
exports.getDashboardData = getDashboardData;
