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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssesseeService = void 0;
const db_1 = require("../../config/db");
class AssesseeService {
    getAssesses() {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.assessee.findMany({
                include: {
                    jobs: true,
                },
            });
        });
    }
    getAssesseById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.assessee.findUnique({
                where: { id },
                include: {
                    jobs: true,
                },
            });
        });
    }
    ;
    createAssesse(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { jobs } = data, assesseeData = __rest(data, ["jobs"]);
            return db_1.prisma.assessee.create({
                data: Object.assign(Object.assign({}, assesseeData), { jobs: jobs && jobs.length > 0 ? {
                        create: jobs
                    } : undefined }),
                include: { jobs: true }
            });
        });
    }
    updateAssesse(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { jobs } = data, assesseeData = __rest(data, ["jobs"]);
            yield db_1.prisma.assessee.update({
                where: { id },
                data: assesseeData,
            });
            if (jobs) {
                const oldJobs = yield db_1.prisma.assessee_Job.findMany({ where: { assessee_id: id } });
                let matchedOldJobIds = [];
                for (const job of jobs) {
                    const existingJob = oldJobs.find(j => j.institution_name === job.institution_name &&
                        j.position === job.position &&
                        j.phone_no === job.phone_no);
                    if (existingJob) {
                        matchedOldJobIds.push(existingJob.id);
                        yield db_1.prisma.assessee_Job.update({
                            where: { id: existingJob.id },
                            data: {
                                institution_name: job.institution_name,
                                address: job.address,
                                position: job.position,
                                phone_no: job.phone_no,
                            },
                        });
                    }
                    else {
                        const created = yield db_1.prisma.assessee_Job.create({
                            data: Object.assign(Object.assign({}, job), { assessee_id: id }),
                        });
                        matchedOldJobIds.push(created.id);
                    }
                }
                const jobsToDelete = oldJobs.filter(j => !matchedOldJobIds.includes(j.id)).map(j => j.id);
                if (jobsToDelete.length > 0) {
                    yield db_1.prisma.assessee_Job.deleteMany({ where: { id: { in: jobsToDelete } } });
                }
            }
            return db_1.prisma.assessee.findUnique({
                where: { id },
                include: { jobs: true },
            });
        });
    }
    deleteAssesse(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.prisma.assessee_Job.deleteMany({ where: { assessee_id: id } });
            return db_1.prisma.assessee.delete({ where: { id } });
        });
    }
}
exports.AssesseeService = AssesseeService;
