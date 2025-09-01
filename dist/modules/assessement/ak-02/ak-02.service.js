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
exports.AK02Service = void 0;
const error_1 = require("../../../common/error");
const db_1 = require("../../../config/db");
class AK02Service {
    static createAK02(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.prisma.result.findUnique({ where: { id: data.result_id }, include: { ak02_headers: true } });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            if (!result.ak02_headers) {
                throw new error_1.NotFoundError('Header AK02');
            }
            const ucIds = data.rows.map(row => row.uc_id);
            const existingUCs = yield db_1.prisma.uc_apl02.findMany({ where: { id: { in: ucIds } } });
            if (existingUCs.length !== ucIds.length) {
                throw new error_1.NotFoundError('Satu atau lebih Unit Kompetensi');
            }
            const headerId = result.ak02_headers.id;
            const ak02Header = yield db_1.prisma.result_ak02_header.update({
                where: { id: headerId },
                data: {
                    is_competent: data.is_competent,
                    follow_up: data.follow_up,
                    comment: data.comment,
                    rows: {
                        deleteMany: {},
                        create: data.rows.map(row => ({ uc_id: row.uc_id, evidence: row.evidence }))
                    }
                },
                include: { rows: { include: { uc: true } } }
            });
            return formatAK02Response(ak02Header);
        });
    }
    static getAK02ById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const ak02Header = yield db_1.prisma.result_ak02_header.findUnique({
                where: { id },
                include: {
                    rows: {
                        include: {
                            uc: true
                        }
                    }
                }
            });
            if (!ak02Header) {
                throw new error_1.NotFoundError('Header AK02');
            }
            return formatAK02Response(ak02Header);
        });
    }
    static getAK02ByResultId(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ak02Header = yield db_1.prisma.result_ak02_header.findFirst({
                where: { result_id: resultId },
                include: {
                    rows: {
                        include: {
                            uc: true
                        }
                    }
                }
            });
            if (!ak02Header) {
                throw new error_1.NotFoundError('AK02 header');
            }
            return formatAK02Response(ak02Header);
        });
    }
    static updateAK02(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingHeader = yield db_1.prisma.result_ak02_header.findUnique({
                where: { id }
            });
            if (!existingHeader) {
                throw new error_1.NotFoundError('Header AK02');
            }
            const updateData = {};
            if (data.is_competent !== undefined) {
                updateData.is_competent = data.is_competent;
            }
            if (data.follow_up !== undefined) {
                updateData.follow_up = data.follow_up;
            }
            if (data.comment !== undefined) {
                updateData.comment = data.comment;
            }
            if (data.rows) {
                const ucIds = data.rows.map(row => row.uc_id);
                const existingUCs = yield db_1.prisma.uc_apl02.findMany({
                    where: { id: { in: ucIds } }
                });
                if (existingUCs.length !== ucIds.length) {
                    throw new error_1.NotFoundError('One or more Unit Competencies');
                }
                updateData.rows = {
                    deleteMany: {},
                    create: data.rows.map(row => ({
                        uc_id: row.uc_id,
                        evidence: row.evidence
                    }))
                };
            }
            const ak02Header = yield db_1.prisma.result_ak02_header.update({
                where: { id },
                data: updateData,
                include: {
                    rows: {
                        include: {
                            uc: true
                        }
                    }
                }
            });
            return formatAK02Response(ak02Header);
        });
    }
    static deleteAK02(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingHeader = yield db_1.prisma.result_ak02_header.findUnique({
                where: { id }
            });
            if (!existingHeader) {
                throw new error_1.NotFoundError('AK02 header');
            }
            yield db_1.prisma.result_ak02_header.delete({
                where: { id }
            });
        });
    }
    // AK-02 Approval
    static approvedByAssessor(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield db_1.prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    ak02_headers: true,
                },
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.ak02_headers) {
                throw new error_1.NotFoundError('AK02 header');
            }
            const update = yield db_1.prisma.result_ak02_header.update({
                where: { id: existingResult.ak02_headers.id },
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
                    ak02_headers: true,
                },
            });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            if (!existingResult.ak02_headers) {
                throw new error_1.NotFoundError('AK02 header');
            }
            const update = yield db_1.prisma.result_ak02_header.update({
                where: { id: existingResult.ak02_headers.id },
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
exports.AK02Service = AK02Service;
// Helpers
function formatAK02Response(ak02Header) {
    return {
        id: ak02Header.id,
        result_id: ak02Header.result_id,
        approved_assessee: ak02Header.approved_assessee,
        approved_assessor: ak02Header.approved_assessor,
        is_competent: ak02Header.is_competent,
        follow_up: ak02Header.follow_up,
        comment: ak02Header.comment,
        rows: ak02Header.rows.map((row) => ({
            id: row.id,
            header_id: row.header_id,
            uc_id: row.uc_id,
            evidence: row.evidence,
            uc: {
                id: row.uc.id,
                unit_code: row.uc.unit_code,
                title: row.uc.title
            }
        }))
    };
}
function formatApproval(result) {
    return {
        id: result.id,
        result_id: result.result_id,
        assessee: {
            id: result.assessee.id,
            name: result.assessee.user.full_name,
            email: result.assessee.user.email,
        },
        approved_assessee: result.approved_assessee,
        approved_assessor: result.approved_assessor,
    };
}
