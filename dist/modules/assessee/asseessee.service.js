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
exports.AssesseeService = void 0;
const db_1 = require("../../config/db");
const error_1 = require("../../common/error");
const translateGenderToEn = (gender) => {
    const lowerGender = gender.toLowerCase().trim();
    switch (lowerGender) {
        case 'laki-laki':
            return 'male';
        case 'perempuan':
            return 'female';
        default:
            throw new Error(`Gender ${gender} tidak diketahui`);
    }
};
const translateGenderToId = (gender) => {
    const lowerGender = gender.toLowerCase().trim();
    switch (lowerGender) {
        case 'male':
            return 'LAKI-LAKI';
        case 'female':
            return 'PEREMPUAN';
        default:
            throw new Error(`Gender ${gender} tidak diketahui`);
    }
};
class AssesseeService {
    static getAssessees() {
        return __awaiter(this, void 0, void 0, function* () {
            const assessees = yield db_1.prisma.assessee.findMany({
                include: {
                    user: { include: { role: true } },
                },
            });
            return assessees.map(this.formatAssesseeResponse);
        });
    }
    static getAssesseeById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessee = yield db_1.prisma.assessee.findUnique({
                where: { id },
                include: { user: { include: { role: true } } },
            });
            if (!assessee)
                throw new error_1.NotFoundError('Assessee');
            return this.formatAssesseeResponse(assessee);
        });
    }
    static createAssessee(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield db_1.prisma.assessee.findFirst({ where: { user_id: data.user_id } });
            if (existing)
                throw new error_1.DuplicateEntryError('Assessee untuk user_id', data.user_id.toString());
            const assessee = yield db_1.prisma.assessee.create({
                data: Object.assign(Object.assign({}, data), { birth_date: new Date(data.birth_date), gender: translateGenderToEn(data.gender) }),
                include: { user: { include: { role: true } } },
            });
            return this.formatAssesseeResponse(assessee);
        });
    }
    static updateAssessee(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield db_1.prisma.assessee.findUnique({ where: { id } });
            if (!existing)
                throw new error_1.NotFoundError('Assessee');
            const assessee = yield db_1.prisma.assessee.update({
                where: { id },
                data: Object.assign(Object.assign({}, data), { birth_date: new Date(data.birth_date), gender: translateGenderToEn(data.gender) }),
                include: { user: { include: { role: true } } },
            });
            return this.formatAssesseeResponse(assessee);
        });
    }
    static deleteAssessee(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield db_1.prisma.assessee.findUnique({ where: { id } });
            if (!existing)
                throw new error_1.NotFoundError('Assessee');
            yield db_1.prisma.assessee.delete({ where: { id } });
        });
    }
    static formatAssesseeResponse(assessee) {
        return {
            id: assessee.id,
            user_id: assessee.user_id,
            identity_number: assessee.identity_number,
            birth_date: assessee.birth_date,
            birth_location: assessee.birth_location,
            gender: assessee.gender,
            nationality: assessee.nationality,
            phone_no: assessee.phone_no,
            house_phone_no: assessee.house_phone_no,
            office_phone_no: assessee.office_phone_no,
            address: assessee.address,
            postal_code: assessee.postal_code,
            educational_qualifications: assessee.educational_qualifications,
        };
    }
}
exports.AssesseeService = AssesseeService;
