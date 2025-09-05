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
exports.APL02Service = void 0;
const error_1 = require("../../../common/error");
const drizzle_1 = require("../../../config/drizzle");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class APL02Service {
    static getUnitsAPL02(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const unitCompetencies = yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.assessmentId, existingResult.assessmentId));
            const elementsByUc = yield Promise.all(unitCompetencies.map((uc) => __awaiter(this, void 0, void 0, function* () {
                const elements = yield drizzle_1.db.select().from(schema_1.elementApl02).where((0, drizzle_orm_1.eq)(schema_1.elementApl02.ucId, uc.id));
                const results = yield drizzle_1.db.select().from(schema_1.resultApl02).where((0, drizzle_orm_1.eq)(schema_1.resultApl02.resultApl02Id, resultId));
                return { uc, elements, results };
            })));
            return Promise.all(elementsByUc.map((_a) => __awaiter(this, [_a], void 0, function* ({ uc, elements, results }) {
                const totalElements = elements.length;
                let completedElements = 0;
                for (const el of elements) {
                    const row = yield drizzle_1.db.query.resultApl02.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultApl02.resultApl02Id, resultId), (0, drizzle_orm_1.eq)(schema_1.resultApl02.elementId, el.id)) });
                    if (row)
                        completedElements += 1;
                }
                const finished = totalElements > 0 && completedElements === totalElements;
                return {
                    id: uc.id,
                    unit_code: uc.unitCode,
                    title: uc.title,
                    finished,
                    progress: totalElements > 0 ? Math.round((completedElements / totalElements) * 100) : 0,
                    total_elements: totalElements,
                    completed_elements: completedElements
                };
            })));
        });
    }
    static getElementsByUnitId(resultId, unitId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUc = yield drizzle_1.db.query.ucApl02.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ucApl02.id, unitId) });
            if (!existingUc) {
                throw new error_1.NotFoundError('Unit competency');
            }
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const elements = yield drizzle_1.db.select().from(schema_1.elementApl02).where((0, drizzle_orm_1.eq)(schema_1.elementApl02.ucId, unitId));
            return Promise.all(elements.map((element) => __awaiter(this, void 0, void 0, function* () {
                const row = yield drizzle_1.db.query.resultApl02.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultApl02.resultApl02Id, resultId), (0, drizzle_orm_1.eq)(schema_1.resultApl02.elementId, element.id)) });
                const evidences = row ? yield drizzle_1.db.select().from(schema_1.apl02Evidence).where((0, drizzle_orm_1.eq)(schema_1.apl02Evidence.resultApl02Id, row.id)) : [];
                const details = yield drizzle_1.db.select().from(schema_1.elementDetailsApl02).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsApl02.elementId, element.id));
                return {
                    id: element.id,
                    uc_id: element.ucId,
                    title: element.title,
                    details: details.map(d => ({ id: d.id, description: d.description })),
                    result: row ? {
                        id: row.id,
                        header_id: row.resultApl02Id,
                        element_id: row.elementId,
                        is_competent: row.isCompetent,
                        evidences: evidences.map(e => ({ id: e.id, evidence: e.evidence }))
                    } : null
                };
            })));
        });
    }
    static sendResult(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, Number(data.result_id)) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.resultId, Number(data.result_id)) });
            if (!header) {
                throw new error_1.NotFoundError('APL02 header');
            }
            const elements = data.elements.map(element => Number(element.element_id));
            const existingElements = elements.length ? yield drizzle_1.db.select().from(schema_1.elementApl02).where((0, drizzle_orm_1.inArray)(schema_1.elementApl02.id, elements)) : [];
            if (existingElements.length !== elements.length) {
                throw new error_1.NotFoundError('Element');
            }
            const results = yield Promise.all(data.elements.map((element) => __awaiter(this, void 0, void 0, function* () {
                // upsert row
                const row = yield drizzle_1.db.query.resultApl02.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultApl02.resultApl02Id, header.id), (0, drizzle_orm_1.eq)(schema_1.resultApl02.elementId, Number(element.element_id))) });
                if (row) {
                    yield drizzle_1.db.update(schema_1.resultApl02).set({ isCompetent: element.is_competent }).where((0, drizzle_orm_1.eq)(schema_1.resultApl02.id, row.id));
                    yield drizzle_1.db.delete(schema_1.apl02Evidence).where((0, drizzle_orm_1.eq)(schema_1.apl02Evidence.resultApl02Id, row.id));
                    for (const ev of element.evidences) {
                        yield drizzle_1.db.insert(schema_1.apl02Evidence).values({ resultApl02Id: row.id, evidence: ev.evidence });
                    }
                    const evidences = yield drizzle_1.db.select().from(schema_1.apl02Evidence).where((0, drizzle_orm_1.eq)(schema_1.apl02Evidence.resultApl02Id, row.id));
                    return Object.assign(Object.assign({}, row), { evidences });
                }
                else {
                    const [created] = yield drizzle_1.db.insert(schema_1.resultApl02).values({ resultApl02Id: header.id, elementId: Number(element.element_id), isCompetent: element.is_competent });
                    const createdRow = yield drizzle_1.db.query.resultApl02.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultApl02.resultApl02Id, header.id), (0, drizzle_orm_1.eq)(schema_1.resultApl02.elementId, Number(element.element_id))) });
                    if (createdRow) {
                        for (const ev of element.evidences) {
                            yield drizzle_1.db.insert(schema_1.apl02Evidence).values({ resultApl02Id: createdRow.id, evidence: ev.evidence });
                        }
                        const evidences = yield drizzle_1.db.select().from(schema_1.apl02Evidence).where((0, drizzle_orm_1.eq)(schema_1.apl02Evidence.resultApl02Id, createdRow.id));
                        return Object.assign(Object.assign({}, createdRow), { evidences });
                    }
                    return null;
                }
            })));
            return results;
        });
    }
    static sendResultHeader(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, data.result_id) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.resultId, data.result_id) });
            if (!header) {
                throw new error_1.NotFoundError('APL02 header');
            }
            yield drizzle_1.db.update(schema_1.resultApl02Header).set({ isContinue: data.is_continue }).where((0, drizzle_orm_1.eq)(schema_1.resultApl02Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('APL02 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            return {
                id: updated.id,
                result_id: existingResult.id,
                assessee: {
                    id: assessee === null || assessee === void 0 ? void 0 : assessee.id,
                    name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.fullName,
                    email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email
                },
                approved_assessee: updated.approvedAssessee,
                approved_assessor: updated.approvedAssessor,
                is_continue: updated.isContinue
            };
        });
    }
    static getUnitsResult(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.resultId, resultId) });
            if (!header) {
                throw new error_1.NotFoundError('Units result');
            }
            const units = yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.assessmentId, existingResult.assessmentId));
            return {
                id: header.id,
                result_id: header.resultId,
                assessee: {
                    id: existingResult.assesseeId,
                    name: (yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, (yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assesseeId) })).userId) })).fullName,
                    email: (yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, (yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assesseeId) })).userId) })).email
                },
                approved_assessee: header.approvedAssessee,
                approved_assessor: header.approvedAssessor,
                is_continue: header.isContinue,
                units: units.map(unit => ({ id: unit.id, unit_code: unit.unitCode, title: unit.title }))
            };
        });
    }
    static getElementsResult(resultId, unitId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUnit = yield drizzle_1.db.query.ucApl02.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ucApl02.id, unitId) });
            if (!existingUnit) {
                throw new error_1.NotFoundError('Unit competency');
            }
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.resultId, resultId) });
            if (!header) {
                throw new error_1.NotFoundError('Elements result');
            }
            const rows = yield drizzle_1.db.query.resultApl02.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02.resultApl02Id, header.id) });
            const results = yield Promise.all(rows.filter(r => r).map((row) => __awaiter(this, void 0, void 0, function* () {
                const element = yield drizzle_1.db.query.elementApl02.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.elementApl02.id, row.elementId) });
                const details = element ? yield drizzle_1.db.select().from(schema_1.elementDetailsApl02).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsApl02.elementId, element.id)) : [];
                const evidences = yield drizzle_1.db.select().from(schema_1.apl02Evidence).where((0, drizzle_orm_1.eq)(schema_1.apl02Evidence.resultApl02Id, row.id));
                return {
                    id: row.id,
                    element: Object.assign(Object.assign({}, element), { details }),
                    is_competent: row.isCompetent,
                    evidences,
                };
            })));
            return {
                id: header.id,
                result_id: header.resultId,
                assessee: {
                    id: existingResult.assesseeId,
                    name: (yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, (yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assesseeId) })).userId) })).fullName,
                    email: (yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, (yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assesseeId) })).userId) })).email
                },
                approved_assessee: header.approvedAssessee,
                approved_assessor: header.approvedAssessor,
                is_continue: header.isContinue,
                results,
            };
        });
    }
    static approvedByAssessor(resultId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.resultId, resultId) });
            if (!header) {
                throw new error_1.NotFoundError('APL02 header');
            }
            yield drizzle_1.db.update(schema_1.resultApl02Header).set({ approvedAssessor: true, isContinue: data.reccomendation }).where((0, drizzle_orm_1.eq)(schema_1.resultApl02Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('APL02 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            return {
                id: updated.id,
                result_id: updated.resultId,
                assessee: {
                    id: assessee === null || assessee === void 0 ? void 0 : assessee.id,
                    name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.fullName,
                    email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email
                },
                approved_assessee: updated.approvedAssessee,
                approved_assessor: updated.approvedAssessor,
                is_continue: updated.isContinue
            };
        });
    }
    static approvedByAssessee(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.resultId, resultId) });
            if (!header) {
                throw new error_1.NotFoundError('Result header');
            }
            yield drizzle_1.db.update(schema_1.resultApl02Header).set({ approvedAssessee: true }).where((0, drizzle_orm_1.eq)(schema_1.resultApl02Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('APL02 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            return {
                id: updated.id,
                result_id: updated.resultId,
                assessee: {
                    id: assessee === null || assessee === void 0 ? void 0 : assessee.id,
                    name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.fullName,
                    email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email
                },
                approved_assessee: updated.approvedAssessee,
                approved_assessor: updated.approvedAssessor,
                is_continue: updated.isContinue
            };
        });
    }
    static getResultDetails(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, result.assessmentId) });
            const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupationId) }) : null;
            const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.schemeId) }) : null;
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            const header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.resultId, resultId) });
            if (!header) {
                throw new error_1.NotFoundError('Result header');
            }
            const docs = yield drizzle_1.db.select().from(schema_1.resultDoc).where((0, drizzle_orm_1.eq)(schema_1.resultDoc.resultId, result.id));
            if (!docs.length) {
                throw new error_1.NotFoundError('Result docs');
            }
            return {
                id: result.id,
                assessment: assessment ? Object.assign(Object.assign({}, assessment), { occupation: occupation ? Object.assign(Object.assign({}, occupation), { scheme }) : null }) : null,
                assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.fullName, email: assesseeUser.email } : null,
                assessor: null,
                tuk: result.tuk,
                is_competent: result.isCompetent,
                created_at: result.createdAt,
                apl02_header: header,
                approved_admin: docs[docs.length - 1].approved
            };
        });
    }
}
exports.APL02Service = APL02Service;
