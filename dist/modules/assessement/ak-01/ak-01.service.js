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
exports.AK01Service = void 0;
const error_1 = require("../../../common/error");
const db_1 = require("../../../config/db");
class AK01Service {
    static createAK01(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { result_id, evidences } = data;
            const result = yield db_1.prisma.result.findUnique({
                where: { id: result_id },
                include: { ak01_headers: true },
            });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            const header = result.ak01_headers;
            if (!header) {
                throw new error_1.NotFoundError('Header AK01');
            }
            const updatedHeader = yield db_1.prisma.result_ak01_header.update({
                where: { id: header.id },
                data: {
                    rows: {
                        deleteMany: {},
                        create: evidences.map(evidence => ({ evidence })),
                    },
                },
                include: { rows: true },
            });
            return formatAK01Response(updatedHeader);
        });
    }
    static getDataForAK01(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    ak01_headers: {
                        include: {
                            rows: true
                        }
                    },
                    assessment: {
                        include: {
                            occupation: {
                                include: {
                                    scheme: true
                                }
                            },
                            assessment_schedules: {
                                include: {
                                    schedule_details: true
                                }
                            }
                        }
                    },
                    assessee: {
                        include: {
                            user: true
                        }
                    },
                    assessor: {
                        include: {
                            user: true
                        }
                    }
                },
            });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            if (!result.ak01_headers) {
                throw new error_1.NotFoundError('Header AK01');
            }
            return {
                id: result.id,
                assessment: result.assessment,
                assessee: {
                    id: result.assessee.id,
                    name: result.assessee.user.full_name,
                    email: result.assessee.user.email
                },
                assessor: {
                    id: result.assessor.id,
                    name: result.assessor.user.full_name,
                    email: result.assessor.user.email,
                    no_reg_met: result.assessor.no_reg_met
                },
                tuk: result.tuk,
                is_competent: result.is_competent,
                created_at: result.created_at,
                locations: result.assessment.assessment_schedules.flatMap(schedule => schedule.schedule_details.filter(detail => detail.assessor_id === result.assessor_id).map(detail => detail.location)),
                ak01_header: result.ak01_headers
            };
        });
    }
    static getAK01ById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const ak01Header = yield db_1.prisma.result_ak01_header.findUnique({
                where: { id },
                include: {
                    rows: true
                }
            });
            if (!ak01Header) {
                throw new error_1.NotFoundError('Header AK01');
            }
            return formatAK01Response(ak01Header);
        });
    }
    static getAK01ByResultId(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ak01Header = yield db_1.prisma.result_ak01_header.findFirst({
                where: { result_id: resultId },
                include: {
                    rows: true
                }
            });
            if (!ak01Header) {
                throw new error_1.NotFoundError('Header AK01');
            }
            return formatAK01Response(ak01Header);
        });
    }
    static updateAK01(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingHeader = yield db_1.prisma.result_ak01_header.findUnique({ where: { id } });
            if (!existingHeader) {
                throw new error_1.NotFoundError('Header AK01');
            }
            const updateData = {};
            if (data.evidences) {
                updateData.rows = {
                    deleteMany: {},
                    create: data.evidences.map(evidence => ({ evidence })),
                };
            }
            const ak01Header = yield db_1.prisma.result_ak01_header.update({
                where: { id },
                data: updateData,
                include: { rows: true },
            });
            return formatAK01Response(ak01Header);
        });
    }
    static deleteAK01(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingHeader = yield db_1.prisma.result_ak01_header.findUnique({ where: { id } });
            if (!existingHeader) {
                throw new error_1.NotFoundError('Header AK01');
            }
            yield db_1.prisma.result_ak01_header.delete({ where: { id } });
        });
    }
    // AK-O1 Approval
    static approvedByAssessor(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    ak01_headers: true,
                },
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.ak01_headers) {
                throw new error_1.NotFoundError('AK01 header');
            }
            const update = yield db_1.prisma.result_ak01_header.update({
                where: { id: existingResult.ak01_headers.id },
                data: { approved_assessor: true },
                include: {
                    result: {
                        include: {
                            assessee: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                    },
                },
            });
            return formatApproval(update);
        });
    }
    static approvedByAssessee(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    ak01_headers: true,
                },
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.ak01_headers) {
                throw new error_1.NotFoundError('AK01 header');
            }
            const update = yield db_1.prisma.result_ak01_header.update({
                where: { id: existingResult.ak01_headers.id },
                data: { approved_assessee: true },
                include: {
                    result: {
                        include: {
                            assessee: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                    },
                },
            });
            return formatApproval(update);
        });
    }
}
exports.AK01Service = AK01Service;
// Helpers
function formatAK01Response(ak01Header) {
    return {
        id: ak01Header.id,
        result_id: ak01Header.result_id,
        approved_assessee: ak01Header.approved_assessee,
        approved_assessor: ak01Header.approved_assessor,
        rows: ak01Header.rows.map((row) => ({
            id: row.id,
            header_id: row.header_id,
            evidence: row.evidence
        }))
    };
}
function formatApproval(result) {
    return {
        id: result.id,
        result_id: result.result_id,
        assessee: {
            id: result.result.assessee.id,
            name: result.result.assessee.user.full_name,
            email: result.result.assessee.user.email,
        },
        approved_assessee: result.approved_assessee,
        approved_assessor: result.approved_assessor,
    };
}
