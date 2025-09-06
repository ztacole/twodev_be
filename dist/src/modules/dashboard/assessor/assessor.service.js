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
    static getAssesseeData(assessorId, assessmentId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield drizzle_1.db.select().from(schema_1.result).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessorId, assessorId), (0, drizzle_orm_1.eq)(schema_1.result.assessmentId, assessmentId)));
            return Promise.all(results.map((result) => __awaiter(this, void 0, void 0, function* () {
                const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assesseeId) });
                const user = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
                const apl02 = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.resultId, result.id) });
                const ia02 = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.resultId, result.id) });
                const ia05 = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.resultId, result.id) });
                const ak01 = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.resultId, result.id) });
                const getHeaderStatus = (type) => {
                    switch (type) {
                        case "apl-02":
                            return (apl02 === null || apl02 === void 0 ? void 0 : apl02.approvedAssessee) ? true : false;
                        case "ia-01":
                            return true;
                        case "ia-02":
                            return (ia02 === null || ia02 === void 0 ? void 0 : ia02.approvedAssessee) ? true : false;
                        case "ia-03":
                            return true;
                        case "ia-05":
                            return (ia05 === null || ia05 === void 0 ? void 0 : ia05.approvedAssessee) ? true : false;
                        case "ia-05-c":
                            return (ia05 === null || ia05 === void 0 ? void 0 : ia05.approvedAssessee) ? true : false;
                        case "ak-01":
                            return (ak01 === null || ak01 === void 0 ? void 0 : ak01.approvedAssessee) ? true : false;
                        case "ak-02":
                            return true;
                        case "ak-03":
                            return true;
                        case "ak-04":
                            return true;
                        case "ak-05":
                            return true;
                        default:
                            throw new error_1.ValidationError('Result Type tidak valid');
                    }
                };
                return {
                    result_id: result.id,
                    assessment_id: result.assessmentId,
                    assessee_id: result.assesseeId,
                    assessee_name: user === null || user === void 0 ? void 0 : user.fullName,
                    status: getHeaderStatus(type),
                };
            })));
        });
    }
}
exports.DashboardAssessorService = DashboardAssessorService;
