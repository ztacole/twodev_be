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
exports.IAGroupService = void 0;
const error_1 = require("../../../common/error");
const db_1 = require("../../../config/db");
class IAGroupService {
    static createIAGroup(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAssessment = yield db_1.prisma.assessment.findUnique({
                where: {
                    id: data.assessment_id
                }
            });
            if (!existingAssessment) {
                throw new error_1.NotFoundError('Assessment');
            }
            const unitCodes = data.units.map(unit => unit.unit_code);
            const existingUnits = yield db_1.prisma.uc_ia.findMany({
                where: {
                    unit_code: { in: unitCodes }
                }
            });
            if (existingUnits.length > 0) {
                throw new error_1.DuplicateEntryError('Unit competency code', existingUnits[0].unit_code);
            }
            const rawResponse = db_1.prisma.group_ia.create({
                data: {
                    assessment_id: data.assessment_id,
                    name: data.name,
                    scenario: data.scenario,
                    duration: data.duration,
                    units: {
                        create: data.units.map(unit => ({
                            unit_code: unit.unit_code,
                            title: unit.title,
                            elements: {
                                create: unit.elements.map(element => ({
                                    title: element.title,
                                    details: {
                                        create: element.details.map(detail => ({
                                            description: detail.description,
                                            benchmark: detail.benchmark
                                        }))
                                    }
                                }))
                            }
                        }))
                    },
                    tools: {
                        create: data.tools.map(tool => ({
                            name: tool.name
                        }))
                    }
                },
                include: {
                    units: {
                        include: {
                            elements: {
                                include: {
                                    details: true
                                }
                            }
                        }
                    },
                    tools: true
                }
            });
            return rawResponse;
        });
    }
}
exports.IAGroupService = IAGroupService;
