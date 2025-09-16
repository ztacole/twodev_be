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
exports.PublicService = void 0;
const drizzle_1 = require("../../config/drizzle");
const error_1 = require("../../common/error");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class PublicService {
    static getAssesseeById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessee = yield drizzle_1.db.query.assessee.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessee.id, id) });
            if (!assessee) {
                throw new error_1.NotFoundError("Assessee not found");
            }
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessee.user_id) });
            const jobs = yield drizzle_1.db.select().from(schema_1.assesseeJob).where((0, drizzle_orm_1.eq)(schema_1.assesseeJob.assessee_id, id));
            return {
                id: assessee.id,
                full_name: (user === null || user === void 0 ? void 0 : user.full_name) || "",
                identity_number: assessee.identity_number,
                birth_date: assessee.birth_date,
                birth_location: assessee.birth_location,
                gender: assessee.gender,
                nationality: assessee.nationality,
                phone_no: assessee.phone_no,
                house_phone_no: assessee.house_phone_no || "",
                office_phone_no: assessee.office_phone_no || "",
                address: assessee.address,
                postal_code: assessee.postal_code || "",
                educational_qualifications: assessee.educational_qualifications,
                jobs: jobs
            };
        });
    }
    static getAssessorById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, id) });
            if (!assessor) {
                throw new error_1.NotFoundError("Assessor not found");
            }
            const user = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) });
            const scheme = yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, assessor.scheme_id) });
            return {
                id: assessor.id,
                full_name: (user === null || user === void 0 ? void 0 : user.full_name) || "",
                scheme: scheme,
                address: assessor.address,
                phone_no: assessor.phone_no,
                birth_date: assessor.birth_date
            };
        });
    }
}
exports.PublicService = PublicService;
