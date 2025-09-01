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
const db_1 = require("../../config/db");
const error_1 = require("../../common/error");
class PublicService {
    static getAssesseeById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessee = yield db_1.prisma.assessee.findUnique({
                where: { id },
                include: {
                    jobs: true,
                    user: true
                },
            });
            if (!assessee) {
                throw new error_1.NotFoundError("Assessee not found");
            }
            return {
                id: assessee.id,
                full_name: assessee.user.full_name,
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
                jobs: assessee.jobs
            };
        });
    }
    static getAssessorById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessor = yield db_1.prisma.assessor.findUnique({
                where: { id },
                include: {
                    user: true,
                    scheme: true
                },
            });
            if (!assessor) {
                throw new error_1.NotFoundError("Assessor not found");
            }
            return {
                id: assessor.id,
                full_name: assessor.user.full_name,
                scheme: assessor.scheme,
                address: assessor.address,
                phone_no: assessor.phone_no,
                birth_date: assessor.birth_date
            };
        });
    }
}
exports.PublicService = PublicService;
