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
exports.DashboardAssessorService = void 0;
const drizzle_1 = require("../../../config/drizzle");
const error_1 = require("../../../common/error");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class DashboardAssessorService {
    static getAssesseeData(assessor_id, assessment_id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield drizzle_1.db.select().from(schema_1.result).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessor_id, assessor_id), (0, drizzle_orm_1.eq)(schema_1.result.assessment_id, assessment_id)));
            return Promise.all(results.map((result) => __awaiter(this, void 0, void 0, function* () {
                const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assessee_id) });
                const user = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
                const doc = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.id, result.id) });
                const apl02 = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, result.id) });
                const ia01 = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.result_id, result.id) });
                const ia02 = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.result_id, result.id) });
                const ia03 = yield drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, result.id) });
                const ia05 = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, result.id) });
                const ia07 = yield drizzle_1.db.query.resultIa07Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa07Header.result_id, result.id) });
                const ak01 = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.result_id, result.id) });
                const ak02 = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, result.id) });
                const ak03 = yield drizzle_1.db.query.resultAk03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.result_id, result.id) });
                const ak04 = yield drizzle_1.db.query.resultAk04.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.id, result.id) });
                const ak05 = yield drizzle_1.db.query.resultAk05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk05.result_id, result.id) });
                const getHeaderStatus = (type) => __awaiter(this, void 0, void 0, function* () {
                    switch (type) {
                        case "apl-02":
                            if (!apl02)
                                throw new error_1.NotFoundError('Result APL02 Header');
                            const unitCompetencies = yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.assessment_id, result.assessment_id));
                            let finishedUcApl02Count = 0;
                            for (const uc of unitCompetencies) {
                                const elements = yield drizzle_1.db.select().from(schema_1.elementApl02).where((0, drizzle_orm_1.eq)(schema_1.elementApl02.uc_id, uc.id));
                                let completedElements = 0;
                                for (const el of elements) {
                                    const row = yield drizzle_1.db.query.resultApl02.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultApl02.result_apl02_id, apl02.id), (0, drizzle_orm_1.eq)(schema_1.resultApl02.element_id, el.id)) });
                                    if (row)
                                        completedElements += 1;
                                }
                                if (elements.length > 0 && completedElements === elements.length)
                                    finishedUcApl02Count++;
                            }
                            const finishedApl02 = finishedUcApl02Count === unitCompetencies.length;
                            return ((apl02 === null || apl02 === void 0 ? void 0 : apl02.approved_assessor) && (apl02 === null || apl02 === void 0 ? void 0 : apl02.approved_assessee)) ? 'Tuntas' : (apl02 === null || apl02 === void 0 ? void 0 : apl02.approved_assessor) ? 'Menunggu Asesi' : (finishedApl02) ? 'Butuh Persetujuan' : 'Menunggu Asesi';
                        case "ia-01":
                            return ((ia01 === null || ia01 === void 0 ? void 0 : ia01.approved_assessee) && (ia01 === null || ia01 === void 0 ? void 0 : ia01.approved_assessor)) ? 'Tuntas' : (ia01 === null || ia01 === void 0 ? void 0 : ia01.approved_assessor) ? 'Menunggu Asesi' : 'Belum Tuntas';
                        case "ia-02":
                            return ((ia02 === null || ia02 === void 0 ? void 0 : ia02.approved_assessee) && (ia02 === null || ia02 === void 0 ? void 0 : ia02.approved_assessor)) ? 'Tuntas' : (ia02 === null || ia02 === void 0 ? void 0 : ia02.approved_assessor) ? 'Menunggu Asesi' : 'Belum Tuntas';
                        case "ia-03":
                            return ((ia03 === null || ia03 === void 0 ? void 0 : ia03.approved_assessee) && (ia03 === null || ia03 === void 0 ? void 0 : ia03.approved_assessor)) ? 'Tuntas' : (ia03 === null || ia03 === void 0 ? void 0 : ia03.approved_assessor) ? 'Menunggu Asesi' : 'Belum Tuntas';
                        case "ia-05":
                            if (!ia05)
                                throw new error_1.NotFoundError('Result IA05 Header');
                            const ia05Result = yield drizzle_1.db.query.resultIa05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05.header_id, ia05.id) });
                            return ((ia05 === null || ia05 === void 0 ? void 0 : ia05.approved_assessee) && (ia05 === null || ia05 === void 0 ? void 0 : ia05.approved_assessor)) ? 'Tuntas' : (ia05 === null || ia05 === void 0 ? void 0 : ia05.approved_assessor) ? 'Menunggu Asesi' : (ia05Result) ? 'Butuh Persetujuan' : 'Menunggu Asesi';
                        case "ia-07":
                            return ((ia07 === null || ia07 === void 0 ? void 0 : ia07.approved_assessee) && (ia07 === null || ia07 === void 0 ? void 0 : ia07.approved_assessor)) ? 'Tuntas' : (ia07 === null || ia07 === void 0 ? void 0 : ia07.approved_assessor) ? 'Menunggu Asesi' : 'Belum Tuntas';
                        case "ak-01":
                            return ((ak01 === null || ak01 === void 0 ? void 0 : ak01.approved_assessee) && (ak01 === null || ak01 === void 0 ? void 0 : ak01.approved_assessor)) ? 'Tuntas' : (ak01 === null || ak01 === void 0 ? void 0 : ak01.approved_assessor) ? 'Menunggu Asesi' : 'Belum Tuntas';
                        case "ak-02":
                            return ((ak02 === null || ak02 === void 0 ? void 0 : ak02.approved_assessee) && (ak02 === null || ak02 === void 0 ? void 0 : ak02.approved_assessor)) ? 'Tuntas' : (ak02 === null || ak02 === void 0 ? void 0 : ak02.approved_assessor) ? 'Menunggu Asesi' : 'Belum Tuntas';
                        case "ak-03":
                            return (ak03 === null || ak03 === void 0 ? void 0 : ak03.comment) ? 'Tuntas' : 'Menunggu Asesi';
                        // case "ak-04":
                        //     return false;
                        case "ak-05":
                            return (ak05 === null || ak05 === void 0 ? void 0 : ak05.approved_assessor) ? 'Tuntas' : 'Belum Tuntas';
                        case "penilaian":
                            return (result.score !== -1) ? 'Tuntas' : 'Belum Tuntas';
                        default:
                            throw new error_1.ValidationError('Result Type tidak valid');
                    }
                });
                return {
                    result_id: result.id,
                    assessment_id: result.assessment_id,
                    assessee_id: result.assessee_id,
                    assessee_name: user === null || user === void 0 ? void 0 : user.full_name,
                    status: yield getHeaderStatus(type),
                };
            })));
        });
    }
}
exports.DashboardAssessorService = DashboardAssessorService;
