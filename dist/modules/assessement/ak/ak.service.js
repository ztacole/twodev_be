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
exports.AKService = void 0;
const error_1 = require("../../../common/error");
const db_1 = require("../../../config/db");
class AKService {
    // ========= AK01 Methods =========
    static createAK01(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if result exists
            const result = yield db_1.prisma.result.findUnique({
                where: { id: data.result_id }
            });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            // Check if AK01 header already exists for this result
            const existingHeader = yield db_1.prisma.result_ak01_header.findFirst({
                where: { result_id: data.result_id }
            });
            if (existingHeader) {
                throw new error_1.DuplicateEntryError('AK01 header', `result_id: ${data.result_id}`);
            }
            const ak01Header = yield db_1.prisma.result_ak01_header.create({
                data: {
                    result_id: data.result_id,
                    approved_assessee: data.approved_assessee,
                    approved_assessor: data.approved_assessor,
                    rows: {
                        create: data.evidences.map(evidence => ({
                            evidence
                        }))
                    }
                },
                include: {
                    rows: true
                }
            });
            return formatAK01Response(ak01Header);
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
                throw new error_1.NotFoundError('AK01 header');
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
                throw new error_1.NotFoundError('AK01 header');
            }
            return formatAK01Response(ak01Header);
        });
    }
    static updateAK01(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingHeader = yield db_1.prisma.result_ak01_header.findUnique({
                where: { id }
            });
            if (!existingHeader) {
                throw new error_1.NotFoundError('AK01 header');
            }
            const updateData = {};
            if (data.approved_assessee !== undefined) {
                updateData.approved_assessee = data.approved_assessee;
            }
            if (data.approved_assessor !== undefined) {
                updateData.approved_assessor = data.approved_assessor;
            }
            if (data.evidences) {
                updateData.rows = {
                    deleteMany: {},
                    create: data.evidences.map(evidence => ({
                        evidence
                    }))
                };
            }
            const ak01Header = yield db_1.prisma.result_ak01_header.update({
                where: { id },
                data: updateData,
                include: {
                    rows: true
                }
            });
            return formatAK01Response(ak01Header);
        });
    }
    static deleteAK01(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingHeader = yield db_1.prisma.result_ak01_header.findUnique({
                where: { id }
            });
            if (!existingHeader) {
                throw new error_1.NotFoundError('AK01 header');
            }
            yield db_1.prisma.result_ak01_header.delete({
                where: { id }
            });
        });
    }
    // ========= AK02 Methods =========
    static createAK02(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if result exists
            const result = yield db_1.prisma.result.findUnique({
                where: { id: data.result_id }
            });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            // Check if AK02 header already exists for this result
            const existingHeader = yield db_1.prisma.result_ak02_header.findFirst({
                where: { result_id: data.result_id }
            });
            if (existingHeader) {
                throw new error_1.DuplicateEntryError('AK02 header', `result_id: ${data.result_id}`);
            }
            // Validate UC IDs
            const ucIds = data.rows.map(row => row.uc_id);
            const existingUCs = yield db_1.prisma.uc_apl02.findMany({
                where: { id: { in: ucIds } }
            });
            if (existingUCs.length !== ucIds.length) {
                throw new error_1.NotFoundError('One or more Unit Competencies');
            }
            const ak02Header = yield db_1.prisma.result_ak02_header.create({
                data: {
                    result_id: data.result_id,
                    approved_assessee: data.approved_assessee,
                    approved_assessor: data.approved_assessor,
                    is_competent: data.is_competent,
                    follow_up: data.follow_up,
                    comment: data.comment,
                    rows: {
                        create: data.rows.map(row => ({
                            uc_id: row.uc_id,
                            evidence: row.evidence
                        }))
                    }
                },
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
                throw new error_1.NotFoundError('AK02 header');
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
                throw new error_1.NotFoundError('AK02 header');
            }
            const updateData = {};
            if (data.approved_assessee !== undefined) {
                updateData.approved_assessee = data.approved_assessee;
            }
            if (data.approved_assessor !== undefined) {
                updateData.approved_assessor = data.approved_assessor;
            }
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
                // Validate UC IDs
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
    // ========= Combined Methods =========
    static getAKByResultId(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [ak01Headers, ak02Headers] = yield Promise.all([
                db_1.prisma.result_ak01_header.findMany({
                    where: { result_id: resultId },
                    include: {
                        rows: true
                    }
                }),
                db_1.prisma.result_ak02_header.findMany({
                    where: { result_id: resultId },
                    include: {
                        rows: {
                            include: {
                                uc: true
                            }
                        }
                    }
                })
            ]);
            return {
                ak01: ak01Headers.map(formatAK01Response),
                ak02: ak02Headers.map(formatAK02Response)
            };
        });
    }
    static getAllAK() {
        return __awaiter(this, void 0, void 0, function* () {
            const [ak01Headers, ak02Headers] = yield Promise.all([
                db_1.prisma.result_ak01_header.findMany({
                    include: {
                        rows: true
                    }
                }),
                db_1.prisma.result_ak02_header.findMany({
                    include: {
                        rows: {
                            include: {
                                uc: true
                            }
                        }
                    }
                })
            ]);
            return {
                ak01: ak01Headers.map(formatAK01Response),
                ak02: ak02Headers.map(formatAK02Response)
            };
        });
    }
}
exports.AKService = AKService;
// ========= Helper Functions =========
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
