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
exports.AssessmentService = void 0;
const error_1 = require("../../common/error");
const drizzle_1 = require("../../config/drizzle");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const pdf_lib_1 = require("pdf-lib");
const pdfAssets_helper_1 = require("../../helper/pdfAssets.helper");
const pdfDraw_helper_1 = require("../../helper/pdfDraw.helper");
const hashids_1 = require("../../helper/hashids");
const helper_1 = require("./result-pdf/helper");
const date_helper_1 = require("../../helper/date.helper");
class AssessmentService {
    static createAssessment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if scheme exists
            const existingScheme = yield drizzle_1.db.query.scheme.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, data.scheme_id)
            });
            if (!existingScheme) {
                throw new error_1.NotFoundError("Scheme");
            }
            // Check for duplicate assessment code
            const existingAssessment = yield drizzle_1.db.query.assessment.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.assessment.code, data.code)
            });
            if (existingAssessment) {
                throw new error_1.DuplicateEntryError("Assessment code", data.code);
            }
            // Find or create occupation
            let existingOccupation = yield drizzle_1.db.query.occupation.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, data.occupation_id)
            });
            if (!existingOccupation)
                new error_1.NotFoundError("Occupation");
            return yield drizzle_1.db.transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Create assessment
                const [assessment] = yield tx.insert(schema_1.assessment).values({
                    occupation_id: data.occupation_id,
                    code: data.code,
                });
                const assessment_id = assessment.insertId;
                // Create UC APL02
                for (const uc of data.uc_apl02s) {
                    const [ucApl02] = yield tx.insert(schema_1.ucApl02).values({
                        assessment_id,
                        unit_code: uc.unit_code,
                        title: uc.title,
                    });
                    for (const element of uc.elements) {
                        const [elementApl02] = yield tx.insert(schema_1.elementApl02).values({
                            uc_id: ucApl02.insertId,
                            title: element.title,
                        });
                        for (const detail of element.details) {
                            yield tx.insert(schema_1.elementDetailsApl02).values({
                                element_id: elementApl02.insertId,
                                description: detail.description,
                            });
                        }
                    }
                }
                // Create Group IA01
                for (const group of data.groups_ia01) {
                    const [groupIa01] = yield tx.insert(schema_1.groupIa01).values({
                        assessment_id,
                        name: group.name,
                    });
                    for (const unit of group.units) {
                        const [ucIa01] = yield tx.insert(schema_1.ucIa01).values({
                            group_id: groupIa01.insertId,
                            unit_code: unit.unit_code,
                            title: unit.title,
                        });
                        for (const element of unit.elements) {
                            const [elementIa] = yield tx.insert(schema_1.elementIa).values({
                                uc_id: ucIa01.insertId,
                                title: element.title,
                            });
                            for (const detail of element.details) {
                                yield tx.insert(schema_1.elementDetailsIa).values({
                                    element_id: elementIa.insertId,
                                    description: detail.description,
                                    benchmark: detail.benchmark,
                                });
                            }
                        }
                    }
                }
                // Create Group IA03
                for (const group of data.groups_ia03) {
                    const [groupIa03] = yield tx.insert(schema_1.groupIa03).values({
                        assessment_id,
                        name: group.name,
                    });
                    for (const unit of group.units) {
                        yield tx.insert(schema_1.ucIa03).values({
                            group_id: groupIa03.insertId,
                            unit_code: unit.unit_code,
                            title: unit.title,
                        });
                    }
                    for (const question of group.qa_ia03) {
                        yield tx.insert(schema_1.ia03Question).values({
                            group_id: groupIa03.insertId,
                            question: question.question,
                        });
                    }
                }
                // Create IA05 Questions
                if (data.ia05_questions && data.ia05_questions.length > 0) {
                    for (const question of data.ia05_questions) {
                        const [ia05Question] = yield tx.insert(schema_1.ia05Question).values({
                            assessment_id,
                            order: question.order,
                            question: question.question,
                        });
                        for (const option of question.options) {
                            yield tx.insert(schema_1.questionOption).values({
                                question_id: ia05Question.insertId,
                                option: option.option,
                                is_answer: option.is_answer,
                            });
                        }
                    }
                }
                // Create IA07 Questions
                if (data.ia07_questions && data.ia07_questions.length > 0) {
                    for (const question of data.ia07_questions) {
                        yield tx.insert(schema_1.ia07Question).values({
                            assessment_id,
                            question: question.question,
                            answer_key: question.answer_key,
                        });
                    }
                }
                return { id: assessment_id };
            }));
        });
    }
    static updateAssessment(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Update assessment utama
            const existingAssessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, id) });
            if (!existingAssessment)
                throw new error_1.NotFoundError('Assessment');
            // Update occupation jika berubah
            const occupation = yield drizzle_1.db.query.occupation.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, data.occupation_id)
            });
            if (!occupation)
                throw new error_1.NotFoundError('Occupation');
            yield drizzle_1.db.update(schema_1.assessment).set({
                code: data.code,
                occupation_id: occupation.id
            }).where((0, drizzle_orm_1.eq)(schema_1.assessment.id, id));
            // === UCAPL02 ===
            // Ambil semua id uc_apl02 lama
            const oldUCs = yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.assessment_id, id));
            const oldUCIds = new Set(oldUCs.map(u => u.id));
            const newUCIds = new Set((data.uc_apl02s || []).filter(u => u.id).map(u => u.id));
            // Hapus UC yang tidak ada di payload
            for (const old of oldUCs) {
                if (!newUCIds.has(old.id)) {
                    // Hapus child (elements, details)
                    const elements = yield drizzle_1.db.select().from(schema_1.elementApl02).where((0, drizzle_orm_1.eq)(schema_1.elementApl02.uc_id, old.id));
                    for (const el of elements) {
                        yield drizzle_1.db.delete(schema_1.elementDetailsApl02).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsApl02.element_id, el.id));
                    }
                    yield drizzle_1.db.delete(schema_1.elementApl02).where((0, drizzle_orm_1.eq)(schema_1.elementApl02.uc_id, old.id));
                    yield drizzle_1.db.delete(schema_1.ucApl02).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.id, old.id));
                }
            }
            // Insert/update UC dan turunannya
            for (const uc of data.uc_apl02s || []) {
                let ucId = uc.id;
                if (uc.id) {
                    // Update
                    yield drizzle_1.db.update(schema_1.ucApl02).set({
                        unit_code: uc.unit_code,
                        title: uc.title
                    }).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.id, uc.id));
                }
                else {
                    // Insert
                    const [ucRow] = yield drizzle_1.db.insert(schema_1.ucApl02).values({
                        assessment_id: id,
                        unit_code: uc.unit_code,
                        title: uc.title
                    }).$returningId();
                    ucId = ucRow.id;
                }
                // Elements
                const oldEls = yield drizzle_1.db.select().from(schema_1.elementApl02).where((0, drizzle_orm_1.eq)(schema_1.elementApl02.uc_id, ucId));
                const oldElIds = new Set(oldEls.map(e => e.id));
                const newElIds = new Set((uc.elements || []).filter(e => e.id).map(e => e.id));
                // Hapus element yang tidak ada di payload
                for (const old of oldEls) {
                    if (!newElIds.has(old.id)) {
                        yield drizzle_1.db.delete(schema_1.elementDetailsApl02).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsApl02.element_id, old.id));
                        yield drizzle_1.db.delete(schema_1.elementApl02).where((0, drizzle_orm_1.eq)(schema_1.elementApl02.id, old.id));
                    }
                }
                // Insert/update element dan details
                for (const el of uc.elements || []) {
                    let elId = el.id;
                    if (el.id) {
                        yield drizzle_1.db.update(schema_1.elementApl02).set({
                            title: el.title
                        }).where((0, drizzle_orm_1.eq)(schema_1.elementApl02.id, el.id));
                    }
                    else {
                        const [elRow] = yield drizzle_1.db.insert(schema_1.elementApl02).values({
                            uc_id: ucId,
                            title: el.title
                        }).$returningId();
                        elId = elRow.id;
                    }
                    // Details
                    const oldDets = yield drizzle_1.db.select().from(schema_1.elementDetailsApl02).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsApl02.element_id, elId));
                    const oldDetIds = new Set(oldDets.map(d => d.id));
                    const newDetIds = new Set((el.details || []).filter(d => d.id).map(d => d.id));
                    for (const old of oldDets) {
                        if (!newDetIds.has(old.id)) {
                            yield drizzle_1.db.delete(schema_1.elementDetailsApl02).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsApl02.id, old.id));
                        }
                    }
                    for (const det of el.details || []) {
                        if (det.id) {
                            yield drizzle_1.db.update(schema_1.elementDetailsApl02).set({
                                description: det.description
                            }).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsApl02.id, det.id));
                        }
                        else {
                            yield drizzle_1.db.insert(schema_1.elementDetailsApl02).values({
                                element_id: elId,
                                description: det.description
                            });
                        }
                    }
                }
            }
            // === GROUP IA01 ===
            const oldGroupsIa01 = yield drizzle_1.db.select().from(schema_1.groupIa01).where((0, drizzle_orm_1.eq)(schema_1.groupIa01.assessment_id, id));
            const oldGroupsIa01Ids = new Set(oldGroupsIa01.map(g => g.id));
            const newGroupsIa01Ids = new Set((data.groups_ia01 || []).filter(g => g.id).map(g => g.id));
            for (const old of oldGroupsIa01) {
                if (!newGroupsIa01Ids.has(old.id)) {
                    // Hapus child units & elements
                    const units = yield drizzle_1.db.select().from(schema_1.ucIa01).where((0, drizzle_orm_1.eq)(schema_1.ucIa01.group_id, old.id));
                    for (const unit of units) {
                        const elements = yield drizzle_1.db.select().from(schema_1.elementIa).where((0, drizzle_orm_1.eq)(schema_1.elementIa.uc_id, unit.id));
                        for (const el of elements) {
                            yield drizzle_1.db.delete(schema_1.elementDetailsIa).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsIa.element_id, el.id));
                        }
                        yield drizzle_1.db.delete(schema_1.elementIa).where((0, drizzle_orm_1.eq)(schema_1.elementIa.uc_id, unit.id));
                        yield drizzle_1.db.delete(schema_1.ucIa01).where((0, drizzle_orm_1.eq)(schema_1.ucIa01.id, unit.id));
                    }
                    yield drizzle_1.db.delete(schema_1.groupIa01).where((0, drizzle_orm_1.eq)(schema_1.groupIa01.id, old.id));
                }
            }
            for (const group of data.groups_ia01 || []) {
                let groupId = group.id;
                if (group.id) {
                    yield drizzle_1.db.update(schema_1.groupIa01).set({ name: group.name }).where((0, drizzle_orm_1.eq)(schema_1.groupIa01.id, group.id));
                }
                else {
                    const [groupRow] = yield drizzle_1.db.insert(schema_1.groupIa01).values({ assessment_id: id, name: group.name }).$returningId();
                    groupId = groupRow.id;
                }
                if (!groupId)
                    continue; // skip jika gagal dapat id
                // Units
                const oldUnits = yield drizzle_1.db.select().from(schema_1.ucIa01).where((0, drizzle_orm_1.eq)(schema_1.ucIa01.group_id, groupId));
                const oldUnitIds = new Set(oldUnits.map(u => u.id));
                const newUnitIds = new Set((group.units || []).filter(u => u.id).map(u => u.id));
                for (const old of oldUnits) {
                    if (!newUnitIds.has(old.id)) {
                        const elements = yield drizzle_1.db.select().from(schema_1.elementIa).where((0, drizzle_orm_1.eq)(schema_1.elementIa.uc_id, old.id));
                        for (const el of elements) {
                            yield drizzle_1.db.delete(schema_1.elementDetailsIa).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsIa.element_id, el.id));
                        }
                        yield drizzle_1.db.delete(schema_1.elementIa).where((0, drizzle_orm_1.eq)(schema_1.elementIa.uc_id, old.id));
                        yield drizzle_1.db.delete(schema_1.ucIa01).where((0, drizzle_orm_1.eq)(schema_1.ucIa01.id, old.id));
                    }
                }
                for (const unit of group.units || []) {
                    let unitId = unit.id;
                    if (unit.id) {
                        yield drizzle_1.db.update(schema_1.ucIa01).set({ unit_code: unit.unit_code, title: unit.title }).where((0, drizzle_orm_1.eq)(schema_1.ucIa01.id, unit.id));
                    }
                    else {
                        if (!groupId)
                            continue;
                        const [unitRow] = yield drizzle_1.db.insert(schema_1.ucIa01).values({ group_id: groupId, unit_code: unit.unit_code, title: unit.title }).$returningId();
                        unitId = unitRow.id;
                    }
                    if (!unitId)
                        continue;
                    // Elements
                    const oldEls = yield drizzle_1.db.select().from(schema_1.elementIa).where((0, drizzle_orm_1.eq)(schema_1.elementIa.uc_id, unitId));
                    const oldElIds = new Set(oldEls.map(e => e.id));
                    const newElIds = new Set((unit.elements || []).filter(e => e.id).map(e => e.id));
                    for (const old of oldEls) {
                        if (!newElIds.has(old.id)) {
                            yield drizzle_1.db.delete(schema_1.elementDetailsIa).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsIa.element_id, old.id));
                            yield drizzle_1.db.delete(schema_1.elementIa).where((0, drizzle_orm_1.eq)(schema_1.elementIa.id, old.id));
                        }
                    }
                    for (const el of unit.elements || []) {
                        let elId = el.id;
                        if (el.id) {
                            yield drizzle_1.db.update(schema_1.elementIa).set({ title: el.title }).where((0, drizzle_orm_1.eq)(schema_1.elementIa.id, el.id));
                        }
                        else {
                            if (!unitId)
                                continue;
                            const [elRow] = yield drizzle_1.db.insert(schema_1.elementIa).values({ uc_id: unitId, title: el.title }).$returningId();
                            elId = elRow.id;
                        }
                        if (!elId)
                            continue;
                        // Details
                        const oldDets = yield drizzle_1.db.select().from(schema_1.elementDetailsIa).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsIa.element_id, elId));
                        const oldDetIds = new Set(oldDets.map(d => d.id));
                        const newDetIds = new Set((el.details || []).filter(d => d.id).map(d => d.id));
                        for (const old of oldDets) {
                            if (!newDetIds.has(old.id)) {
                                yield drizzle_1.db.delete(schema_1.elementDetailsIa).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsIa.id, old.id));
                            }
                        }
                        for (const det of el.details || []) {
                            if (det.id) {
                                yield drizzle_1.db.update(schema_1.elementDetailsIa).set({ description: det.description, benchmark: det.benchmark }).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsIa.id, det.id));
                            }
                            else {
                                if (!elId)
                                    continue;
                                yield drizzle_1.db.insert(schema_1.elementDetailsIa).values({ element_id: elId, description: det.description, benchmark: det.benchmark });
                            }
                        }
                    }
                }
            }
            // === GROUP IA02 ===
            const oldGroupsIa02 = yield drizzle_1.db.select().from(schema_1.groupIa02).where((0, drizzle_orm_1.eq)(schema_1.groupIa02.assessment_id, id));
            const oldGroupsIa02Ids = new Set(oldGroupsIa02.map(g => g.id));
            const newGroupsIa02Ids = new Set((data.groups_ia02 || []).filter(g => g.id).map(g => g.id));
            for (const old of oldGroupsIa02) {
                if (!newGroupsIa02Ids.has(old.id)) {
                    yield drizzle_1.db.delete(schema_1.ucIa02).where((0, drizzle_orm_1.eq)(schema_1.ucIa02.group_id, old.id));
                    yield drizzle_1.db.delete(schema_1.ia02Tool).where((0, drizzle_orm_1.eq)(schema_1.ia02Tool.group_id, old.id));
                    yield drizzle_1.db.delete(schema_1.groupIa02).where((0, drizzle_orm_1.eq)(schema_1.groupIa02.id, old.id));
                }
            }
            for (const group of data.groups_ia02 || []) {
                let groupId = group.id;
                if (group.id) {
                    yield drizzle_1.db.update(schema_1.groupIa02).set({ name: group.name, scenario: group.scenario, duration: group.duration }).where((0, drizzle_orm_1.eq)(schema_1.groupIa02.id, group.id));
                }
                else {
                    const [groupRow] = yield drizzle_1.db.insert(schema_1.groupIa02).values({ assessment_id: id, name: group.name, scenario: group.scenario, duration: group.duration }).$returningId();
                    groupId = groupRow.id;
                }
                if (!groupId)
                    continue;
                // Units
                const oldUnits = yield drizzle_1.db.select().from(schema_1.ucIa02).where((0, drizzle_orm_1.eq)(schema_1.ucIa02.group_id, groupId));
                const oldUnitIds = new Set(oldUnits.map(u => u.id));
                const newUnitIds = new Set((group.units || []).filter(u => u.id).map(u => u.id));
                for (const old of oldUnits) {
                    if (!newUnitIds.has(old.id)) {
                        yield drizzle_1.db.delete(schema_1.ucIa02).where((0, drizzle_orm_1.eq)(schema_1.ucIa02.id, old.id));
                    }
                }
                for (const unit of group.units || []) {
                    if (unit.id) {
                        yield drizzle_1.db.update(schema_1.ucIa02).set({ unit_code: unit.unit_code, title: unit.title }).where((0, drizzle_orm_1.eq)(schema_1.ucIa02.id, unit.id));
                    }
                    else {
                        if (!groupId)
                            continue;
                        yield drizzle_1.db.insert(schema_1.ucIa02).values({ group_id: groupId, unit_code: unit.unit_code, title: unit.title });
                    }
                }
                // Tools
                const oldTools = yield drizzle_1.db.select().from(schema_1.ia02Tool).where((0, drizzle_orm_1.eq)(schema_1.ia02Tool.group_id, groupId));
                const oldToolIds = new Set(oldTools.map(t => t.id));
                const newToolIds = new Set((group.tools || []).filter(t => t.id).map(t => t.id));
                for (const old of oldTools) {
                    if (!newToolIds.has(old.id)) {
                        yield drizzle_1.db.delete(schema_1.ia02Tool).where((0, drizzle_orm_1.eq)(schema_1.ia02Tool.id, old.id));
                    }
                }
                for (const tool of group.tools || []) {
                    if (tool.id) {
                        yield drizzle_1.db.update(schema_1.ia02Tool).set({ name: tool.name }).where((0, drizzle_orm_1.eq)(schema_1.ia02Tool.id, tool.id));
                    }
                    else {
                        if (!groupId)
                            continue;
                        yield drizzle_1.db.insert(schema_1.ia02Tool).values({ group_id: groupId, name: tool.name });
                    }
                }
            }
            // === GROUP IA03 ===
            const oldGroupsIa03 = yield drizzle_1.db.select().from(schema_1.groupIa03).where((0, drizzle_orm_1.eq)(schema_1.groupIa03.assessment_id, id));
            const oldGroupsIa03Ids = new Set(oldGroupsIa03.map(g => g.id));
            const newGroupsIa03Ids = new Set((data.groups_ia03 || []).filter(g => g.id).map(g => g.id));
            for (const old of oldGroupsIa03) {
                if (!newGroupsIa03Ids.has(old.id)) {
                    yield drizzle_1.db.delete(schema_1.ucIa03).where((0, drizzle_orm_1.eq)(schema_1.ucIa03.group_id, old.id));
                    yield drizzle_1.db.delete(schema_1.ia03Question).where((0, drizzle_orm_1.eq)(schema_1.ia03Question.group_id, old.id));
                    yield drizzle_1.db.delete(schema_1.groupIa03).where((0, drizzle_orm_1.eq)(schema_1.groupIa03.id, old.id));
                }
            }
            for (const group of data.groups_ia03 || []) {
                let groupId = group.id;
                if (group.id) {
                    yield drizzle_1.db.update(schema_1.groupIa03).set({ name: group.name }).where((0, drizzle_orm_1.eq)(schema_1.groupIa03.id, group.id));
                }
                else {
                    const [groupRow] = yield drizzle_1.db.insert(schema_1.groupIa03).values({ assessment_id: id, name: group.name }).$returningId();
                    groupId = groupRow.id;
                }
                if (!groupId)
                    continue;
                // Units
                const oldUnits = yield drizzle_1.db.select().from(schema_1.ucIa03).where((0, drizzle_orm_1.eq)(schema_1.ucIa03.group_id, groupId));
                const oldUnitIds = new Set(oldUnits.map(u => u.id));
                const newUnitIds = new Set((group.units || []).filter(u => u.id).map(u => u.id));
                for (const old of oldUnits) {
                    if (!newUnitIds.has(old.id)) {
                        yield drizzle_1.db.delete(schema_1.ucIa03).where((0, drizzle_orm_1.eq)(schema_1.ucIa03.id, old.id));
                    }
                }
                for (const unit of group.units || []) {
                    if (unit.id) {
                        yield drizzle_1.db.update(schema_1.ucIa03).set({ unit_code: unit.unit_code, title: unit.title }).where((0, drizzle_orm_1.eq)(schema_1.ucIa03.id, unit.id));
                    }
                    else {
                        if (!groupId)
                            continue;
                        yield drizzle_1.db.insert(schema_1.ucIa03).values({ group_id: groupId, unit_code: unit.unit_code, title: unit.title });
                    }
                }
                // QA
                const oldQas = yield drizzle_1.db.select().from(schema_1.ia03Question).where((0, drizzle_orm_1.eq)(schema_1.ia03Question.group_id, groupId));
                const oldQaIds = new Set(oldQas.map(q => q.id));
                const newQaIds = new Set((group.qa_ia03 || []).filter(q => q.id).map(q => q.id));
                for (const old of oldQas) {
                    if (!newQaIds.has(old.id)) {
                        yield drizzle_1.db.delete(schema_1.ia03Question).where((0, drizzle_orm_1.eq)(schema_1.ia03Question.id, old.id));
                    }
                }
                for (const qa of group.qa_ia03 || []) {
                    if (qa.id) {
                        yield drizzle_1.db.update(schema_1.ia03Question).set({ question: qa.question }).where((0, drizzle_orm_1.eq)(schema_1.ia03Question.id, qa.id));
                    }
                    else {
                        if (!groupId)
                            continue;
                        yield drizzle_1.db.insert(schema_1.ia03Question).values({ group_id: groupId, question: qa.question });
                    }
                }
            }
            // === IA05 ===
            if (data.ia05_questions) {
                const oldQ5s = yield drizzle_1.db.select().from(schema_1.ia05Question).where((0, drizzle_orm_1.eq)(schema_1.ia05Question.assessment_id, id));
                const oldQ5Ids = new Set(oldQ5s.map(q => q.id));
                const newQ5Ids = new Set((data.ia05_questions || []).filter(q => q.id).map(q => q.id));
                for (const old of oldQ5s) {
                    if (!newQ5Ids.has(old.id)) {
                        yield drizzle_1.db.delete(schema_1.questionOption).where((0, drizzle_orm_1.eq)(schema_1.questionOption.question_id, old.id));
                        yield drizzle_1.db.delete(schema_1.ia05Question).where((0, drizzle_orm_1.eq)(schema_1.ia05Question.id, old.id));
                    }
                }
                for (const q of data.ia05_questions || []) {
                    let qId = q.id;
                    if (q.id) {
                        yield drizzle_1.db.update(schema_1.ia05Question).set({ order: q.order, question: q.question }).where((0, drizzle_orm_1.eq)(schema_1.ia05Question.id, q.id));
                    }
                    else {
                        const [qRow] = yield drizzle_1.db.insert(schema_1.ia05Question).values({ assessment_id: id, order: q.order, question: q.question }).$returningId();
                        qId = qRow.id;
                    }
                    if (!qId)
                        continue;
                    // Options
                    const oldOpts = yield drizzle_1.db.select().from(schema_1.questionOption).where((0, drizzle_orm_1.eq)(schema_1.questionOption.question_id, qId));
                    const oldOptIds = new Set(oldOpts.map(o => o.id));
                    const newOptIds = new Set((q.options || []).filter(o => o.id).map(o => o.id));
                    for (const old of oldOpts) {
                        if (!newOptIds.has(old.id)) {
                            yield drizzle_1.db.delete(schema_1.questionOption).where((0, drizzle_orm_1.eq)(schema_1.questionOption.id, old.id));
                        }
                    }
                    for (const opt of q.options || []) {
                        if (opt.id) {
                            yield drizzle_1.db.update(schema_1.questionOption).set({ option: opt.option, is_answer: opt.is_answer }).where((0, drizzle_orm_1.eq)(schema_1.questionOption.id, opt.id));
                        }
                        else {
                            if (!qId)
                                continue;
                            yield drizzle_1.db.insert(schema_1.questionOption).values({ question_id: qId, option: opt.option, is_answer: opt.is_answer });
                        }
                    }
                }
            }
            // === IA07 ===
            if (data.ia07_questions) {
                const oldQ7s = yield drizzle_1.db.select().from(schema_1.ia07Question).where((0, drizzle_orm_1.eq)(schema_1.ia07Question.assessment_id, id));
                const oldQ7Ids = new Set(oldQ7s.map(q => q.id));
                const newQ7Ids = new Set((data.ia07_questions || []).filter(q => q.id).map(q => q.id));
                for (const old of oldQ7s) {
                    if (!newQ7Ids.has(old.id)) {
                        yield drizzle_1.db.delete(schema_1.ia07Question).where((0, drizzle_orm_1.eq)(schema_1.ia07Question.id, old.id));
                    }
                }
                for (const q of data.ia07_questions || []) {
                    if (q.id) {
                        yield drizzle_1.db.update(schema_1.ia07Question).set({ question: q.question, answer_key: q.answer_key }).where((0, drizzle_orm_1.eq)(schema_1.ia07Question.id, q.id));
                    }
                    else {
                        yield drizzle_1.db.insert(schema_1.ia07Question).values({ assessment_id: id, question: q.question, answer_key: q.answer_key });
                    }
                }
            }
            return { id: id };
        });
    }
    static getAssessments() {
        return __awaiter(this, void 0, void 0, function* () {
            const assessments = yield drizzle_1.db.select({
                id: schema_1.assessment.id,
                code: schema_1.assessment.code,
                occupation_id: schema_1.assessment.occupation_id,
            }).from(schema_1.assessment);
            const result = [];
            for (const assessment of assessments) {
                const [occupation] = yield drizzle_1.db
                    .select()
                    .from(schema_1.occupation)
                    .where((0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id));
                if (!occupation)
                    continue;
                const [scheme] = yield drizzle_1.db
                    .select()
                    .from(schema_1.scheme)
                    .where((0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id));
                result.push({
                    id: assessment.id,
                    code: assessment.code,
                    occupation: {
                        id: occupation.id,
                        name: occupation.name,
                        scheme: scheme
                            ? {
                                id: scheme.id,
                                code: scheme.code,
                                name: scheme.name,
                            }
                            : null,
                    },
                });
            }
            return result;
        });
    }
    static getAssessmentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessment = yield drizzle_1.db.query.assessment.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, id)
            });
            if (!assessment)
                throw new error_1.NotFoundError('Assessment');
            // Get occupation and scheme
            const [occupation] = yield drizzle_1.db
                .select({
                id: schema_1.occupation.id,
                name: schema_1.occupation.name,
                scheme_id: schema_1.occupation.scheme_id,
                created_at: schema_1.occupation.created_at,
                updated_at: schema_1.occupation.updated_at,
                scheme: schema_1.scheme
            })
                .from(schema_1.occupation)
                .innerJoin(schema_1.scheme, (0, drizzle_orm_1.eq)(schema_1.scheme.id, schema_1.occupation.scheme_id))
                .where((0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id));
            // === UCAPL02 ===
            const ucApl02sRaw = yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.assessment_id, id));
            const uc_apl02s = yield Promise.all(ucApl02sRaw.map((uc) => __awaiter(this, void 0, void 0, function* () {
                const elementsRaw = yield drizzle_1.db.select().from(schema_1.elementApl02).where((0, drizzle_orm_1.eq)(schema_1.elementApl02.uc_id, uc.id));
                const elements = yield Promise.all(elementsRaw.map((el) => __awaiter(this, void 0, void 0, function* () {
                    const details = yield drizzle_1.db.select().from(schema_1.elementDetailsApl02).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsApl02.element_id, el.id));
                    return {
                        id: el.id,
                        title: el.title,
                        details: details.map((d) => ({ id: d.id, description: d.description }))
                    };
                })));
                return {
                    id: uc.id,
                    unit_code: uc.unit_code,
                    title: uc.title,
                    elements
                };
            })));
            // === GROUP IA01 ===
            const groupsIa01Raw = yield drizzle_1.db.select().from(schema_1.groupIa01).where((0, drizzle_orm_1.eq)(schema_1.groupIa01.assessment_id, id));
            const groups_ia01 = yield Promise.all(groupsIa01Raw.map((group) => __awaiter(this, void 0, void 0, function* () {
                const unitsRaw = yield drizzle_1.db.select().from(schema_1.ucIa01).where((0, drizzle_orm_1.eq)(schema_1.ucIa01.group_id, group.id));
                const units = yield Promise.all(unitsRaw.map((unit) => __awaiter(this, void 0, void 0, function* () {
                    const elementsRaw = yield drizzle_1.db.select().from(schema_1.elementIa).where((0, drizzle_orm_1.eq)(schema_1.elementIa.uc_id, unit.id));
                    const elements = yield Promise.all(elementsRaw.map((el) => __awaiter(this, void 0, void 0, function* () {
                        const details = yield drizzle_1.db.select().from(schema_1.elementDetailsIa).where((0, drizzle_orm_1.eq)(schema_1.elementDetailsIa.element_id, el.id));
                        return {
                            id: el.id,
                            title: el.title,
                            details: details.map((d) => ({ id: d.id, description: d.description, benchmark: d.benchmark }))
                        };
                    })));
                    return {
                        id: unit.id,
                        unit_code: unit.unit_code,
                        title: unit.title,
                        elements
                    };
                })));
                return {
                    id: group.id,
                    name: group.name,
                    units
                };
            })));
            // === GROUP IA02 ===
            const groupsIa02Raw = yield drizzle_1.db.select().from(schema_1.groupIa02).where((0, drizzle_orm_1.eq)(schema_1.groupIa02.assessment_id, id));
            const groups_ia02 = yield Promise.all(groupsIa02Raw.map((group) => __awaiter(this, void 0, void 0, function* () {
                const units = yield drizzle_1.db.select().from(schema_1.ucIa02).where((0, drizzle_orm_1.eq)(schema_1.ucIa02.group_id, group.id));
                const tools = yield drizzle_1.db.select().from(schema_1.ia02Tool).where((0, drizzle_orm_1.eq)(schema_1.ia02Tool.group_id, group.id));
                return {
                    id: group.id,
                    name: group.name,
                    scenario: group.scenario,
                    duration: group.duration,
                    units: units.map((u) => ({ id: u.id, unit_code: u.unit_code, title: u.title })),
                    tools: tools.map((t) => ({ id: t.id, name: t.name }))
                };
            })));
            // === GROUP IA03 ===
            const groupsIa03Raw = yield drizzle_1.db.select().from(schema_1.groupIa03).where((0, drizzle_orm_1.eq)(schema_1.groupIa03.assessment_id, id));
            const groups_ia03 = yield Promise.all(groupsIa03Raw.map((group) => __awaiter(this, void 0, void 0, function* () {
                const units = yield drizzle_1.db.select().from(schema_1.ucIa03).where((0, drizzle_orm_1.eq)(schema_1.ucIa03.group_id, group.id));
                const qa_ia03 = yield drizzle_1.db.select().from(schema_1.ia03Question).where((0, drizzle_orm_1.eq)(schema_1.ia03Question.group_id, group.id));
                return {
                    id: group.id,
                    name: group.name,
                    units: units.map((u) => ({ id: u.id, unit_code: u.unit_code, title: u.title })),
                    qa_ia03: qa_ia03.map((q) => ({ id: q.id, question: q.question }))
                };
            })));
            // === IA05 ===
            const ia05QuestionsRaw = yield drizzle_1.db.select().from(schema_1.ia05Question).where((0, drizzle_orm_1.eq)(schema_1.ia05Question.assessment_id, id));
            const ia05_questions = yield Promise.all(ia05QuestionsRaw.map((q) => __awaiter(this, void 0, void 0, function* () {
                const options = yield drizzle_1.db.select().from(schema_1.questionOption).where((0, drizzle_orm_1.eq)(schema_1.questionOption.question_id, q.id));
                return {
                    id: q.id,
                    order: q.order,
                    question: q.question,
                    options: options.map((o) => ({ id: o.id, option: o.option, is_answer: o.is_answer }))
                };
            })));
            // === IA07 ===
            const ia07QuestionsRaw = yield drizzle_1.db.select().from(schema_1.ia07Question).where((0, drizzle_orm_1.eq)(schema_1.ia07Question.assessment_id, id));
            const ia07_questions = ia07QuestionsRaw.map((q) => ({ id: q.id, question: q.question, answer_key: q.answer_key }));
            // === IA02 PDF ===
            const [ia02_pdf] = yield drizzle_1.db.select().from(schema_1.ia02Pdf).where((0, drizzle_orm_1.eq)(schema_1.ia02Pdf.assessment_id, id));
            return {
                id: assessment.id,
                code: assessment.code,
                occupation: occupation,
                uc_apl02s,
                groups_ia01,
                ia02_pdf,
                groups_ia03,
                ia05_questions,
                ia07_questions,
            };
        });
    }
    static deleteAssessment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, id) });
            if (!assessment) {
                throw new error_1.NotFoundError('Assessment not found');
            }
            yield drizzle_1.db.delete(schema_1.assessment).where((0, drizzle_orm_1.eq)(schema_1.assessment.id, id));
            return { message: 'Assessment deleted successfully' };
        });
    }
    static getAssessmentResultDetails(assessment_id, assessor_id, assessee_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield drizzle_1.db
                .select({
                id: schema_1.result.id,
                assessment: schema_1.assessment,
                assessee: schema_1.assessee,
                assessor: schema_1.assessor,
                tuk: schema_1.result.tuk,
                score: schema_1.result.score,
                is_competent: schema_1.result.is_competent,
                created_at: schema_1.result.created_at,
            })
                .from(schema_1.result)
                .innerJoin(schema_1.assessment, (0, drizzle_orm_1.eq)(schema_1.result.assessment_id, schema_1.assessment.id))
                .innerJoin(schema_1.assessee, (0, drizzle_orm_1.eq)(schema_1.result.assessee_id, schema_1.assessee.id))
                .innerJoin(schema_1.assessor, (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, schema_1.assessor.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.assessment.id, assessment_id), (0, drizzle_orm_1.eq)(schema_1.assessor.id, assessor_id), (0, drizzle_orm_1.eq)(schema_1.assessee.id, assessee_id)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.result.created_at))
                .limit(1);
            if (results.length === 0) {
                throw new error_1.NotFoundError('Result');
            }
            const result = results[0];
            const doc = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.result_id, result.id) });
            const apl02Header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, result.id) });
            const ia01Header = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.result_id, result.id) });
            const ia02Header = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.result_id, result.id) });
            const ia03Header = yield drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, result.id) });
            const ia05Header = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, result.id) });
            const ak01Header = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.result_id, result.id) });
            const ak02Header = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, result.id) });
            const ak03Header = yield drizzle_1.db.query.resultAk03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.id, result.id) });
            const ak04 = yield drizzle_1.db.query.resultAk04.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk04.id, result.id) });
            const ak05 = yield drizzle_1.db.query.resultAk05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk05.id, result.id) });
            return [
                {
                    id: result.id,
                    assessment: result.assessment,
                    assessee: result.assessee,
                    assessor: result.assessor,
                    tuk: result.tuk,
                    score: result.score,
                    is_competent: result.is_competent,
                    created_at: result.created_at,
                    doc: doc,
                    apl02_header: apl02Header,
                    ia01_header: ia01Header,
                    ia02_header: ia02Header,
                    ia03_header: ia03Header,
                    ia05_header: ia05Header,
                    ak01_header: ak01Header,
                    ak02_header: ak02Header,
                    ak03_header: ak03Header,
                    ak04: ak04,
                    ak05: ak05
                }
            ];
        });
    }
    static findAssesseeByUserId(assessment_id, assessor_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessees = yield drizzle_1.db.query.assessee.findMany({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, user_id), orderBy: (0, drizzle_orm_1.desc)(schema_1.assessee.created_at) });
            let result;
            for (const assesseeItem of assessees) {
                const results = yield drizzle_1.db.query.result.findMany({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessment_id, assessment_id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, assessor_id), (0, drizzle_orm_1.eq)(schema_1.result.assessee_id, assesseeItem.id)),
                    limit: 1,
                    orderBy: (0, drizzle_orm_1.desc)(schema_1.result.created_at)
                });
                if (results.length > 0) {
                    result = results[0];
                    break;
                }
            }
            if (!result)
                return 0;
            return result.assessee_id;
        });
    }
    static assesseeNavigation(assessment_id, assessor_id, assessee_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.select().from(schema_1.result)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessment_id, assessment_id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, assessor_id), (0, drizzle_orm_1.eq)(schema_1.result.assessee_id, assessee_id)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.result.created_at))
                .limit(1);
            if (result.length === 0 || !result[0])
                throw new error_1.NotFoundError('Result');
            // Document
            const doc = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.result_id, result[0].id) });
            if (!doc)
                throw new error_1.NotFoundError('Result Document');
            // APL02
            const apl02Header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, result[0].id) });
            if (!apl02Header)
                throw new error_1.NotFoundError('Result APL02 Header');
            const unitCompetencies = yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.assessment_id, result[0].assessment_id));
            let finishedUcApl02Count = 0;
            for (const uc of unitCompetencies) {
                const elements = yield drizzle_1.db.select().from(schema_1.elementApl02).where((0, drizzle_orm_1.eq)(schema_1.elementApl02.uc_id, uc.id));
                let completedElements = 0;
                for (const el of elements) {
                    const row = yield drizzle_1.db.query.resultApl02.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultApl02.result_apl02_id, apl02Header.id), (0, drizzle_orm_1.eq)(schema_1.resultApl02.element_id, el.id)) });
                    if (row)
                        completedElements += 1;
                }
                if (elements.length > 0 && completedElements === elements.length)
                    finishedUcApl02Count++;
            }
            const finishedApl02 = finishedUcApl02Count === unitCompetencies.length;
            // AK01
            const ak01Header = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.result_id, result[0].id) });
            if (!ak01Header)
                throw new error_1.NotFoundError('Result AK01 Header');
            // IA02
            const ia02Header = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.result_id, result[0].id) });
            if (!ia02Header)
                throw new error_1.NotFoundError('Result IA02 Header');
            // IA01
            const ia01Header = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.result_id, result[0].id) });
            if (!ia01Header)
                throw new error_1.NotFoundError('Result IA01 Header');
            const tabs = [
                { name: 'APL-01', status: "Tuntas" },
                { name: 'Data Sertifikasi', status: doc.approved ? "Tuntas" : "Menunggu" },
                { name: 'APL-02', status: (apl02Header.approved_assessor && apl02Header.approved_assessee && finishedApl02) ? "Tuntas" : (apl02Header.approved_assessor && finishedApl02) ? "Butuh Persetujuan" : finishedApl02 ? "Menunggu" : "Belum Tuntas" },
                { name: 'AK-01', status: (ak01Header.approved_assessor && ak01Header.approved_assessee) ? "Tuntas" : (ak01Header.approved_assessor) ? "Butuh Persetujuan" : "Menunggu" },
                { name: 'IA-02', status: (ia02Header.approved_assessor && ia02Header.approved_assessee) ? "Tuntas" : (ia02Header.approved_assessor) ? "Butuh Persetujuan" : "Menunggu" },
                { name: 'IA-01', status: (ia01Header.approved_assessor && ia01Header.approved_assessee) ? "Tuntas" : (ia01Header.approved_assessor) ? "Butuh Persetujuan" : "Menunggu" }
            ];
            const isAnyIa03 = yield drizzle_1.db.query.groupIa03.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.groupIa03.assessment_id, assessment_id) });
            const isAnyIa05 = yield drizzle_1.db.query.ia05Question.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia05Question.assessment_id, assessment_id) });
            // const isAnyIa07 = await db.query.ia07Question.findFirst({ where: eq(ia07QuestionTable.assessment_id, assessment_id) });
            if (isAnyIa03) {
                const ia03Header = yield drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, result[0].id) });
                if (!ia03Header)
                    throw new error_1.NotFoundError('Result IA03 Header');
                const status = (ia03Header.approved_assessor && ia03Header.approved_assessee) ? "Tuntas" : (ia03Header.approved_assessor) ? "Butuh Persetujuan" : "Menunggu";
                tabs.push({ name: 'IA-03', status: status });
            }
            if (isAnyIa05) {
                const ia05Header = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, result[0].id) });
                if (!ia05Header)
                    throw new error_1.NotFoundError('Result IA05 Header');
                const ia05Result = yield drizzle_1.db.query.resultIa05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05.header_id, ia05Header.id) });
                const status = (ia05Header.approved_assessor && ia05Header.approved_assessee) ? "Tuntas" : (ia05Header.approved_assessor) ? "Butuh Persetujuan" : (ia05Result) ? "Menunggu" : "Belum Tuntas";
                tabs.push({ name: 'IA-05', status: status });
            }
            // if (isAnyIa07) tabs.push({ name: 'IA-07', status: 'Belum Selesai' });
            const ak02Header = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, result[0].id) });
            if (!ak02Header)
                throw new error_1.NotFoundError('Result AK02 Header');
            const ak03Header = yield drizzle_1.db.query.resultAk03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.result_id, result[0].id) });
            if (!ak03Header)
                throw new error_1.NotFoundError('Result AK03 Header');
            const ak05Header = yield drizzle_1.db.query.resultAk05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk05.result_id, result[0].id) });
            if (!ak05Header)
                throw new error_1.NotFoundError('Result AK05');
            tabs.push({ name: 'AK-02', status: (ak02Header.approved_assessor && ak02Header.approved_assessee) ? "Tuntas" : (ak02Header.approved_assessor) ? "Butuh Persetujuan" : "Menunggu" }, { name: 'AK-03', status: (ak03Header.comment) ? "Tuntas" : "Belum Tuntas" }, { name: 'AK-05', status: (ak05Header.approved_assessor) ? "Tuntas" : "Menunggu" });
            const enableOtherRoute = (doc.approved && (apl02Header.approved_assessor && apl02Header.is_continue));
            return {
                result_id: result[0].id,
                assessment_id: result[0].assessment_id,
                assessor_id: result[0].assessor_id,
                assessee_id: result[0].assessee_id,
                tuk: result[0].tuk,
                score: result[0].score,
                is_competent: result[0].is_competent,
                created_at: result[0].created_at,
                tabs: tabs,
                enable_other_route: true,
            };
        });
    }
    static assessorNavigation(assessment_id, assessor_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, assessment_id) });
            if (!assessment)
                throw new error_1.NotFoundError('Assessment');
            const tabs = [
                { name: 'APL-02', status: "Menunggu Asesi" },
                { name: 'AK-01', status: "Belum Tuntas" },
                { name: 'IA-02', status: "Belum Tuntas" },
                { name: 'IA-01', status: "Belum Tuntas" }
            ];
            const isAnyIa03 = yield drizzle_1.db.query.groupIa03.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.groupIa03.assessment_id, assessment_id) });
            const isAnyIa05 = yield drizzle_1.db.query.ia05Question.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia05Question.assessment_id, assessment_id) });
            const isAnyIa07 = yield drizzle_1.db.query.ia07Question.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia07Question.assessment_id, assessment_id) });
            if (isAnyIa03)
                tabs.push({ name: 'IA-03', status: "Belum Tuntas" });
            if (isAnyIa05)
                tabs.push({ name: 'IA-05', status: "Menunggu Asesi" });
            if (isAnyIa07)
                tabs.push({ name: 'IA-07', status: "Belum Tuntas" });
            tabs.push({ name: 'AK-02', status: "Belum Tuntas" }, { name: 'AK-03', status: "Menunggu Asesi" }, { name: 'AK-05', status: "Belum Tuntas" }, { name: 'Penilaian', status: "Belum Tuntas" });
            const results = yield drizzle_1.db.select().from(schema_1.result)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessment_id, assessment_id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, assessor_id)));
            if (results.length === 0) {
                return {
                    assessment_id: assessment.id,
                    assessment_code: assessment.code,
                    tabs: tabs,
                };
            }
            for (const tab of tabs) {
                let status = tab.status;
                for (const result of results) {
                    let header = null;
                    switch (tab.name) {
                        case 'APL-02':
                            header = yield drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, result.id) });
                            if (header) {
                                const unitCompetencies = yield drizzle_1.db.select().from(schema_1.ucApl02).where((0, drizzle_orm_1.eq)(schema_1.ucApl02.assessment_id, result.assessment_id));
                                let finishedUcApl02Count = 0;
                                for (const uc of unitCompetencies) {
                                    const elements = yield drizzle_1.db.select().from(schema_1.elementApl02).where((0, drizzle_orm_1.eq)(schema_1.elementApl02.uc_id, uc.id));
                                    let completedElements = 0;
                                    for (const el of elements) {
                                        const row = yield drizzle_1.db.query.resultApl02.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.resultApl02.result_apl02_id, header.id), (0, drizzle_orm_1.eq)(schema_1.resultApl02.element_id, el.id)) });
                                        if (row)
                                            completedElements += 1;
                                    }
                                    if (elements.length > 0 && completedElements === elements.length)
                                        finishedUcApl02Count++;
                                }
                                const finishedApl02 = finishedUcApl02Count === unitCompetencies.length;
                                if (!finishedApl02 && !header.approved_assessor && !header.approved_assessee) {
                                    status = "Menunggu Asesi";
                                }
                                else if (finishedApl02 && !header.approved_assessor && !header.approved_assessee) {
                                    status = "Butuh Persetujuan";
                                }
                                else if (header.approved_assessor && !header.approved_assessee) {
                                    status = "Menunggu Asesi";
                                }
                                else if (header.approved_assessor && header.approved_assessee) {
                                    status = "Tuntas";
                                }
                            }
                            break;
                        case 'AK-01':
                            header = yield drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.result_id, result.id) });
                            if (header) {
                                if (!header.approved_assessor && !header.approved_assessee) {
                                    status = "Belum Tuntas";
                                }
                                else if (header.approved_assessor && !header.approved_assessee) {
                                    status = "Menunggu Asesi";
                                }
                                else if (header.approved_assessor && header.approved_assessee) {
                                    status = "Tuntas";
                                }
                            }
                            break;
                        case 'AK-02':
                            header = yield drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, result.id) });
                            if (header) {
                                if (!header.approved_assessor && !header.approved_assessee) {
                                    status = "Belum Tuntas";
                                }
                                else if (header.approved_assessor && !header.approved_assessee) {
                                    status = "Menunggu Asesi";
                                }
                                else if (header.approved_assessor && header.approved_assessee) {
                                    status = "Tuntas";
                                }
                            }
                            break;
                        case 'AK-03':
                            header = yield drizzle_1.db.query.resultAk03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.result_id, result.id) });
                            if (header) {
                                status = header.comment ? "Tuntas" : "Menunggu Asesi";
                            }
                            break;
                        case 'AK-05':
                            header = yield drizzle_1.db.query.resultAk05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk05.result_id, result.id) });
                            if (header) {
                                status = header.approved_assessor ? "Tuntas" : "Belum Tuntas";
                            }
                            break;
                        case 'IA-01':
                            header = yield drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.result_id, result.id) });
                            if (header) {
                                if (!header.approved_assessor && !header.approved_assessee) {
                                    status = "Belum Tuntas";
                                }
                                else if (header.approved_assessor && !header.approved_assessee) {
                                    status = "Menunggu Asesi";
                                }
                                else if (header.approved_assessor && header.approved_assessee) {
                                    status = "Tuntas";
                                }
                            }
                            break;
                        case 'IA-02':
                            header = yield drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.result_id, result.id) });
                            if (header) {
                                if (!header.approved_assessor && !header.approved_assessee) {
                                    status = "Butuh Persetujuan";
                                }
                                else if (header.approved_assessor && !header.approved_assessee) {
                                    status = "Menunggu Asesi";
                                }
                                else if (header.approved_assessor && header.approved_assessee) {
                                    status = "Tuntas";
                                }
                            }
                            break;
                        case 'IA-03':
                            header = yield drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, result.id) });
                            if (header) {
                                if (!header.approved_assessor && !header.approved_assessee) {
                                    status = "Belum Tuntas";
                                }
                                else if (header.approved_assessor && !header.approved_assessee) {
                                    status = "Menunggu Asesi";
                                }
                                else if (header.approved_assessor && header.approved_assessee) {
                                    status = "Tuntas";
                                }
                            }
                            break;
                        case 'IA-05':
                            header = yield drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, result.id) });
                            if (header) {
                                const ia05Result = yield drizzle_1.db.query.resultIa05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05.header_id, header.id) });
                                if (!ia05Result) {
                                    status = "Menunggu Asesi";
                                }
                                else if (ia05Result && !header.approved_assessor && !header.approved_assessee) {
                                    status = "Butuh Persetujuan";
                                }
                                else if (ia05Result && header.approved_assessor && !header.approved_assessee) {
                                    status = "Menunggu Asesi";
                                }
                                else if (ia05Result && header.approved_assessor && header.approved_assessee) {
                                    status = "Tuntas";
                                }
                            }
                            break;
                        case 'Penilaian':
                            if (result.score !== -1) {
                                status = "Tuntas";
                            }
                            else {
                                status = "Belum Tuntas";
                            }
                            break;
                        // case 'IA-07':
                        //     header = await db.query.resultIa07Header.findFirst({ where: eq(resultIa07HeaderTable.result_id, result.id) });
                        //     if (header) {
                        //         if (!header.approved_assessor && !header.approved_assessee) {
                        //             status = "Butuh Persetujuan";
                        //         } else if (header.approved_assessor && !header.approved_assessee) {
                        //             status = "Menunggu Asesi";
                        //         } else if (header.approved_assessor && header.approved_assessor) {
                        //             status = "Tuntas";
                        //         }
                        //     }
                        //     break;
                    }
                }
                tab.status = status;
            }
            return {
                assessment_id: assessment.id,
                assessment_code: assessment.code,
                tabs: tabs,
            };
        });
    }
    static adminNavigation(result_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield drizzle_1.db.query.result.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id) });
            if (!result)
                throw new error_1.NotFoundError('Result');
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, result.assessment_id) });
            if (!assessment)
                throw new error_1.NotFoundError('Assessment');
            const doc = yield drizzle_1.db.query.resultDoc.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultDoc.result_id, result.id) });
            if (!doc)
                throw new error_1.NotFoundError('Result Document');
            const tabs = [
                { name: 'APL-01', status: 'Tuntas' },
                { name: 'Data Sertifikasi', status: doc.approved ? 'Tuntas' : 'Belum Tuntas' },
                { name: 'APL-02', status: 'Belum Tuntas' },
                { name: 'AK-01', status: 'Belum Tuntas' },
                { name: 'IA-02', status: 'Belum Tuntas' },
                { name: 'IA-01', status: 'Belum Tuntas' }
            ];
            const isAnyIa03 = yield drizzle_1.db.query.groupIa03.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.groupIa03.assessment_id, result.assessment_id) });
            const isAnyIa05 = yield drizzle_1.db.query.ia05Question.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia05Question.assessment_id, result.assessment_id) });
            const isAnyIa07 = yield drizzle_1.db.query.ia07Question.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.ia07Question.assessment_id, result.assessment_id) });
            if (isAnyIa03)
                tabs.push({ name: 'IA-03', status: 'Belum Tuntas' });
            if (isAnyIa05)
                tabs.push({ name: 'IA-05', status: 'Belum Tuntas' });
            if (isAnyIa07)
                tabs.push({ name: 'IA-07', status: 'Belum Tuntas' });
            tabs.push({ name: 'AK-02', status: 'Belum Tuntas' }, { name: 'AK-03', status: 'Belum Tuntas' }, { name: 'AK-05', status: 'Belum Tuntas' });
            const headerConfigs = [
                { name: 'APL-02', findFirst: (args) => drizzle_1.db.query.resultApl02Header.findFirst(args), col: schema_1.resultApl02Header, completed: false },
                { name: 'IA-01', findFirst: (args) => drizzle_1.db.query.resultIa01Header.findFirst(args), col: schema_1.resultIa01Header, completed: false },
                { name: 'IA-02', findFirst: (args) => drizzle_1.db.query.resultIa02Header.findFirst(args), col: schema_1.resultIa02Header, completed: false },
                { name: 'IA-03', findFirst: (args) => drizzle_1.db.query.resultIa03Header.findFirst(args), col: schema_1.resultIa03Header, completed: false },
                { name: 'IA-05', findFirst: (args) => drizzle_1.db.query.resultIa05Header.findFirst(args), col: schema_1.resultIa05Header, completed: false },
                { name: 'IA-07', findFirst: (args) => drizzle_1.db.query.resultIa07Header.findFirst(args), col: schema_1.resultIa07Header, completed: false },
                { name: 'AK-01', findFirst: (args) => drizzle_1.db.query.resultAk01Header.findFirst(args), col: schema_1.resultAk01Header, completed: false },
                { name: 'AK-02', findFirst: (args) => drizzle_1.db.query.resultAk02Header.findFirst(args), col: schema_1.resultAk02Header, completed: false },
                { name: 'AK-03', findFirst: (args) => drizzle_1.db.query.resultAk03Header.findFirst(args), col: schema_1.resultAk03Header, completed: false },
                { name: 'AK-05', findFirst: (args) => drizzle_1.db.query.resultAk05.findFirst(args), col: schema_1.resultAk05, completed: false },
            ];
            for (const config of headerConfigs) {
                let header = yield config.findFirst({ where: (0, drizzle_orm_1.eq)(config.col.result_id, result.id) });
                if (header) {
                    if (config.name === 'AK-05') {
                        if ('approved_assessor' in header && header.approved_assessor)
                            config.completed = true;
                    }
                    else if (config.name === 'AK-03') {
                        if ('comment' in header && header.comment)
                            config.completed = true;
                    }
                    else {
                        if ('approved_assessor' in header && 'approved_assessee' in header && header.approved_assessor && header.approved_assessee)
                            config.completed = true;
                    }
                }
            }
            // Update tab status: only 'Belum Tuntas' or 'Tuntas' (AdminTab)
            for (const config of headerConfigs) {
                const tab = tabs.find((tab) => tab.name === config.name);
                if (tab) {
                    tab.status = config.completed ? 'Tuntas' : 'Belum Tuntas';
                }
            }
            return {
                assessment_id: assessment.id,
                assessment_code: assessment.code,
                tabs: tabs,
            };
        });
    }
    static getAssessmentRecapt(schedule_detail_id, assessor) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const scheduleDetail = yield drizzle_1.db.query.scheduleDetail.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.id, schedule_detail_id), (0, drizzle_orm_1.eq)(schema_1.scheduleDetail.assessor_id, assessor.id)) });
            if (!scheduleDetail)
                throw new error_1.NotFoundError('Schedule Detail');
            const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, scheduleDetail.schedule_id) });
            if (!schedule)
                throw new error_1.NotFoundError('Assessment Schedule');
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, schedule.assessment_id) });
            if (!assessment)
                throw new error_1.NotFoundError('Assessment');
            const occupation = yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) });
            if (!occupation)
                throw new error_1.NotFoundError('Occupation');
            const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) });
            if (!scheme)
                throw new error_1.NotFoundError('Scheme');
            const results = yield drizzle_1.db.select({
                id: schema_1.result.id,
                assessment_id: schema_1.result.assessment_id,
                assessor_id: schema_1.result.assessor_id,
                assessee_id: schema_1.result.assessee_id,
                tuk: schema_1.result.tuk,
                score: schema_1.result.score,
                is_competent: schema_1.result.is_competent,
            }).from(schema_1.result).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessment_id, schedule.assessment_id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, assessor.id)));
            let assessees = [];
            let tuk = (results.length > 0 && results[0].tuk) ? results[0].tuk : 'sewaktu';
            let summary = {
                total_assessees: 0,
                total_competent: 0,
                total_incompetent: 0,
                total_ongoing: 0,
            };
            const assessorUser = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) });
            if (!assessorUser)
                throw new error_1.NotFoundError('Assessor User');
            for (const res of results) {
                const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, res.assessee_id) });
                if (!assessee)
                    continue;
                const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) });
                // Ambil semua header terkait
                const [resultAPL02, resultIA01, resultIA02, resultIA03, resultIA05, resultIA07, resultAK01, resultAK02, resultAK03, resultAK05] = yield Promise.all([
                    drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, res.id) }),
                    drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.result_id, res.id) }),
                    drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.result_id, res.id) }),
                    drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, res.id) }),
                    drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, res.id) }),
                    drizzle_1.db.query.resultIa07Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa07Header.result_id, res.id) }),
                    drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.result_id, res.id) }),
                    drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, res.id) }),
                    drizzle_1.db.query.resultAk03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.result_id, res.id) }),
                    drizzle_1.db.query.resultAk05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk05.result_id, res.id) }),
                ]);
                // Penentuan status
                let status = "On Going";
                if (resultAPL02 && !resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee)
                    status = "Not Competent";
                if (resultIA01 && !resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee)
                    status = "Not Competent";
                if ((resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                    (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                    (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                    (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                    (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee) : true) &&
                    (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                    (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                    (resultAK05 && resultAK05.approved_assessor) &&
                    !resultAK05.is_competent && !res.is_competent)
                    status = "Not Competent";
                if ((resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                    (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                    (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                    (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                    (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee && resultIA05.is_achieved) : true) &&
                    (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                    (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                    (resultAK05 && resultAK05.approved_assessor && resultAK05.is_competent) &&
                    res.is_competent)
                    status = "Competent";
                assessees.push({ id: assessee.id, name: user === null || user === void 0 ? void 0 : user.full_name, status, score: (_a = res.score) !== null && _a !== void 0 ? _a : null });
                summary.total_assessees++;
                if (status === 'Competent')
                    summary.total_competent++;
                if (status === 'Not Competent')
                    summary.total_incompetent++;
                if (status === 'On Going')
                    summary.total_ongoing++;
            }
            return {
                assessment: {
                    id: assessment.id,
                    code: assessment.code,
                    tuk: tuk,
                    schedule: {
                        id: schedule.id,
                        start_date: schedule.start_date,
                        end_date: schedule.end_date,
                        location: scheduleDetail.location,
                        assessor: {
                            id: assessor.id,
                            full_name: assessorUser.full_name
                        }
                    },
                    assessees: assessees,
                    summary: summary
                }
            };
        });
    }
    static getAssessmentResultsForAdmin() {
        return __awaiter(this, void 0, void 0, function* () {
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule).orderBy((0, drizzle_orm_1.desc)(schema_1.assessmentSchedule.created_at));
            const result = [];
            const now = new Date();
            for (const schedule of schedules) {
                const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, schedule.assessment_id) });
                if (!assessment)
                    continue;
                const occupation = yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) });
                if (!occupation)
                    continue;
                const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) });
                // Status schedule
                let status = '';
                if (schedule.start_date <= now && schedule.end_date >= now) {
                    status = 'Sedang Berjalan';
                }
                else if (schedule.end_date < now) {
                    status = 'Selesai';
                }
                else {
                    status = 'Belum Mulai';
                }
                const details = yield drizzle_1.db.select().from(schema_1.scheduleDetail).where((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.schedule_id, schedule.id));
                const detailList = [];
                for (const detail of details) {
                    const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, detail.assessor_id) });
                    if (!assessor)
                        continue;
                    const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) });
                    detailList.push({
                        id: detail.id,
                        location: detail.location,
                        assessor: assessor ? {
                            id: assessor.id,
                            full_name: user === null || user === void 0 ? void 0 : user.full_name,
                            phone_no: assessor.phone_no
                        } : null
                    });
                }
                result.push({
                    id: schedule.id,
                    start_date: schedule.start_date,
                    end_date: schedule.end_date,
                    status,
                    assessment: {
                        id: assessment.id,
                        code: assessment.code,
                        occupation: {
                            id: occupation.id,
                            name: occupation.name,
                            scheme: scheme ? {
                                id: scheme.id,
                                code: scheme.code,
                                name: scheme.name
                            } : null
                        }
                    },
                    schedule_details: detailList
                });
            }
            return result;
        });
    }
    static getAssesseesByAssessmentAndAssessor(assessment_id, assessor_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield drizzle_1.db.select({
                id: schema_1.result.id,
                assessee_id: schema_1.assessee.id,
                is_competent: schema_1.result.is_competent,
                full_name: schema_1.user.full_name,
                created_at: schema_1.result.created_at
            }).from(schema_1.result)
                .innerJoin(schema_1.assessee, (0, drizzle_orm_1.eq)(schema_1.result.assessee_id, schema_1.assessee.id))
                .innerJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessee.user_id, schema_1.user.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessment_id, assessment_id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, assessor_id)))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.user.full_name), (0, drizzle_orm_1.asc)(schema_1.result.created_at));
            let finalResults = [];
            for (const res of results) {
                const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, res.assessee_id) });
                if (!assessee)
                    continue;
                const [resultAPL02, resultIA01, resultIA02, resultIA03, resultIA05, resultIA07, resultAK01, resultAK02, resultAK03, resultAK05] = yield Promise.all([
                    drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, res.id) }),
                    drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.result_id, res.id) }),
                    drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.result_id, res.id) }),
                    drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, res.id) }),
                    drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, res.id) }),
                    drizzle_1.db.query.resultIa07Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa07Header.result_id, res.id) }),
                    drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.result_id, res.id) }),
                    drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, res.id) }),
                    drizzle_1.db.query.resultAk03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk03Header.result_id, res.id) }),
                    drizzle_1.db.query.resultAk05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk05.result_id, res.id) }),
                ]);
                let status = "Sedang Berjalan";
                if (resultAPL02 && !resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee)
                    status = "Belum Kompeten";
                if (resultIA01 && !resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee)
                    status = "Belum Kompeten";
                if ((resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                    (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                    (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                    (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                    (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee) : true) &&
                    (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                    (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                    (resultAK05 && resultAK05.approved_assessor) &&
                    !resultAK05.is_competent && !res.is_competent)
                    status = "Belum Kompeten";
                if ((resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                    (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                    (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                    (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                    (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee && resultIA05.is_achieved) : true) &&
                    (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                    (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                    (resultAK05 && resultAK05.approved_assessor && resultAK05.is_competent) &&
                    res.is_competent)
                    status = "Kompeten";
                finalResults.push({
                    id: res.id,
                    assessee_id: res.assessee_id,
                    full_name: res.full_name,
                    status: status,
                    created_at: res.created_at,
                });
            }
            return finalResults;
        });
    }
    static generateRecaptPDF(assessment) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedule = assessment.schedule;
            // Format date
            const start = new Date(schedule.start_date);
            const end = new Date(schedule.end_date);
            const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
            const months = [
                "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                "Juli", "Agustus", "September", "Oktober", "November", "Desember"
            ];
            const startDay = days[start.getDay()];
            const startDate = start.getDate();
            const startMonth = months[start.getMonth()];
            const startYear = start.getFullYear();
            const startHour = (`0${start.getHours()}`).slice(-2);
            const startMinute = (`0${start.getMinutes()}`).slice(-2);
            const endHour = (`0${end.getHours()}`).slice(-2);
            const endMinute = (`0${end.getMinutes()}`).slice(-2);
            // === Create a new PDF document ===
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const page = pdfDoc.addPage([612, 936]);
            // === Fonts ===
            const font = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            const fontBold = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
            const iconFont = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.ZapfDingbats);
            let y = page.getHeight() - 50;
            const fontSizeSmall = 11;
            const lineGap = 4;
            const lLineGap = 12;
            const xlLineGap = 20;
            // === HEADER ===
            const image = "../../public/images/kop-surat-lsp-smkn24j.png";
            y = yield (0, pdfAssets_helper_1.kopSurat)(pdfDoc, page, image);
            // === TITLE ===
            const headerText = [
                "BERITA ACARA",
                "HASIL REKOMENDASI PENILAIAN",
                "UJI KOMPETENSI KEAHLIAN",
            ];
            headerText.forEach(text => {
                y = (0, pdfDraw_helper_1.drawParagraph)(page, text, 40, y, fontBold, fontSizeSmall, "center");
            });
            // === INTRODUCTION PARAGRAPH ===
            const textParts = [
                { text: "Pada hari ini ", font },
                { text: `${startDay}, `, font: fontBold },
                { text: "tanggal ", font },
                { text: `${startDate} `, font: fontBold },
                { text: "bulan ", font },
                { text: `${startMonth} `, font: fontBold },
                { text: "tahun ", font },
                { text: `${startYear}, `, font: fontBold },
                { text: "jam ", font },
                { text: `${startHour}:${startMinute} `, font: fontBold },
                { text: "sampai dengan jam ", font },
                { text: `${endHour}:${endMinute}, `, font: fontBold },
                { text: "bertempat TUK ", font },
                { text: `${assessment.tuk}, `, font: fontBold },
                { text: "ruang ", font },
                { text: `${assessment.schedule.location}, `, font: fontBold },
                { text: "telah dilaksanakan pemberian rekomendasi penilaian terhadap peserta yang namanya tercantum dibawah ini:", font }
            ];
            y = (0, pdfDraw_helper_1.drawMixedParagraph)(page, textParts, 40, y - lLineGap, 12, (0, pdf_lib_1.rgb)(0, 0, 0), 540, 18);
            y -= xlLineGap;
            // === TABLE CONTENT ===
            const tableData = assessment.assessees.map((assessee, index) => ({
                no: index + 1,
                name: assessee.name,
                k: assessee.status === "Competent" ? "✓" : "",
                bk: assessee.status === "Not Competent" ? "✓" : "",
            }));
            const tableTop = y + 7;
            const rowHeight = 25;
            const colWidths = [30, 260, 110, 110];
            const headerColor = (0, pdf_lib_1.rgb)(1, 0.95, 0.7);
            // === TABLE HEADER ===
            let x = 50;
            // Column No
            page.drawRectangle({
                x, y: tableTop - rowHeight * 2,
                width: colWidths[0], height: rowHeight * 3 - 11,
                color: headerColor, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1
            });
            page.drawText("No", { x: x + 8, y: tableTop - rowHeight + 2, size: fontSizeSmall, font: fontBold });
            x += colWidths[0];
            // Column Name
            page.drawRectangle({
                x, y: tableTop - rowHeight * 2,
                width: colWidths[1], height: rowHeight * 3 - 11,
                color: headerColor, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1
            });
            page.drawText("Nama Peserta", { x: x + colWidths[1] / 2 - 40, y: tableTop - rowHeight + 2, size: fontSizeSmall, font: fontBold });
            x += colWidths[1];
            // Kolom Rekomendasi (gabungan K & BK)
            page.drawRectangle({
                x, y: tableTop - rowHeight * 2 + 11,
                width: colWidths[2] + colWidths[3],
                height: rowHeight * 3 - 22,
                color: headerColor, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1
            });
            page.drawText("REKOMENDASI", { x: x + (colWidths[2] + colWidths[3]) / 2 - 45, y: tableTop - 5, size: fontSizeSmall, font: fontBold });
            page.drawText("ASISTEN PEMROGRAMAN JUNIOR", { x: x + 15, y: tableTop - rowHeight + 7, size: fontSizeSmall, font: fontBold });
            // Subkolom K
            page.drawRectangle({
                x, y: tableTop - rowHeight * 2,
                width: colWidths[2],
                height: rowHeight,
                color: headerColor,
                borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                borderWidth: 1
            });
            page.drawText("K", { x: x + colWidths[2] / 2 - 2, y: tableTop - rowHeight * 2 + 7, size: fontSizeSmall, font: fontBold });
            // Subkolom BK
            page.drawRectangle({
                x: x + colWidths[2],
                y: tableTop - rowHeight * 2,
                width: colWidths[3],
                height: rowHeight,
                color: headerColor,
                borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                borderWidth: 1
            });
            page.drawText("BK", { x: x + colWidths[2] + colWidths[3] / 2 - 6, y: tableTop - rowHeight * 2 + 7, size: fontSizeSmall, font: fontBold });
            // === TABLE CONTENT ===
            let currentY = tableTop - rowHeight * 3;
            tableData.forEach(row => {
                let x = 50;
                page.drawRectangle({ x, y: currentY, width: colWidths[0], height: rowHeight, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                page.drawText(String(row.no), { x: x + 8, y: currentY + 7, size: fontSizeSmall, font });
                x += colWidths[0];
                page.drawRectangle({ x, y: currentY, width: colWidths[1], height: rowHeight, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                page.drawText(row.name, { x: x + 5, y: currentY + 7, size: fontSizeSmall, font });
                x += colWidths[1];
                page.drawRectangle({ x, y: currentY, width: colWidths[2], height: rowHeight, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                page.drawText(row.k, { x: x + colWidths[2] / 2 - 2, y: currentY + 7, size: fontSizeSmall, font: iconFont });
                x += colWidths[2];
                page.drawRectangle({ x, y: currentY, width: colWidths[3], height: rowHeight, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1 });
                page.drawText(row.bk, { x: x + colWidths[3] / 2 - 2, y: currentY + 7, size: fontSizeSmall, font: iconFont });
                currentY -= rowHeight;
            });
            y = currentY;
            // === NOTE ===
            y = (0, pdfDraw_helper_1.drawParagraph)(page, "Selama pelaksanaan rekomendasi telah terjadi hal penting sebagai berikut :", 50, y, font, fontSizeSmall) + lLineGap;
            const boxSize = 12;
            const boxX = 50;
            let boxY = y - boxSize * 2 + 10 - 6;
            page.drawRectangle({ x: boxX, y: boxY - boxSize + 10, width: boxSize, height: boxSize, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1, color: (0, pdf_lib_1.rgb)(1, 1, 1) });
            (0, pdfDraw_helper_1.drawParagraph)(page, "Tertib dan lancar", boxX + boxSize + 5, boxY, font, fontSizeSmall);
            boxY -= lineGap;
            page.drawRectangle({ x: boxX, y: boxY - boxSize * 2 + 10, width: boxSize, height: boxSize, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1, color: (0, pdf_lib_1.rgb)(1, 1, 1) });
            (0, pdfDraw_helper_1.drawParagraph)(page, "Tertib dan lancar dengan", boxX + boxSize + 5, boxY - boxSize, font, fontSizeSmall);
            boxY -= lineGap;
            (0, pdfDraw_helper_1.drawParagraph)(page, "catatan : ...........................................................................................................................................", boxX + boxSize + 5, boxY - boxSize * 2, font, fontSizeSmall);
            (0, pdfDraw_helper_1.drawParagraph)(page, "................................................................................................................................................................", 50, boxY - boxSize * 3, font, fontSizeSmall);
            y = boxY - boxSize * 4 - lineGap;
            (0, pdfDraw_helper_1.drawParagraph)(page, "Demikianlah, berita acara ini dibuat sesuai dengan kejadian yang sebenernya, untuk digunakan sebagaimana mestinya.", 50, y, font, fontSizeSmall);
            // === SIGNATURE ===
            const signatureX = 50;
            let signatureY = y - 50;
            const signatureWidth = 60;
            const signatureDate = `Jakarta, ${startDate + " " + startMonth + " " + startYear}`;
            const assessor_name = assessment.schedule.assessor.full_name;
            (0, pdfDraw_helper_1.drawParagraph)(page, `${signatureDate}`, signatureX, signatureY, font, fontSizeSmall, "right");
            (0, pdfDraw_helper_1.drawParagraph)(page, `${assessor_name}`, signatureX, signatureY - 15, font, fontSizeSmall, "right");
            signatureY -= 20;
            const signatureNameLength = font.widthOfTextAtSize(assessor_name, fontSizeSmall);
            const qrData = (0, hashids_1.getAssessorUrl)(assessment.schedule.assessor.id);
            const qrCode = yield (0, pdfAssets_helper_1.embedQrCode)(pdfDoc, qrData);
            page.drawImage(qrCode, { x: page.getWidth() - signatureWidth * 2 - (signatureNameLength / 2) + (signatureWidth / 2) + 9, y: signatureY - signatureWidth, width: signatureWidth, height: signatureWidth });
            const pdfBytes = yield pdfDoc.save();
            return pdfBytes;
        });
    }
    static getResultsByAssessmentGroupedByAssessor(assessmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Query untuk mendapatkan semua data yang dibutuhkan
            const results = yield drizzle_1.db
                .select({
                // Assessment fields
                assessment_id: schema_1.assessment.id,
                assessment_code: schema_1.assessment.code,
                assessment_created_at: schema_1.assessment.created_at,
                assessment_updated_at: schema_1.assessment.updated_at,
                // Occupation fields
                occupation_id: schema_1.occupation.id,
                occupation_name: schema_1.occupation.name,
                occupation_scheme_id: schema_1.occupation.scheme_id,
                // Scheme fields
                scheme_id: schema_1.scheme.id,
                scheme_code: schema_1.scheme.code,
                scheme_name: schema_1.scheme.name,
                // Assessor fields
                assessor_id: schema_1.assessor.id,
                assessor_no_reg_met: schema_1.assessor.no_reg_met,
                // Assessor user fields
                assessor_user_full_name: schema_1.user.full_name,
                // Result fields
                result_id: schema_1.result.id,
                result_score: schema_1.result.score,
                result_is_competent: schema_1.result.is_competent,
                result_tuk: schema_1.result.tuk,
                result_created_at: schema_1.result.created_at,
                result_updated_at: schema_1.result.updated_at,
                // Assessee fields
                assessee_id: schema_1.assessee.id,
                // Assessee user fields (untuk nama assessee)
                assessee_user_id: schema_1.assessee.user_id,
            })
                .from(schema_1.result)
                .innerJoin(schema_1.assessment, (0, drizzle_orm_1.eq)(schema_1.result.assessment_id, schema_1.assessment.id))
                .innerJoin(schema_1.occupation, (0, drizzle_orm_1.eq)(schema_1.assessment.occupation_id, schema_1.occupation.id))
                .innerJoin(schema_1.scheme, (0, drizzle_orm_1.eq)(schema_1.occupation.scheme_id, schema_1.scheme.id))
                .innerJoin(schema_1.assessor, (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, schema_1.assessor.id))
                .innerJoin(schema_1.user, (0, drizzle_orm_1.eq)(schema_1.assessor.user_id, schema_1.user.id))
                .innerJoin(schema_1.assessee, (0, drizzle_orm_1.eq)(schema_1.result.assessee_id, schema_1.assessee.id))
                .where((0, drizzle_orm_1.eq)(schema_1.assessment.id, assessmentId));
            if (results.length === 0) {
                return null;
            }
            const assesseeUserIds = [...new Set(results.map(r => r.assessee_user_id))];
            const assesseeUsers = yield drizzle_1.db
                .select({
                id: schema_1.user.id,
                full_name: schema_1.user.full_name,
            })
                .from(schema_1.user)
                .where((0, drizzle_orm_1.eq)(schema_1.user.id, assesseeUserIds[0]) // akan di-map manual di bawah
            );
            const assesseeUserMap = new Map();
            for (const userId of assesseeUserIds) {
                const user = yield drizzle_1.db
                    .select({ full_name: schema_1.user.full_name })
                    .from(schema_1.user)
                    .where((0, drizzle_orm_1.eq)(schema_1.user.id, userId))
                    .limit(1);
                if (user[0]) {
                    assesseeUserMap.set(userId, user[0].full_name);
                }
            }
            const assessorMap = new Map();
            results.forEach(row => {
                if (!assessorMap.has(row.assessor_id)) {
                    assessorMap.set(row.assessor_id, {
                        id: row.assessor_id,
                        full_name: row.assessor_user_full_name,
                        no_reg_met: row.assessor_no_reg_met,
                        assessees: [],
                    });
                }
                assessorMap.get(row.assessor_id).assessees.push({
                    result_id: row.result_id,
                    score: row.result_score,
                    is_competent: row.result_is_competent,
                    tuk: row.result_tuk,
                    created_at: row.result_created_at,
                    updated_at: row.result_updated_at,
                    assessee_id: row.assessee_id,
                    assessee_name: assesseeUserMap.get(row.assessee_user_id) || '',
                });
            });
            const firstRow = results[0];
            const finalResult = {
                id: firstRow.assessment_id,
                code: firstRow.assessment_code,
                occupation_id: firstRow.occupation_id,
                created_at: firstRow.assessment_created_at,
                updated_at: firstRow.assessment_updated_at,
                occupation: {
                    id: firstRow.occupation_id,
                    name: firstRow.occupation_name,
                    scheme_id: firstRow.occupation_scheme_id,
                    scheme: {
                        id: firstRow.scheme_id,
                        code: firstRow.scheme_code,
                        name: firstRow.scheme_name,
                    },
                },
                assessors: Array.from(assessorMap.values()),
            };
            return finalResult;
        });
    }
    static generateUkkEvaluationPdf(assessment_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const existingAssessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, assessment_id) });
            if (!existingAssessment) {
                throw new error_1.NotFoundError('Assessment not found');
            }
            const results = yield this.getResultsByAssessmentGroupedByAssessor(assessment_id);
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const font = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            const fontBold = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
            const image = "../../public/images/kop-surat-lsp-smkn24j.png";
            for (let assessorIdx = 0; assessorIdx < (!results ? 0 : results === null || results === void 0 ? void 0 : results.assessors.length); assessorIdx++) {
                let { page, y } = yield (0, helper_1.createNewPage)(pdfDoc, image, fontBold);
                // === Fonts === 
                const iconFont = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.ZapfDingbats);
                const fontSizeSmall = 11;
                const fontSizeLarge = 14;
                const rowHeight = 24;
                // === TITLE ===
                const headerText = [
                    "FORM PENILAIAN",
                    "UJI KOMPETENSI KEAHLIAN",
                ];
                headerText.forEach(text => {
                    y = (0, pdfDraw_helper_1.drawParagraph)(page, text, 40, y, fontBold, fontSizeLarge, "center");
                });
                y += 8;
                const colWidths = [30, 265, 75, 75, 75];
                const headerColor = (0, pdf_lib_1.rgb)(1, 0.95, 0.7);
                let startX = 40;
                const scoreHeaderTexts = [`SKOR PENILAIAN`, (_a = results === null || results === void 0 ? void 0 : results.occupation.name.toUpperCase()) !== null && _a !== void 0 ? _a : "OKUPASI"];
                const scoreHeaderHeights = scoreHeaderTexts.map((cell) => {
                    const words = cell.split(" ");
                    let line = "";
                    let lines = [];
                    for (const word of words) {
                        const testLine = line ? line + " " + word : word;
                        const testWidth = font.widthOfTextAtSize(testLine, fontSizeSmall);
                        if (testWidth > colWidths[2] + colWidths[3] + colWidths[4] - 8) {
                            lines.push(line);
                            line = word;
                        }
                        else {
                            line = testLine;
                        }
                    }
                    if (line)
                        lines.push(line);
                    return Math.max(rowHeight, lines.length * (9 + 4) + 6);
                });
                const scoreHeaderWidth = colWidths[2] + colWidths[3] + colWidths[4];
                let scoreHeaderX = startX + colWidths[0] + colWidths[1];
                let scoreHeaderY = y;
                // === Kolom Gabungan Rekomendasi (K, BK, SK) ===
                let scoreTextY = scoreHeaderY;
                page.drawRectangle({
                    x: scoreHeaderX, y: scoreHeaderY - scoreHeaderHeights.reduce((a, b) => a + b, 0),
                    width: scoreHeaderWidth,
                    height: scoreHeaderHeights.reduce((a, b) => a + b, 0) + fontSizeSmall / 2 - 16,
                    color: headerColor, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1
                });
                (0, helper_1.drawCellText)(page, scoreHeaderTexts[0], scoreHeaderX, scoreTextY - scoreHeaderHeights.reduce((a, b) => a + b, 0) / 2 + fontSizeSmall / 2 + 10, scoreHeaderWidth, scoreHeaderHeights[0], fontBold, fontSizeSmall, "center");
                scoreTextY -= scoreHeaderHeights[0] - fontSizeSmall / 2 - 4;
                (0, helper_1.drawCellText)(page, scoreHeaderTexts[1], scoreHeaderX, scoreTextY - scoreHeaderHeights.reduce((a, b) => a + b, 0) / 2 + fontSizeSmall / 2 + 10, scoreHeaderWidth, scoreHeaderHeights[1], fontBold, fontSizeSmall, "center");
                scoreHeaderY -= scoreHeaderHeights.reduce((a, b) => a + b, 0) + fontSizeSmall / 2 - 8;
                const subColumnScoreTexts = ['< 85   BELUM KOMPETEN', '85 - 90 KOMPETEN', '91 - 100 SANGAT KOMPETEN'];
                const subColumnScoreHeights = subColumnScoreTexts.map((cell, idx) => {
                    const words = cell.split(" ");
                    let line = "";
                    let lines = [];
                    for (const word of words) {
                        const testLine = line ? line + " " + word : word;
                        const testWidth = font.widthOfTextAtSize(testLine, fontSizeSmall);
                        if (testWidth > colWidths[idx] - 8) {
                            lines.push(line);
                            line = word;
                        }
                        else {
                            line = testLine;
                        }
                    }
                    if (line)
                        lines.push(line);
                    return lines.length * (9 + 4) + 6;
                });
                const maxSubColumnScoreHeight = Math.max(rowHeight, ...subColumnScoreHeights);
                subColumnScoreTexts.forEach((cell, idx) => {
                    const w = colWidths[idx + 2];
                    page.drawRectangle({
                        x: scoreHeaderX,
                        y: scoreHeaderY - maxSubColumnScoreHeight + fontSizeSmall / 2,
                        width: w,
                        height: maxSubColumnScoreHeight - fontSizeSmall / 2,
                        color: headerColor,
                        borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                        borderWidth: 1,
                    });
                    (0, helper_1.drawCellText)(page, cell, scoreHeaderX, scoreHeaderY - 2, w, maxSubColumnScoreHeight - fontSizeSmall / 2 - 16, fontBold, fontSizeSmall, "center");
                    scoreHeaderX += w;
                });
                scoreHeaderY -= maxSubColumnScoreHeight - fontSizeSmall / 2;
                const headerTexts = ['NO', 'NAMA PESERTA'];
                headerTexts.forEach((cell, idx) => {
                    const w = colWidths[idx];
                    page.drawRectangle({
                        x: startX,
                        y: scoreHeaderY,
                        width: w,
                        height: y - scoreHeaderY + fontSizeSmall / 2 - 16,
                        color: headerColor, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1
                    });
                    (0, helper_1.drawCellText)(page, cell, startX, scoreHeaderY + (y - scoreHeaderY + fontSizeSmall / 2) / 2 + 4, w, rowHeight - fontSizeSmall / 2 - 16, fontBold, fontSizeSmall, "center");
                    startX += w;
                });
                y = scoreHeaderY;
                startX = 40;
                const data = (_b = results === null || results === void 0 ? void 0 : results.assessors[assessorIdx].assessees.map((assessee, idx) => {
                    return [`${idx + 1}.`, assessee.assessee_name, assessee.score < 85 && assessee.score >= 0 ? assessee.score.toString() : assessee.score < 0 ? "" : "", assessee.score >= 85 && assessee.score <= 90 ? assessee.score.toString() : "", assessee.score > 90 ? assessee.score.toString() : ""];
                })) !== null && _b !== void 0 ? _b : [];
                for (let i = 0; i < (data.length < 12 ? 12 : data.length); i++) {
                    let row = data[i];
                    if (!row)
                        row = [`${i + 1}.`, '', '', '', ''];
                    let x = startX;
                    let maxRowHeight = rowHeight;
                    // ukur tinggi maksimum row (karena ada teks wrap)
                    const cellHeights = row.map((cell, idx) => {
                        const safeCell = cell !== null && cell !== void 0 ? cell : ""; // fallback
                        const words = safeCell.split(" ");
                        let line = "";
                        let lines = [];
                        for (const word of words) {
                            const testLine = line ? line + " " + word : word;
                            const testWidth = font.widthOfTextAtSize(testLine, fontSizeSmall);
                            if (testWidth > colWidths[idx] - 8) {
                                lines.push(line);
                                line = word;
                            }
                            else {
                                line = testLine;
                            }
                        }
                        if (line)
                            lines.push(line);
                        return lines.length * (9 + 4) + 6;
                    });
                    maxRowHeight = Math.max(rowHeight, ...cellHeights);
                    // draw cell
                    row.forEach((cell, idx) => {
                        const w = colWidths[idx];
                        page.drawRectangle({
                            x,
                            y: y - maxRowHeight,
                            width: w,
                            height: maxRowHeight,
                            borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                            borderWidth: 1,
                        });
                        const align = idx === 0 || idx === 1 ? "left" : "center";
                        (0, helper_1.drawCellText)(page, cell, x, y, w, maxRowHeight, font, fontSizeSmall, align);
                        x += w;
                    });
                    y -= maxRowHeight;
                }
                y -= 24;
                const l2LineGap = 8;
                const lLineGap = 12;
                // === NOTE ===
                y = (0, pdfDraw_helper_1.drawParagraph)(page, "Selama pelaksanaan uji kompetensi keahlian telah terjadi hal penting sebagai berikut :", 50, y, font, fontSizeSmall) + lLineGap;
                const boxSize = 12;
                const boxX = 50;
                let boxY = y - boxSize * 2 + 10 - 6;
                page.drawRectangle({ x: boxX, y: boxY - boxSize + 10, width: boxSize, height: boxSize, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1, color: (0, pdf_lib_1.rgb)(1, 1, 1) });
                (0, pdfDraw_helper_1.drawParagraph)(page, "Tertib dan lancar", boxX + boxSize + 5, boxY, font, fontSizeSmall);
                boxY -= l2LineGap;
                page.drawRectangle({ x: boxX, y: boxY - boxSize * 2 + 10, width: boxSize, height: boxSize, borderColor: (0, pdf_lib_1.rgb)(0, 0, 0), borderWidth: 1, color: (0, pdf_lib_1.rgb)(1, 1, 1) });
                (0, pdfDraw_helper_1.drawParagraph)(page, "Tertib dan lancar dengan", boxX + boxSize + 5, boxY - boxSize, font, fontSizeSmall);
                boxY -= l2LineGap;
                y = (0, pdfDraw_helper_1.drawParagraph)(page, "catatan : ....................................................................................................................................", boxX + boxSize + 5, boxY - boxSize * 2, font, fontSizeSmall);
                boxY -= l2LineGap;
                y = (0, pdfDraw_helper_1.drawParagraph)(page, "............................................................................................................................................................", boxX + boxSize + 5, boxY - boxSize * 3, font, fontSizeSmall);
                (0, pdfDraw_helper_1.drawParagraph)(page, "Demikian, form penilaian ini dibuat sesuai dengan kejadian yang sebenarnya, untuk digunakan sebagaimana mestinya.", 50, y, font, fontSizeSmall);
                // === SIGNATURE ===
                const signatureX = 50;
                let signatureY = y - 50;
                const signatureWidth = 60;
                const date = `${(0, date_helper_1.formatDay)(new Date())} ${(0, date_helper_1.formatDate)(new Date())}`;
                const signatureDate = `Jakarta, ${date}`;
                const assessor_name = results === null || results === void 0 ? void 0 : results.assessors[assessorIdx].full_name;
                const signatureNameLength = font.widthOfTextAtSize((_c = results === null || results === void 0 ? void 0 : results.assessors[assessorIdx].full_name) !== null && _c !== void 0 ? _c : "", fontSizeSmall);
                (0, pdfDraw_helper_1.drawParagraph)(page, `${signatureDate}`, signatureX, signatureY, font, fontSizeSmall, "right");
                y = (0, pdfDraw_helper_1.drawParagraph)(page, `Assessor`, signatureX + (signatureNameLength / 2) - (signatureWidth / 2), signatureY - 15, font, fontSizeSmall, "right");
                signatureY -= 20;
                const qrData = (0, hashids_1.getAssessorUrl)((_d = results === null || results === void 0 ? void 0 : results.assessors[assessorIdx].id) !== null && _d !== void 0 ? _d : 0);
                const qrCode = yield (0, pdfAssets_helper_1.embedQrCode)(pdfDoc, qrData);
                page.drawImage(qrCode, { x: page.getWidth() - signatureWidth * 2 - (signatureNameLength / 2) + (signatureWidth / 2) + 9, y: signatureY - signatureWidth, width: signatureWidth, height: signatureWidth });
                (0, pdfDraw_helper_1.drawParagraph)(page, `${assessor_name}`, signatureX, signatureY - signatureWidth - 12, font, fontSizeSmall, "right");
            }
            return yield pdfDoc.save();
        });
    }
    static inputScore(result_id, score) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingResults = yield drizzle_1.db.query.result.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id),
            });
            if (!existingResults)
                throw new error_1.NotFoundError('Result');
            yield drizzle_1.db
                .update(schema_1.result)
                .set({ score })
                .where((0, drizzle_orm_1.eq)(schema_1.result.id, result_id));
            const resultUpdated = yield drizzle_1.db.query.result.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.result.id, result_id),
            });
            return resultUpdated;
        });
    }
}
exports.AssessmentService = AssessmentService;
