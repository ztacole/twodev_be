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
const db_1 = require("../../config/db");
class AssessmentService {
    static createAssessment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const scheme = yield db_1.prisma.scheme.findUnique({
                where: {
                    id: data.scheme_id
                }
            });
            if (!scheme) {
                throw new error_1.NotFoundError("Scheme");
            }
            const existingAssessment = yield db_1.prisma.assessment.findFirst({
                where: {
                    code: data.code
                }
            });
            if (existingAssessment) {
                throw new error_1.DuplicateEntryError("Assessment code", data.code);
            }
            let occupation = yield db_1.prisma.occupation.findFirst({
                where: {
                    name: data.occupation_name,
                    scheme_id: data.scheme_id
                }
            });
            if (!occupation) {
                occupation = yield db_1.prisma.occupation.create({
                    data: {
                        name: data.occupation_name,
                        scheme_id: data.scheme_id
                    }
                });
            }
            // Create assessment
            const assessment = yield db_1.prisma.assessment.create({
                data: {
                    occupation_id: Number(occupation.id),
                    code: data.code,
                    uc_apl02s: {
                        create: ((_a = data.uc_apl02s) !== null && _a !== void 0 ? _a : []).map(unit => {
                            var _a;
                            return ({
                                unit_code: unit.unit_code,
                                title: unit.title,
                                elements: {
                                    create: ((_a = unit.elements) !== null && _a !== void 0 ? _a : []).map(element => {
                                        var _a;
                                        return ({
                                            title: element.title,
                                            details: {
                                                create: ((_a = element.details) !== null && _a !== void 0 ? _a : []).map(detail => ({
                                                    description: detail.description
                                                }))
                                            }
                                        });
                                    })
                                }
                            });
                        })
                    },
                    groups_ia01: {
                        create: ((_b = data.groups_ia01) !== null && _b !== void 0 ? _b : []).map(group => {
                            var _a;
                            return ({
                                name: group.name,
                                units: {
                                    create: ((_a = group.units) !== null && _a !== void 0 ? _a : []).map(unit => {
                                        var _a;
                                        return ({
                                            unit_code: unit.unit_code,
                                            title: unit.title,
                                            elements: {
                                                create: ((_a = unit.elements) !== null && _a !== void 0 ? _a : []).map(element => {
                                                    var _a;
                                                    return ({
                                                        title: element.title,
                                                        details: {
                                                            create: ((_a = element.details) !== null && _a !== void 0 ? _a : []).map(detail => ({
                                                                description: detail.description,
                                                                benchmark: detail.benchmark
                                                            }))
                                                        }
                                                    });
                                                })
                                            }
                                        });
                                    })
                                }
                            });
                        })
                    },
                    groups_ia02: {
                        create: ((_c = data.groups_ia02) !== null && _c !== void 0 ? _c : []).map(group => {
                            var _a, _b;
                            return ({
                                name: group.name,
                                scenario: group.scenario,
                                duration: group.duration,
                                units: {
                                    create: ((_a = group.units) !== null && _a !== void 0 ? _a : []).map(unit => ({
                                        unit_code: unit.unit_code,
                                        title: unit.title,
                                    }))
                                },
                                tools: {
                                    create: ((_b = group.tools) !== null && _b !== void 0 ? _b : []).map(tool => ({
                                        name: tool.name
                                    }))
                                }
                            });
                        })
                    },
                    groups_ia03: {
                        create: ((_d = data.groups_ia03) !== null && _d !== void 0 ? _d : []).map(group => {
                            var _a, _b;
                            return ({
                                name: group.name,
                                units: {
                                    create: ((_a = group.units) !== null && _a !== void 0 ? _a : []).map(unit => ({
                                        unit_code: unit.unit_code,
                                        title: unit.title,
                                    }))
                                },
                                qa_ia03: {
                                    create: ((_b = group.qa_ia03) !== null && _b !== void 0 ? _b : []).map(question => ({
                                        question: question.question,
                                    }))
                                }
                            });
                        })
                    },
                    ia05_questions: {
                        create: ((_e = data.ia05_questions) !== null && _e !== void 0 ? _e : []).map(question => {
                            var _a;
                            return ({
                                order: question.order,
                                question: question.question,
                                options: {
                                    create: ((_a = question.options) !== null && _a !== void 0 ? _a : []).map(option => ({
                                        option: option.option,
                                        is_answer: option.is_answer
                                    }))
                                }
                            });
                        })
                    },
                    ia07_questions: {
                        create: ((_f = data.ia07_questions) !== null && _f !== void 0 ? _f : []).map(question => ({
                            question: question.question,
                            answer_key: question.answer_key
                        }))
                    }
                },
                include: {
                    occupation: true,
                    uc_apl02s: {
                        include: {
                            elements: {
                                include: {
                                    details: true
                                }
                            }
                        }
                    },
                    groups_ia01: {
                        include: {
                            units: {
                                include: {
                                    elements: {
                                        include: {
                                            details: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    groups_ia02: {
                        include: {
                            units: true,
                            tools: true
                        }
                    },
                    groups_ia03: {
                        include: {
                            units: true,
                            qa_ia03: true
                        }
                    },
                    ia05_questions: {
                        include: {
                            options: true
                        }
                    },
                    ia07_questions: true
                }
            });
            return assessment;
        });
    }
    static getAssessments() {
        return __awaiter(this, void 0, void 0, function* () {
            const assessments = yield db_1.prisma.assessment.findMany({
                include: {
                    occupation: {
                        include: {
                            scheme: true
                        }
                    }
                }
            });
            return assessments;
        });
    }
    static getAssessmentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessment = yield db_1.prisma.assessment.findUnique({
                where: { id },
                include: {
                    occupation: {
                        include: {
                            scheme: true
                        }
                    },
                    uc_apl02s: {
                        include: {
                            elements: {
                                include: {
                                    details: true
                                }
                            }
                        }
                    },
                    groups_ia01: {
                        include: {
                            units: {
                                include: {
                                    elements: {
                                        include: {
                                            details: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    groups_ia02: {
                        include: {
                            units: true,
                            tools: true
                        }
                    },
                    groups_ia03: {
                        include: {
                            units: true,
                            qa_ia03: true
                        }
                    },
                    ia05_questions: {
                        include: {
                            options: true
                        }
                    },
                    ia07_questions: true
                }
            });
            if (!assessment) {
                throw new error_1.NotFoundError('Assessment');
            }
            return assessment;
        });
    }
    static deleteAssessment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAssessment = yield db_1.prisma.assessment.findUnique({
                where: { id }
            });
            if (!existingAssessment) {
                throw new error_1.NotFoundError('Assessment not found');
            }
            return db_1.prisma.assessment.delete({
                where: { id }
            });
        });
    }
    static getAssessmentResultDetails(resultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    assessment: {
                        include: {
                            occupation: {
                                include: {
                                    scheme: true
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
                }
            });
            if (!result) {
                throw new error_1.NotFoundError('Result');
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
                created_at: result.created_at
            };
        });
    }
}
exports.AssessmentService = AssessmentService;
