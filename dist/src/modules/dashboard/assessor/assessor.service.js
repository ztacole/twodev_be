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
                const getHeaderStatus = (type) => {
                    switch (type) {
                        case "apl-01":
                            return true;
                        case "data-sertifikasi":
                            return (doc === null || doc === void 0 ? void 0 : doc.approved) ? true : false;
                        case "apl-02":
                            return ((apl02 === null || apl02 === void 0 ? void 0 : apl02.approved_assessor) && (apl02 === null || apl02 === void 0 ? void 0 : apl02.approved_assessee)) ? true : false;
                        case "ia-01":
                            return ((ia01 === null || ia01 === void 0 ? void 0 : ia01.approved_assessee) && (ia01 === null || ia01 === void 0 ? void 0 : ia01.approved_assessor)) ? true : false;
                        case "ia-02":
                            return ((ia02 === null || ia02 === void 0 ? void 0 : ia02.approved_assessee) && (ia02 === null || ia02 === void 0 ? void 0 : ia02.approved_assessor)) ? true : false;
                        case "ia-03":
                            return ((ia03 === null || ia03 === void 0 ? void 0 : ia03.approved_assessee) && (ia03 === null || ia03 === void 0 ? void 0 : ia03.approved_assessor)) ? true : false;
                        case "ia-05":
                            return ((ia05 === null || ia05 === void 0 ? void 0 : ia05.approved_assessee) && (ia05 === null || ia05 === void 0 ? void 0 : ia05.approved_assessor)) ? true : false;
                        case "ia-07":
                            return ((ia07 === null || ia07 === void 0 ? void 0 : ia07.approved_assessee) && (ia07 === null || ia07 === void 0 ? void 0 : ia07.approved_assessor)) ? true : false;
                        case "ak-01":
                            return ((ak01 === null || ak01 === void 0 ? void 0 : ak01.approved_assessee) && (ak01 === null || ak01 === void 0 ? void 0 : ak01.approved_assessor)) ? true : false;
                        case "ak-02":
                            return ((ak02 === null || ak02 === void 0 ? void 0 : ak02.approved_assessee) && (ak02 === null || ak02 === void 0 ? void 0 : ak02.approved_assessor)) ? true : false;
                        case "ak-03":
                            return false;
                        case "ak-04":
                            return false;
                        case "ak-05":
                            return (ak05 === null || ak05 === void 0 ? void 0 : ak05.approved_assessor) ? true : false;
                        default:
                            throw new error_1.ValidationError('Result Type tidak valid');
                    }
                };
                return {
                    result_id: result.id,
                    assessment_id: result.assessment_id,
                    assessee_id: result.assessee_id,
                    assessee_name: user === null || user === void 0 ? void 0 : user.full_name,
                    status: getHeaderStatus(type),
                };
            })));
        });
    }
}
exports.DashboardAssessorService = DashboardAssessorService;
