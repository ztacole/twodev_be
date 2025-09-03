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
const db_1 = require("../../../config/db");
const error_1 = require("../../../common/error");
class DashboardAssessorService {
    static getAssesseeData(assessorId, assessmentId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield db_1.prisma.result.findMany({
                where: { assessor_id: assessorId, assessment_id: assessmentId },
                include: {
                    assessee: {
                        include: { user: true },
                    },
                    apl02_headers: true,
                    ia01_headers: true,
                    ia02_headers: true,
                    ia03_headers: true,
                    ia05_headers: true,
                    ak01_headers: true,
                    ak02_headers: true,
                },
            });
            return results.map(result => {
                const getHeaderStatus = (type) => {
                    var _a, _b, _c, _d, _e;
                    switch (type) {
                        case "apl-02":
                            return ((_a = result.apl02_headers) === null || _a === void 0 ? void 0 : _a.approved_assessee) ? true : false;
                        case "ia-01":
                            return true;
                        case "ia-02":
                            return ((_b = result.ia02_headers) === null || _b === void 0 ? void 0 : _b.approved_assessee) ? true : false;
                        case "ia-03":
                            return true;
                        case "ia-05":
                            return ((_c = result.ia05_headers) === null || _c === void 0 ? void 0 : _c.approved_assessee) ? true : false;
                        case "ia-05-c":
                            return ((_d = result.ia05_headers) === null || _d === void 0 ? void 0 : _d.approved_assessee) ? true : false;
                        case "ak-01":
                            return ((_e = result.ak01_headers) === null || _e === void 0 ? void 0 : _e.approved_assessee) ? true : false;
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
                    assessment_id: result.assessment_id,
                    assessee_id: result.assessee_id,
                    assessee_name: result.assessee.user.full_name,
                    status: getHeaderStatus(type),
                };
            });
        });
    }
}
exports.DashboardAssessorService = DashboardAssessorService;
