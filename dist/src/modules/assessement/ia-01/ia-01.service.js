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
exports.IA01Service = void 0;
const error_1 = require("../../../common/error");
const drizzle_1 = require("../../../config/drizzle");
const schema_1 = require("../../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class IA01Service {
    static getIA01Groups(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId), });
            if (!existingResult)
                throw new error_1.NotFoundError('Result');
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, existingResult.assessmentId) });
            if (!assessment)
                throw new error_1.NotFoundError('Assessment');
            const groups = yield drizzle_1.db.select().from(schema_1.groupIa01).where((0, drizzle_orm_1.eq)(schema_1.groupIa01.assessmentId, assessment.id));
            const unitsByGroup = new Map();
            for (const g of groups) {
                const units = yield drizzle_1.db.select().from(schema_1.ucIa01).where((0, drizzle_orm_1.eq)(schema_1.ucIa01.groupId, g.id));
                unitsByGroup.set(g.id, units);
            }
            return Promise.all(groups.map((group) => __awaiter(this, void 0, void 0, function* () {
                const units = unitsByGroup.get(group.id) || [];
                const decorated = yield Promise.all(units.map((unit) => __awaiter(this, void 0, void 0, function* () {
                    const elements = yield drizzle_1.db.select().from(schema_1.elementIa).where((0, drizzle_orm_1.eq)(schema_1.elementIa.ucId, unit.id));
                    let completedElements = 0;
                    for (const el of elements) {
                        const details = yield drizzle_1.db.select().from(schema_1.elementDetailsIa).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsIa.elementId, el.id));
                        const hasResult = yield drizzle_1.db.query.resultIa01.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultIa01.headerId, (yield IA01Service.getHeaderId(resultId))), (0, drizzle_orm_1.inArray)(schema_1.resultIa01.elementDetailId, details.map(d => d.id))) });
                        if (hasResult)
                            completedElements += 1;
                    }
                    const totalElements = elements.length;
                    const finished = totalElements > 0 && totalElements === completedElements;
                    return {
                        id: unit.id,
                        unit_code: unit.unitCode,
                        title: unit.title,
                        finished,
                        progress: totalElements > 0 ? Math.round((completedElements / totalElements) * 100) : 0,
                    };
                })));
                return {
                    id: group.id,
                    assessment_id: group.assessmentId,
                    name: group.name,
                    units: decorated,
                };
            })));
        });
    }
    static getElementsByUnitId(resultId, unitId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUnit = yield drizzle_1.db.query.ucIa01.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ucIa01.id, unitId) });
            if (!existingUnit)
                throw new error_1.NotFoundError('Unit competency');
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!existingResult)
                throw new error_1.NotFoundError('Result');
            const elements = yield drizzle_1.db.select().from(schema_1.elementIa).where((0, drizzle_orm_1.eq)(schema_1.elementIa.ucId, unitId));
            const headerId = yield IA01Service.getHeaderId(resultId);
            return Promise.all(elements.map((element) => __awaiter(this, void 0, void 0, function* () {
                const details = yield drizzle_1.db.select().from(schema_1.elementDetailsIa).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsIa.elementId, element.id));
                const rows = headerId ? yield drizzle_1.db.select().from(schema_1.resultIa01).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultIa01.headerId, headerId), (0, drizzle_orm_1.inArray)(schema_1.resultIa01.elementDetailId, details.map(d => d.id)))) : [];
                return {
                    id: element.id,
                    uc_id: element.ucId,
                    title: element.title,
                    details: details.map((detail) => {
                        const result = rows.find(r => r.elementDetailId === detail.id);
                        return {
                            id: detail.id,
                            description: detail.description,
                            benchmark: detail.benchmark,
                            result: result ? {
                                id: result.id,
                                header_id: result.headerId,
                                is_competent: result.isCompetent,
                                evaluation: result.evaluation,
                            } : null,
                        };
                    })
                };
            })));
        });
    }
    static sendResult(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, data.result_id) });
            if (!existingResult)
                throw new error_1.NotFoundError('Result');
            const header = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.resultId, data.result_id) });
            if (!header)
                throw new error_1.NotFoundError('IA01 header');
            const elementDetailIds = data.elements.map(e => Number(e.element_detail_id));
            const existingElements = elementDetailIds.length ? yield drizzle_1.db.select().from(schema_1.elementDetailsIa).where((0, drizzle_orm_1.inArray)(schema_1.elementDetailsIa.id, elementDetailIds)) : [];
            if (existingElements.length !== elementDetailIds.length)
                throw new error_1.NotFoundError('Element');
            const results = [];
            for (const element of data.elements) {
                const existing = yield drizzle_1.db.query.resultIa01.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultIa01.headerId, header.id), (0, drizzle_orm_1.eq)(schema_1.resultIa01.elementDetailId, Number(element.element_detail_id))) });
                if (existing) {
                    yield drizzle_1.db.update(schema_1.resultIa01)
                        .set({ isCompetent: element.is_competent, evaluation: element.evaluation })
                        .where((0, drizzle_orm_1.eq)(schema_1.resultIa01.id, existing.id));
                    const updated = yield drizzle_1.db.query.resultIa01.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01.id, existing.id) });
                    if (updated)
                        results.push(updated);
                }
                else {
                    const inserted = yield drizzle_1.db.insert(schema_1.resultIa01).values({
                        headerId: header.id,
                        elementDetailId: Number(element.element_detail_id),
                        isCompetent: element.is_competent,
                        evaluation: element.evaluation,
                    });
                    const created = yield drizzle_1.db.query.resultIa01.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultIa01.headerId, header.id), (0, drizzle_orm_1.eq)(schema_1.resultIa01.elementDetailId, Number(element.element_detail_id))) });
                    if (created)
                        results.push(created);
                }
            }
            return results;
        });
    }
    static sendResultHeader(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResult = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, data.result_id) });
            if (!existingResult)
                throw new error_1.NotFoundError('Result');
            const header = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.resultId, data.result_id) });
            if (!header)
                throw new error_1.NotFoundError('IA01 header');
            yield drizzle_1.db.update(schema_1.resultIa01Header).set({
                isCompetent: data.is_competent,
                group: data.group,
                unit: data.unit,
                element: data.element,
                kuk: data.kuk,
            }).where((0, drizzle_orm_1.eq)(schema_1.resultIa01Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('IA01 header');
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, existingResult.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            return {
                id: updated.id,
                result_id: updated.resultId,
                assessee: {
                    id: assessee === null || assessee === void 0 ? void 0 : assessee.id,
                    name: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.fullName,
                    email: assesseeUser === null || assesseeUser === void 0 ? void 0 : assesseeUser.email,
                },
                approved_assessee: updated.approvedAssessee,
                approved_assessor: updated.approvedAssessor,
                is_competent: updated.isCompetent,
                group: updated.group,
                unit: updated.unit,
                element: updated.element,
                kuk: updated.kuk,
            };
        });
    }
    static approvedByAssessee(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const header = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.resultId, resultId) });
            if (!header)
                throw new error_1.NotFoundError('IA01 header');
            yield drizzle_1.db.update(schema_1.resultIa01Header).set({ approvedAssessee: true }).where((0, drizzle_orm_1.eq)(schema_1.resultIa01Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('IA01 header');
            return updated;
        });
    }
    static approvedByAssessor(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const header = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.resultId, resultId) });
            if (!header)
                throw new error_1.NotFoundError('IA01 header');
            yield drizzle_1.db.update(schema_1.resultIa01Header).set({ approvedAssessor: true }).where((0, drizzle_orm_1.eq)(schema_1.resultIa01Header.id, header.id));
            const updated = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.id, header.id) });
            if (!updated)
                throw new error_1.NotFoundError('IA01 header');
            return updated;
        });
    }
    static getResultDetails(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, resultId) });
            if (!result)
                throw new error_1.NotFoundError('Result');
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, result.assessmentId) });
            const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupationId) }) : null;
            const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.schemeId) }) : null;
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, result.assesseeId) });
            const assesseeUser = assessee ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.userId) }) : null;
            const header = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.resultId, result.id) });
            if (!header)
                throw new error_1.NotFoundError('Result header');
            return {
                id: result.id,
                assessment: assessment ? Object.assign(Object.assign({}, assessment), { occupation: occupation ? Object.assign(Object.assign({}, occupation), { scheme }) : null }) : null,
                assessee: assessee && assesseeUser ? { id: assessee.id, name: assesseeUser.fullName, email: assesseeUser.email } : null,
                assessor: null,
                tuk: result.tuk,
                is_competent: result.isCompetent,
                created_at: result.createdAt,
                ia01_header: header,
            };
        });
    }
    static getHeaderId(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const header = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.resultId, resultId) });
            return (_a = header === null || header === void 0 ? void 0 : header.id) !== null && _a !== void 0 ? _a : null;
        });
    }
}
exports.IA01Service = IA01Service;
