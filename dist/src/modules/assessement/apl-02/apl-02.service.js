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
    static getUnitsWithoutResult(assessment_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAssessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, assessment_id) });
            if (!existingAssessment) {
                throw new error_1.NotFoundError('Assessment');
            }
            const unitCompetencies = yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.assessment_id, assessment_id));
            return unitCompetencies;
        });
    }
    static getUnitsAPL02(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const apl02Header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, result_id) });
            if (!apl02Header) {
                throw new error_1.NotFoundError('APL02 header');
            }
            const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, existingResult.schedule_id) });
            if (!schedule) {
                throw new error_1.NotFoundError('Assessment Schedule');
            }
            const unitCompetencies = yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.assessment_id, schedule.assessment_id));
            const elementsByUc = yield Promise.all(unitCompetencies.map((uc) => __awaiter(this, void 0, void 0, function* () {
                const elements = yield drizzle_1.db.select().from(schema_1.elementApl02).where((0, drizzle_orm_1.eq)(schema_1.elementApl02.uc_id, uc.id));
                const results = yield drizzle_1.db.select().from(schema_1.resultApl02).where((0, drizzle_orm_1.eq)(schema_1.resultApl02.result_apl02_id, apl02Header.id));
                return { uc, elements, results };
            })));
            return Promise.all(elementsByUc.map((_a) => __awaiter(this, [_a], void 0, function* ({ uc, elements, results }) {
                const totalElements = elements.length;
                let completedElements = 0;
                for (const el of elements) {
                    const row = yield drizzle_1.db.query.resultApl02.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultApl02.result_apl02_id, apl02Header.id), (0, drizzle_orm_1.eq)(schema_1.resultApl02.element_id, el.id)) });
                    if (row)
                        completedElements += 1;
                }
                const finished = totalElements > 0 && completedElements === totalElements;
                return {
                    id: uc.id,
                    unit_code: uc.unit_code,
                    title: uc.title,
                    finished,
                    progress: totalElements > 0 ? Math.round((completedElements / totalElements) * 100) : 0,
                    total_elements: totalElements,
                    completed_elements: completedElements
                };
            })));
        });
    }
    static getElementsByUnitId(result_id, unitId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUc = yield drizzle_1.db.query.ucApl02.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ucApl02.id, unitId) });
            if (!existingUc) {
                throw new error_1.NotFoundError('Unit competency');
            }
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, result_id) });
            if (!header) {
                throw new error_1.NotFoundError('APL02 header');
            }
            const elements = yield drizzle_1.db.select().from(schema_1.elementApl02).where((0, drizzle_orm_1.eq)(schema_1.elementApl02.uc_id, unitId));
            return Promise.all(elements.map((element) => __awaiter(this, void 0, void 0, function* () {
                const row = yield drizzle_1.db.query.resultApl02.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultApl02.result_apl02_id, header.id), (0, drizzle_orm_1.eq)(schema_1.resultApl02.element_id, element.id)) });
                const evidences = row ? yield drizzle_1.db.select().from(schema_1.apl02Evidence).where((0, drizzle_orm_1.eq)(schema_1.apl02Evidence.result_apl02_id, row.id)) : [];
                const details = yield drizzle_1.db.select().from(schema_1.elementDetailsApl02).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsApl02.element_id, element.id));
                return {
                    id: element.id,
                    uc_id: element.uc_id,
                    title: element.title,
                    details: details.map(d => ({ id: d.id, description: d.description })),
                    result: row ? {
                        id: row.id,
                        header_id: row.result_apl02_id,
                        element_id: row.element_id,
                        is_competent: row.is_competent,
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
            const header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, Number(data.result_id)) });
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
                const row = yield drizzle_1.db.query.resultApl02.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultApl02.result_apl02_id, header.id), (0, drizzle_orm_1.eq)(schema_1.resultApl02.element_id, Number(element.element_id))) });
                if (row) {
                    yield drizzle_1.db.update(schema_1.resultApl02).set({ is_competent: element.is_competent }).where((0, drizzle_orm_1.eq)(schema_1.resultApl02.id, row.id));
                    yield drizzle_1.db.delete(schema_1.apl02Evidence).where((0, drizzle_orm_1.eq)(schema_1.apl02Evidence.result_apl02_id, row.id));
                    for (const ev of element.evidences) {
                        yield drizzle_1.db.insert(schema_1.apl02Evidence).values({ result_apl02_id: row.id, evidence: ev.evidence });
                    }
                    const evidences = yield drizzle_1.db.select().from(schema_1.apl02Evidence).where((0, drizzle_orm_1.eq)(schema_1.apl02Evidence.result_apl02_id, row.id));
                    return Object.assign(Object.assign({}, row), { evidences });
                }
                else {
                    const [created] = yield drizzle_1.db.insert(schema_1.resultApl02).values({ result_apl02_id: header.id, element_id: Number(element.element_id), is_competent: element.is_competent });
                    const createdRow = yield drizzle_1.db.query.resultApl02.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultApl02.result_apl02_id, header.id), (0, drizzle_orm_1.eq)(schema_1.resultApl02.element_id, Number(element.element_id))) });
                    if (createdRow) {
                        for (const ev of element.evidences) {
                            yield drizzle_1.db.insert(schema_1.apl02Evidence).values({ result_apl02_id: createdRow.id, evidence: ev.evidence });
                        }
                        const evidences = yield drizzle_1.db.select().from(schema_1.apl02Evidence).where((0, drizzle_orm_1.eq)(schema_1.apl02Evidence.result_apl02_id, createdRow.id));
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
            const header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, data.result_id) });
            if (!header) {
                throw new error_1.NotFoundError('APL02 header');
            }
            yield drizzle_1.db.update(schema_1.resultApl02Header).set({ is_continue: data.is_continue }).where((0, drizzle_orm_1.eq)(schema_1.resultApl02Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('APL02 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assessee_id) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
            return {
                id: updated.id,
                result_id: existingResult.id,
                assessee: {
                    id: assessee === null || assessee === void 0 ? void 0 : assessee.id,
                    name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.full_name,
                    email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email
                },
                approved_assessee: updated.approved_assessee,
                approved_assessor: updated.approved_assessor,
                is_continue: updated.is_continue
            };
        });
    }
    static getUnitsResult(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, result_id) });
            if (!header) {
                throw new error_1.NotFoundError('Units result');
            }
            const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, existingResult.schedule_id) });
            if (!schedule) {
                throw new error_1.NotFoundError('Schedule');
            }
            const units = yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.assessment_id, schedule.assessment_id));
            return {
                id: header.id,
                result_id: header.result_id,
                assessee: {
                    id: existingResult.assessee_id,
                    name: (yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, (yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assessee_id) })).user_id) })).full_name,
                    email: (yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, (yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assessee_id) })).user_id) })).email
                },
                approved_assessee: header.approved_assessee,
                approved_assessor: header.approved_assessor,
                is_continue: header.is_continue,
                units: units.map(unit => ({ id: unit.id, unit_code: unit.unit_code, title: unit.title }))
            };
        });
    }
    static getElementsResult(result_id, unitId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUnit = yield drizzle_1.db.query.ucApl02.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ucApl02.id, unitId) });
            if (!existingUnit) {
                throw new error_1.NotFoundError('Unit competency');
            }
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, result_id) });
            if (!header) {
                throw new error_1.NotFoundError('Elements result');
            }
            const rows = yield drizzle_1.db.query.resultApl02.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02.result_apl02_id, header.id) });
            const results = yield Promise.all(rows.filter(r => r).map((row) => __awaiter(this, void 0, void 0, function* () {
                const element = yield drizzle_1.db.query.elementApl02.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.elementApl02.id, row.element_id) });
                const details = element ? yield drizzle_1.db.select().from(schema_1.elementDetailsApl02).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsApl02.element_id, element.id)) : [];
                const evidences = yield drizzle_1.db.select().from(schema_1.apl02Evidence).where((0, drizzle_orm_1.eq)(schema_1.apl02Evidence.result_apl02_id, row.id));
                return {
                    id: row.id,
                    element: Object.assign(Object.assign({}, element), { details }),
                    is_competent: row.is_competent,
                    evidences,
                };
            })));
            return {
                id: header.id,
                result_id: header.result_id,
                assessee: {
                    id: existingResult.assessee_id,
                    name: (yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, (yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assessee_id) })).user_id) })).full_name,
                    email: (yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, (yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assessee_id) })).user_id) })).email
                },
                approved_assessee: header.approved_assessee,
                approved_assessor: header.approved_assessor,
                is_continue: header.is_continue,
                results,
            };
        });
    }
    static approvedByAssessor(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, result_id) });
            if (!header) {
                throw new error_1.NotFoundError('APL02 header');
            }
            yield drizzle_1.db.update(schema_1.resultApl02Header).set({ approved_assessor: true }).where((0, drizzle_orm_1.eq)(schema_1.resultApl02Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('APL02 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assessee_id) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
            return {
                id: updated.id,
                result_id: updated.result_id,
                assessee: {
                    id: assessee === null || assessee === void 0 ? void 0 : assessee.id,
                    name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.full_name,
                    email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email
                },
                approved_assessee: updated.approved_assessee,
                approved_assessor: updated.approved_assessor,
                is_continue: updated.is_continue
            };
        });
    }
    static approvedByAssessee(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!existingResult) {
                throw new error_1.NotFoundError('Result');
            }
            const header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, result_id) });
            if (!header) {
                throw new error_1.NotFoundError('Result header');
            }
            yield drizzle_1.db.update(schema_1.resultApl02Header).set({ approved_assessee: true }).where((0, drizzle_orm_1.eq)(schema_1.resultApl02Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('APL02 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assessee_id) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
            return {
                id: updated.id,
                result_id: updated.result_id,
                assessee: {
                    id: assessee === null || assessee === void 0 ? void 0 : assessee.id,
                    name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.full_name,
                    email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email
                },
                approved_assessee: updated.approved_assessee,
                approved_assessor: updated.approved_assessor,
                is_continue: updated.is_continue
            };
        });
    }
    static getResultDetails(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!result) {
                throw new error_1.NotFoundError('Result');
            }
            const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, result.schedule_id) });
            if (!schedule) {
                throw new error_1.NotFoundError('Schedule');
            }
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, schedule.assessment_id) });
            const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) }) : null;
            const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) }) : null;
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assessee_id) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) }) : null;
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, result.assessor_id) });
            const assessorUser = schema_1.assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, schema_1.assessor.user_id) }) : null;
            const header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, result_id) });
            if (!header) {
                throw new error_1.NotFoundError('Result header');
            }
            const docs = yield drizzle_1.db.select().from(schema_1.resultDoc).where((0, drizzle_orm_1.eq)(schema_1.resultDoc.result_id, result.id));
            if (!docs.length) {
                throw new error_1.NotFoundError('Result docs');
            }
            return {
                id: result.id,
                assessment: assessment ? Object.assign(Object.assign({}, assessment), { occupation: occupation ? Object.assign(Object.assign({}, occupation), { scheme }) : null }) : null,
                assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.full_name, email: assesseeUser.email } : null,
                assessor: assessor && assessorUser ? { id: assessor.id, name: assessorUser.full_name, email: assessorUser.email } : null,
                schedule: schedule,
                tuk: result.tuk,
                is_competent: result.is_competent,
                created_at: result.created_at,
                apl02_header: header,
                approved_by: docs[docs.length - 1].admin_id,
                approved_admin: docs[docs.length - 1].approved
            };
        });
    }
}
exports.APL02Service = APL02Service;
