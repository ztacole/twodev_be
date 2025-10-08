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
exports.ScheduleService = void 0;
const error_1 = require("../../common/error");
const drizzle_1 = require("../../config/drizzle");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const pdf_lib_1 = require("pdf-lib");
const pdfAssets_helper_1 = require("../../helper/pdfAssets.helper");
const pdfDraw_helper_1 = require("../../helper/pdfDraw.helper");
const hashids_1 = require("../../helper/hashids");
const date_helper_1 = require("../../helper/date.helper");
class ScheduleService {
    static createSchedule(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, Number(data.assessment_id)) });
            if (!assessment) {
                throw new error_1.NotFoundError('Assessment');
            }
            const assessor_ids = data.schedule_details.map(detail => Number(detail.assessor_id));
            const existingAssessors = assessor_ids.length ? yield drizzle_1.db.select().from(schema_1.assessor).where((0, drizzle_orm_1.inArray)(schema_1.assessor.id, assessor_ids)) : [];
            if (existingAssessors.length !== assessor_ids.length) {
                throw new error_1.NotFoundError('Assessor');
            }
            const [created] = yield drizzle_1.db.insert(schema_1.assessmentSchedule).values({
                assessment_id: data.assessment_id,
                start_date: new Date(data.start_date),
                end_date: new Date(data.end_date),
            });
            for (const detail of data.schedule_details) {
                yield drizzle_1.db.insert(schema_1.scheduleDetail).values({
                    schedule_id: (_a = created.insertId) !== null && _a !== void 0 ? _a : undefined,
                    assessor_id: Number(detail.assessor_id),
                    location: detail.location,
                });
            }
            const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.assessment_id, data.assessment_id) });
            if (!schedule)
                throw new error_1.NotFoundError('Schedule');
            return yield buildScheduleResponse(schedule);
        });
    }
    static updateSchedule(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, id) });
            if (!existing) {
                throw new error_1.NotFoundError('Schedule');
            }
            yield drizzle_1.db.transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Update schedule main fields
                yield tx.update(schema_1.assessmentSchedule).set({
                    start_date: new Date(data.start_date),
                    end_date: new Date(data.end_date),
                }).where((0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, id));
                // If details not provided, skip details handling
                if (!data.schedule_details)
                    return;
                // Fetch existing details for this schedule
                const existingDetails = yield tx.select().from(schema_1.scheduleDetail).where((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.schedule_id, id));
                const existingIds = new Set(existingDetails.map(d => d.id));
                const incomingIds = [];
                for (const det of data.schedule_details) {
                    if (det.id && existingIds.has(det.id)) {
                        // Update existing detail
                        yield tx.update(schema_1.scheduleDetail).set({
                            assessor_id: det.assessor_id,
                            location: det.location,
                        }).where((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.id, det.id));
                        incomingIds.push(det.id);
                    }
                    else {
                        // Insert new detail
                        yield tx.insert(schema_1.scheduleDetail).values({
                            schedule_id: id,
                            assessor_id: det.assessor_id,
                            location: det.location,
                        });
                    }
                }
                // Delete details that exist but not present in incoming payload
                const idsToRemove = existingDetails.map(d => d.id).filter(idVal => !incomingIds.includes(idVal));
                if (idsToRemove.length > 0) {
                    yield tx.delete(schema_1.scheduleDetail).where((0, drizzle_orm_1.inArray)(schema_1.scheduleDetail.id, idsToRemove));
                }
            }));
            const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, id) });
            if (!schedule)
                throw new error_1.NotFoundError('Schedule');
            return yield buildScheduleResponse(schedule);
        });
    }
    static deleteSchedule(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, id) });
            if (!existing) {
                throw new error_1.NotFoundError('Schedule');
            }
            yield drizzle_1.db.delete(schema_1.scheduleDetail).where((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.schedule_id, id));
            yield drizzle_1.db.delete(schema_1.assessmentSchedule).where((0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, id));
        });
    }
    static getSchedules() {
        return __awaiter(this, void 0, void 0, function* () {
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule);
            return Promise.all(schedules.map(s => buildScheduleResponse(s)));
        });
    }
    static getScheduleById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.id, id) });
            if (!schedule) {
                throw new error_1.NotFoundError('Schedule');
            }
            return yield buildScheduleResponse(schedule);
        });
    }
    static getActiveSchedules(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessee = yield drizzle_1.db.select().from(schema_1.assessee).where((0, drizzle_orm_1.eq)(schema_1.assessee.user_id, user.id));
            if (!assessee) {
                throw new error_1.NotFoundError('Assessee');
            }
            const now = new Date();
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.lte)(schema_1.assessmentSchedule.start_date, now), (0, drizzle_orm_1.gte)(schema_1.assessmentSchedule.end_date, now)));
            return Promise.all(schedules.map(s => buildScheduleResponse(s, assessee)));
        });
    }
    static getActiveSchedulesAssessor(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessor = yield drizzle_1.db.select().from(schema_1.assessor).where((0, drizzle_orm_1.eq)(schema_1.assessor.user_id, user.id));
            if (!assessor) {
                throw new error_1.NotFoundError('Assessor');
            }
            const now = new Date();
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.lte)(schema_1.assessmentSchedule.start_date, now), (0, drizzle_orm_1.gte)(schema_1.assessmentSchedule.end_date, now)));
            return Promise.all(schedules.map(s => buildScheduleResponse(s)));
        });
    }
    static getCompletedSchedules(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const assessees = yield drizzle_1.db.select().from(schema_1.assessee).where((0, drizzle_orm_1.eq)(schema_1.assessee.user_id, user.id));
            if (!assessees)
                return [];
            let results = [];
            // Config header dan property
            const headerConfigs = [
                { key: 'APL02', find: (id) => drizzle_1.db.query.resultApl02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultApl02Header.result_id, id) }) },
                { key: 'IA01', find: (id) => drizzle_1.db.query.resultIa01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa01Header.result_id, id) }) },
                { key: 'IA02', find: (id) => drizzle_1.db.query.resultIa02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa02Header.result_id, id) }) },
                { key: 'IA03', find: (id) => drizzle_1.db.query.resultIa03Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa03Header.result_id, id) }) },
                { key: 'IA05', find: (id) => drizzle_1.db.query.resultIa05Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultIa05Header.result_id, id) }) },
                { key: 'AK01', find: (id) => drizzle_1.db.query.resultAk01Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk01Header.result_id, id) }) },
                { key: 'AK02', find: (id) => drizzle_1.db.query.resultAk02Header.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk02Header.result_id, id) }) },
                { key: 'AK05', find: (id) => drizzle_1.db.query.resultAk05.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.resultAk05.result_id, id) }) },
            ];
            for (const assessee of assessees) {
                const rawResults = yield drizzle_1.db.select().from(schema_1.result).where((0, drizzle_orm_1.eq)(schema_1.result.assessee_id, assessee.id));
                if (rawResults.length === 0)
                    continue;
                for (const r of rawResults) {
                    // Ambil semua header sekaligus
                    const headers = {};
                    for (const config of headerConfigs) {
                        headers[config.key] = yield config.find(r.id);
                    }
                    const resultAPL02 = headers.APL02;
                    const resultIA01 = headers.IA01;
                    const resultIA02 = headers.IA02;
                    const resultIA03 = headers.IA03;
                    const resultIA05 = headers.IA05;
                    const resultAK01 = headers.AK01;
                    const resultAK02 = headers.AK02;
                    const resultAK05 = headers.AK05;
                    // Penentuan status
                    let status = "On Going";
                    // if (resultAPL02 && !resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) status = "Not Competent";
                    // if (resultIA01 && !resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) status = "Not Competent";
                    if ((resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                        (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                        (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                        (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                        (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee) : true) &&
                        (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                        (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                        (resultAK05 && resultAK05.approved_assessor) &&
                        !resultAK05.is_competent && !r.is_competent)
                        status = "Not Competent";
                    if ((resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                        (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                        (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                        (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                        (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee && resultIA05.is_achieved) : true) &&
                        (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                        (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                        (resultAK05 && resultAK05.approved_assessor && resultAK05.is_competent) &&
                        r.is_competent)
                        status = "Competent";
                    results.push({ status, detail: yield buildActiveScheduleResponse(r) });
                }
            }
            return results;
        });
    }
    static getScheduleDataForExcel() {
        return __awaiter(this, void 0, void 0, function* () {
            const schedules = yield drizzle_1.db.select().from(schema_1.assessmentSchedule);
            return Promise.all(schedules.map((schedule) => __awaiter(this, void 0, void 0, function* () {
                const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, schedule.assessment_id) });
                const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) }) : null;
                const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) }) : null;
                return {
                    assessment_id: schedule.assessment_id,
                    scheme_code: scheme === null || scheme === void 0 ? void 0 : scheme.code,
                    occupation_name: occupation === null || occupation === void 0 ? void 0 : occupation.name,
                    start_date: schedule.start_date,
                    end_date: schedule.end_date,
                };
            })));
        });
    }
    static getScheduleDetailById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const detail = yield drizzle_1.db.query.scheduleDetail.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheduleDetail.id, id) });
            if (!detail)
                throw new error_1.NotFoundError('Schedule Detail');
            return detail;
        });
    }
    // static async generateLetterAssignment({
    //     type,
    //     number,
    //     assigner_name,
    //     assessor_id,
    //     position,
    //     date,
    //     time,
    //     location,
    //     address
    // }: LetterAssignmentRequest) {
    //     // === Get Assessor ===
    //     const assessor = await AssessorService.getAssessorById(assessor_id);
    //     const name = assessor?.name || "-";
    //     const registration_number = assessor?.no_reg_met || "-";
    //     const scheme = assessor?.scheme.name || "-";
    //     // === Create a new PDF document ===
    //     const pdfDoc = await PDFDocument.create();
    //     const page = pdfDoc.addPage([612, 936]);
    //     //  === Dates ===
    //     const now = new Date();
    //     const months = [
    //         "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    //         "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    //     ];
    //     const day = now.getDate();
    //     const month = months[now.getMonth()];
    //     const year = now.getFullYear();
    //     // === Fonts ===
    //     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    //     const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    //     const fontSizeSmall = 14;
    //     let y = page.getHeight() - 50;
    //     const l2LineGap = 8;
    //     const lLineGap = 12;
    //     const xlLineGap = 20;
    //     // === Header ===
    //     const image = "../../public/images/kop-surat-lsp-smkn24j.png";
    //     y = await kopSurat(pdfDoc, page, image);
    //     // === Title ===
    //     y = drawParagraph(page, "SURAT TUGAS", 40, y, fontBold, fontSizeSmall, "center", rgb(0, 0, 0), undefined, undefined, true);
    //     y = drawParagraph(page, `No : ${number || "-"}`, 40, y, font, fontSizeSmall, "center") - l2LineGap;
    //     // === Body Identitas ===
    //     const text1 = "Ketua " + assigner_name + " menugaskan kepada :";
    //     y = drawParagraph(page, text1, 40, y - xlLineGap, font, fontSizeSmall, "left") - lLineGap;
    //     y = drawField(page, "Nama", `${name || "-"}`, 40, y - l2LineGap, font, fontSizeSmall);
    //     y = drawField(page, "No. Reg", `${registration_number || "-"}`, 40, y - l2LineGap, font, fontSizeSmall);
    //     y = drawField(page, "Jabatan", `${position || "Asesor Kompetensi"}`, 40, y - l2LineGap, font, fontSizeSmall);
    //     // === Conditional Part ===
    //     if (type === "verifications") {
    //         const textVerif = `Untuk dapat bertugas melakukan Verifikasi Persyaratan Teknis TUK dan Pra Uji Kompetensi Keahlian yang akan dilaksanakan oleh ${assigner_name} pada :`;
    //         y = drawParagraph(page, textVerif, 40, y - xlLineGap, font, fontSizeSmall, "left") - lLineGap;
    //         if (Array.isArray(date)) {
    //             const daysStr = date.map(d => formatDay(new Date(d))).join(", ").replace(/, ([^,]*)$/, " dan $1");
    //             const datesStr = formatDateRange(date.map(d => new Date(d)));
    //             y = drawField(page, "Hari", daysStr, 40, y - l2LineGap, font, fontSizeSmall);
    //             y = drawField(page, "Tanggal", datesStr, 40, y - l2LineGap, font, fontSizeSmall);
    //         } else {
    //             y = drawField(page, "Hari/Tanggal", `${formatDay(new Date(date))}, ${formatDate(new Date(date))}`, 40, y - l2LineGap, font, fontSizeSmall);
    //         }
    //         y = drawField(page, "Waktu", `${time ? `${time} WIB s.d Selesai` : "-"}`, 40, y - l2LineGap, font, fontSizeSmall);
    //     } else if (type === "assignments") {
    //         const textDefault = `Untuk dapat bertugas sebagai asesor Uji Kompetensi Keahlian yang akan dilaksanakan oleh ${assigner_name || "-"} pada :`;
    //         y = drawParagraph(page, textDefault, 40, y - xlLineGap, font, fontSizeSmall, "left") - lLineGap;
    //         if (Array.isArray(date)) {
    //             const daysStr = date.map(d => formatDay(new Date(d))).join(", ").replace(/, ([^,]*)$/, " dan $1");
    //             const datesStr = formatDateRange(date.map(d => new Date(d)));
    //             y = drawField(page, "Hari", daysStr, 40, y - l2LineGap, font, fontSizeSmall);
    //             y = drawField(page, "Tanggal", datesStr, 40, y - l2LineGap, font, fontSizeSmall);
    //         } else {
    //             y = drawField(page, "Hari/Tanggal", `${formatDay(new Date(date))}, ${formatDate(new Date(date))}`, 40, y - l2LineGap, font, fontSizeSmall);
    //         }
    //     } else {
    //         throw new Error("Tipe surat tugas tidak valid");
    //     }
    //     y = drawField(page, "Skema Okupasi", scheme, 40, y - l2LineGap, font, fontSizeSmall);
    //     y = drawField(page, "Tempat", `${location || "-"}\n${address || "-"}`, 40, y - l2LineGap, font, fontSizeSmall);
    //     // === Penutup ===
    //     const text4 = `Demikian surat tugas ini untuk dilaksanakan dengan penuh tanggung jawab, dan atas kerja samanya kami sampaikan terima kasih.`;
    //     y = drawParagraph(page, text4, 40, y - xlLineGap, font, fontSizeSmall, "left") - lLineGap;
    //     // === SIGNATURE ===
    //     const signatureX = 50;
    //     let signatureY = y - 50;
    //     const signatureWidth = 60;
    //     const signatureDate = `Jakarta, ${day + " " + month + " " + year}`;
    //     drawParagraph(page, `${signatureDate}`, signatureX, signatureY, font, fontSizeSmall, "right");
    //     drawParagraph(page, `${"Ketua " + assigner_name}`, signatureX, signatureY - 20, font, fontSizeSmall, "right");
    //     signatureY -= 20;
    //     const signatureNameLength = font.widthOfTextAtSize(assigner_name || "-", fontSizeSmall);
    //     const qrData = getAssessorUrl(assessor_id);
    //     const qrCode = await embedQrCode(pdfDoc, qrData);
    //     page.drawImage(qrCode,
    //         { x: page.getWidth() - signatureWidth * 2 - (signatureNameLength / 2) + (signatureWidth / 2) + 9, y: signatureY - signatureWidth - 12, width: signatureWidth, height: signatureWidth }
    //     );
    //     const LSPIcon = path.join(__dirname, "../../../public/images/logo-lsp.png");
    //     const LSPIconPath = await loadAndEmbedImage(pdfDoc, LSPIcon, "png");
    //     page.drawImage(LSPIconPath,
    //         { x: page.getWidth() - signatureWidth * 3 - (signatureNameLength / 2) + (signatureWidth / 2) + 9, y: signatureY - signatureWidth - 12, width: signatureWidth * 2, height: signatureWidth, opacity: 0.3 }
    //     )
    //     drawParagraph(page, `${assigner_name}`, signatureX, signatureY - 90, font, fontSizeSmall, "right");
    //     const pdfBytes = await pdfDoc.save();
    //     return pdfBytes;
    // }
    static generateLetterAssignmentAssessor(data_assessment, data_schedule, data_schedule_details, data_leader, data_assessor, data_result, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { number, LSP_name = 'LSP SMKN 24 Jakarta', work_unit = 'SMK Negeri 24', activity_name, location = `SMK Negeri 24 Jakarta`, address = `Jl. Bambu Hitam No.3, RT.3/RW.1, Bambu Apus, Cipayung, Jakarta Timur`, issued_in = `Jakarta`, } = params;
            // === Date & Time Formatting ===
            const now = new Date();
            const start = new Date(data_schedule.start_date);
            const end = new Date(data_schedule.end_date);
            const formattedDate = (0, date_helper_1.formatDateRangeSD)([start, end], true);
            const formattedTime = (0, date_helper_1.formatTimeRange)(start, end, true);
            const formattedEndDate = `${(0, date_helper_1.formatDay)(end, true)}, ${(0, date_helper_1.formatDate)(end, true)}`;
            console.log({ start, end, formattedDate, formattedTime, formattedEndDate });
            // === PDF SETUP ===
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const [page1, page2, page3] = [pdfDoc.addPage([612, 936]), pdfDoc.addPage([612, 936]), pdfDoc.addPage([612, 936])];
            const font = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            const fontBold = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
            const color = (0, pdf_lib_1.rgb)(0, 0, 0);
            const FONTS = { xSmall: 7, small: 11, medium: 14, large: 16 };
            const GAPS = { s: 8, m: 12, l: 20 };
            let y = page1.getHeight() - 50;
            // === PAGE 1 ===
            y = yield (0, pdfAssets_helper_1.kopSurat)(pdfDoc, page1, "../../public/images/kop-surat-lsp-smkn24j.png");
            // Title & Header
            y = (0, pdfDraw_helper_1.drawParagraph)(page1, "SURAT TUGAS", 40, y, fontBold, FONTS.large, "center", color, undefined, undefined, true);
            y = (0, pdfDraw_helper_1.drawParagraph)(page1, `Nomor : ${number}`, 40, y, fontBold, FONTS.small, "center") - GAPS.s;
            y = (0, pdfDraw_helper_1.drawParagraph)(page1, "Tentang", 40, y, fontBold, FONTS.small, "center");
            y = (0, pdfDraw_helper_1.drawParagraph)(page1, "Pelaksanaan Uji Sertifikasi Kompetensi", 40, y, fontBold, FONTS.small, "center") - GAPS.m;
            // === Body ===
            const textPertimbangan = [
                `1. Berdasarkan Keputusan Rapat Pengurus ${LSP_name}, tentang pelaksanaan Uji Sertifikasi Kompetensi tahun ${now.getFullYear()} bagi peserta Uji Sertifikasi Kompetensi.`,
                `2. Bahwa dalam rangka pelaksanaan Uji Sertifikasi Kompetensi tersebut, dibutuhkan Asesor Kompetensi sebagai penguji.`,
            ].join("\n");
            y = (0, pdfDraw_helper_1.drawField)(page1, "Pertimbangan", textPertimbangan, 40, y, fontBold, FONTS.small);
            y = (0, pdfDraw_helper_1.drawField)(page1, "Dasar", `Surat Keputusan Ketua ${LSP_name}`, 40, y, fontBold, FONTS.small) - GAPS.m;
            // === Asesor Info ===
            y = (0, pdfDraw_helper_1.drawParagraph)(page1, "Menugaskan", 40, y + GAPS.m, fontBold, FONTS.small, "center");
            y = (0, pdfDraw_helper_1.drawField)(page1, "Nama", data_assessor.name, 40, y, fontBold, FONTS.small);
            y = (0, pdfDraw_helper_1.drawField)(page1, "Nomor Registrasi", data_assessor.no_reg_met, 40, y, fontBold, FONTS.small);
            y = (0, pdfDraw_helper_1.drawField)(page1, "Unit Kerja", work_unit || "-", 40, y, fontBold, FONTS.small);
            // === Detail Kegiatan ===
            const intro = `1. Melaksanakan tugas sebagai Asesor Penguji pada pelaksanaan Uji Sertifikasi Kompetensi Lembaga Sertifikasi Profesi Pihak I ${location} yang akan dilaksanakan sebagai berikut:`;
            y = (0, pdfDraw_helper_1.drawField)(page1, "Untuk", intro, 40, y, fontBold, FONTS.small, 110, 8, 14, color, "justify", page1.getWidth() / 2 + 70);
            const details = [
                { label: "     Nama Kegiatan", value: activity_name },
                { label: "     Skema", value: data_assessor.scheme.name },
                { label: "     Tanggal", value: formattedDate },
                { label: "     Pukul", value: formattedTime },
                { label: "     TUK", value: data_schedule_details.location },
                { label: "     Sekolah", value: location },
                { label: "     Alamat", value: address },
            ];
            for (const { label, value } of details) {
                y = (0, pdfDraw_helper_1.drawField)(page1, label, value, 160, y - 4, fontBold, FONTS.small);
            }
            const outro = [
                `2. Melakukan verifikasi data Asesi sesuai dengan Dokumen yang dipersyaratkan;`,
                `3. Menyelesaikan laporan kegiatan paling lambat pada ${formattedEndDate};`,
                `4. Melaksanakan tugas ini dengan sebaik-baiknya dan penuh tanggung jawab.`,
            ].join("\n");
            y = (0, pdfDraw_helper_1.drawField)(page1, "", outro, 40, y, fontBold, FONTS.small) - GAPS.m;
            // === Signature ===
            const signatureY = yield drawSignatureSection(y, page1);
            // === Tembusan ===
            y = signatureY - 10;
            ["Tembusan :", "1. Para penanggung jawab", "2. Tempat Uji Kompetensi", "3. Arsip"].forEach((line, i) => {
                (0, pdfDraw_helper_1.drawParagraph)(page1, line, 40 + (i > 0 ? 20 : 0), y - GAPS.m * i, fontBold, FONTS.small, "left");
            });
            // === PAGE 2 ===
            y = yield (0, pdfAssets_helper_1.kopSurat)(pdfDoc, page2, "../../public/images/kop-surat-lsp-smkn24j.png");
            y -= 20;
            drawAttachment(y, page2);
            y -= 40;
            drawSchemeTableHeader(page2, y, data_assessment, fontBold, FONTS.small, color);
            y -= 85;
            drawUnitTable(page2, y, data_result, font, fontBold, FONTS.small, color);
            return yield pdfDoc.save();
            // === HELPER FUNCTIONS ===
            function drawSignatureSection(yStart, page) {
                return __awaiter(this, void 0, void 0, function* () {
                    const signatureX = page.getWidth() / 2 + 70;
                    let signatureY = yStart - 20;
                    const signatureWidth = 65;
                    signatureY = (0, pdfDraw_helper_1.drawParagraph)(page, `Dikeluarkan di : ${issued_in || "Jakarta"}`, signatureX, signatureY, fontBold, FONTS.small, "left", undefined, 240);
                    signatureY = (0, pdfDraw_helper_1.drawParagraph)(page, `Pada tanggal   : ${(0, date_helper_1.formatDate)(now)}`, signatureX, signatureY, fontBold, FONTS.small, "left", undefined, 240);
                    signatureY = (0, pdfDraw_helper_1.drawParagraph)(page, `Ketua`, signatureX + 65, signatureY - 4, fontBold, FONTS.small, "left", undefined, 240);
                    signatureY -= 50;
                    const qrData = (0, hashids_1.getAssessorUrl)(data_leader.id);
                    const qrCode = yield (0, pdfAssets_helper_1.embedQrCode)(pdfDoc, qrData);
                    page.drawImage(qrCode, { x: signatureX, y: signatureY - 4, width: signatureWidth, height: signatureWidth });
                    signatureY = (0, pdfDraw_helper_1.drawParagraph)(page, `Tanda tangan digital ${data_leader.full_name} Ketua ${LSP_name} untuk dokumen dengan No: ${number} Tanggal: ${(0, date_helper_1.formatDate)(now, true)}`, signatureX + 70, signatureY + 54, fontBold, FONTS.xSmall, "justify", undefined, 110);
                    signatureY = (0, pdfDraw_helper_1.drawParagraph)(page, `${data_leader.full_name}`, signatureX + 36, signatureY - 18, fontBold, FONTS.small, "left", undefined, 200);
                    return signatureY;
                });
            }
            ;
            function drawAttachment(yStart, page) {
                return __awaiter(this, void 0, void 0, function* () {
                    (0, pdfDraw_helper_1.drawParagraph)(page, "Lampiran Surat Tugas", page.getWidth() / 2 + 60, yStart, font, FONTS.small, "left", undefined, 260);
                    (0, pdfDraw_helper_1.drawParagraph)(page, `Nomor      : ${number}`, page.getWidth() / 2 + 60, yStart - GAPS.m, font, FONTS.small, "left", undefined, 260);
                    (0, pdfDraw_helper_1.drawParagraph)(page, `Tanggal    : ${(0, date_helper_1.formatDate)(now, true)}`, page.getWidth() / 2 + 60, yStart - GAPS.m * 2, font, FONTS.small, "left", undefined, 260);
                });
            }
            function drawSchemeTableHeader(page, y, data, fontBold, fontSize, color) {
                const w = page.getWidth() - 80;
                const x = 40;
                page.drawRectangle({ x, y: y - 60, width: 90, height: 60, borderColor: color, borderWidth: 1 });
                let yText = y - 15;
                yText = (0, pdfDraw_helper_1.drawParagraph)(page, "SKEMA", 50, yText - 4, fontBold, fontSize, "left", undefined, 80);
                yText = (0, pdfDraw_helper_1.drawParagraph)(page, "SERTIFIKASI", 50, yText, fontBold, fontSize, "left", undefined, 80);
                yText = (0, pdfDraw_helper_1.drawParagraph)(page, "OKUPASI", 50, yText, fontBold, fontSize, "left", undefined, 80);
                ["JUDUL", "NOMOR"].forEach((text, i) => {
                    const yOffset = y - 30 * (i + 1);
                    page.drawRectangle({ x: 130, y: yOffset, width: 80, height: 30, borderColor: color, borderWidth: 1 });
                    (0, pdfDraw_helper_1.drawParagraph)(page, text, 142, yOffset + 10, fontBold, fontSize);
                    (0, pdfDraw_helper_1.drawParagraph)(page, ":", 198, yOffset + 10, fontBold, fontSize);
                });
                ["name", "code"].forEach((field, i) => {
                    var _a, _b;
                    page.drawRectangle({
                        x: 190,
                        y: y - 30 * (i + 1),
                        width: w - 150,
                        height: 30,
                        borderColor: color,
                        borderWidth: 1,
                    });
                    const value = field === "name" ? (_b = (_a = data === null || data === void 0 ? void 0 : data.occupation) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.toUpperCase() : (data === null || data === void 0 ? void 0 : data.code) || "-";
                    (0, pdfDraw_helper_1.drawParagraph)(page, value, 215, y - 20 - 30 * i, fontBold, fontSize);
                });
            }
            function drawUnitTable(page, y, data, font, fontBold, fontSize, color) {
                const x = 40;
                const width = page.getWidth() - 80;
                const rowHeight = 20;
                const col = { no: 30, code: 120, title: width - 150 };
                // Header
                page.drawRectangle({ x, y: y - rowHeight, width, height: rowHeight, borderColor: color, borderWidth: 1 });
                page.drawRectangle({ x: x + col.no, y: y - rowHeight, width: col.code, height: rowHeight, borderColor: color, borderWidth: 1 });
                page.drawRectangle({ x: x + col.no + col.code, y: y - rowHeight, width: col.title, height: rowHeight, borderColor: color, borderWidth: 1 });
                (0, pdfDraw_helper_1.drawParagraph)(page, "NO", x + 10, y - 15, fontBold, fontSize);
                (0, pdfDraw_helper_1.drawParagraph)(page, "KODE UNIT", x + col.no + 10, y - 15, fontBold, fontSize);
                (0, pdfDraw_helper_1.drawParagraph)(page, "JUDUL UNIT", x + col.no + col.code + 10, y - 15, fontBold, fontSize);
                // Rows
                data.forEach((result, i) => {
                    const rowY = y - rowHeight - (i + 1) * rowHeight;
                    page.drawRectangle({ x, y: rowY, width, height: rowHeight, borderColor: color, borderWidth: 1 });
                    page.drawLine({ start: { x: x + col.no, y: rowY }, end: { x: x + col.no, y: rowY + rowHeight }, thickness: 1, color });
                    page.drawLine({ start: { x: x + col.no + col.code, y: rowY }, end: { x: x + col.no + col.code, y: rowY + rowHeight }, thickness: 1, color });
                    (0, pdfDraw_helper_1.drawParagraph)(page, `${i + 1}`, x + 10, rowY + 5, font, fontSize);
                    (0, pdfDraw_helper_1.drawParagraph)(page, `${(result === null || result === void 0 ? void 0 : result.unit_code) || "-"}`, x + col.no + 10, rowY + 5, font, fontSize);
                    (0, pdfDraw_helper_1.drawParagraph)(page, `${(result === null || result === void 0 ? void 0 : result.title) || "-"}`, x + col.no + col.code + 10, rowY + 5, font, fontSize);
                });
            }
        });
    }
}
exports.ScheduleService = ScheduleService;
function buildScheduleResponse(schedule_1) {
    return __awaiter(this, arguments, void 0, function* (schedule, user = null) {
        const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, schedule.assessment_id) });
        const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) }) : null;
        const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) }) : null;
        const details = yield drizzle_1.db.select().from(schema_1.scheduleDetail).where((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.schedule_id, schedule.id));
        const detailed = yield Promise.all(details.map((detail) => __awaiter(this, void 0, void 0, function* () {
            const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, detail.assessor_id) });
            const assessorUser = assessor ? yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) }) : null;
            const results = yield drizzle_1.db.select().from(schema_1.result).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.result.assessment_id, schedule.assessment_id), (0, drizzle_orm_1.eq)(schema_1.result.assessor_id, detail.assessor_id)));
            const onGoing = user ? results.find(r => user.find(a => a.id === r.assessee_id)) : null;
            return {
                id: detail.id,
                assessor: assessor && assessorUser ? {
                    id: assessor.id,
                    full_name: assessorUser.full_name,
                    phone_no: assessor.phone_no,
                } : null,
                location: detail.location,
                on_going: onGoing ? { result_id: onGoing.id, assessee_id: onGoing.assessee_id } : null,
            };
        })));
        return {
            id: schedule.id,
            assessment: {
                id: assessment === null || assessment === void 0 ? void 0 : assessment.id,
                code: assessment === null || assessment === void 0 ? void 0 : assessment.code,
                occupation: {
                    id: occupation === null || occupation === void 0 ? void 0 : occupation.id,
                    name: occupation === null || occupation === void 0 ? void 0 : occupation.name,
                    scheme: {
                        id: scheme === null || scheme === void 0 ? void 0 : scheme.id,
                        code: scheme === null || scheme === void 0 ? void 0 : scheme.code,
                        name: scheme === null || scheme === void 0 ? void 0 : scheme.name,
                    },
                },
            },
            start_date: schedule.start_date,
            end_date: schedule.end_date,
            schedule_details: detailed,
        };
    });
}
function buildActiveScheduleResponse(result) {
    return __awaiter(this, void 0, void 0, function* () {
        const assessment = yield drizzle_1.db.query.assessment.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessment.id, result.assessment_id) });
        const occupation = assessment ? yield drizzle_1.db.query.occupation.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.occupation.id, assessment.occupation_id) }) : null;
        const scheme = occupation ? yield drizzle_1.db.query.scheme.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.scheme.id, occupation.scheme_id) }) : null;
        const schedule = yield drizzle_1.db.query.assessmentSchedule.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessmentSchedule.assessment_id, result.assessment_id) });
        const detail = yield drizzle_1.db.query.scheduleDetail.findFirst({ where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.scheduleDetail.schedule_id, schedule.id), (0, drizzle_orm_1.eq)(schema_1.scheduleDetail.assessor_id, result.assessor_id)) });
        const assessor = yield drizzle_1.db.query.assessor.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.assessor.id, detail.assessor_id) });
        const assessorUser = yield drizzle_1.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.user.id, assessor.user_id) });
        return {
            id: schedule.id,
            assessment: {
                id: assessment.id,
                code: assessment.code,
                occupation: {
                    id: occupation.id,
                    name: occupation.name,
                    scheme: {
                        id: scheme.id,
                        code: scheme.code,
                        name: scheme.name,
                    },
                },
            },
            start_date: schedule.start_date.toISOString(),
            end_date: schedule.end_date.toISOString(),
            schedule_details: {
                id: detail.id,
                assessor: {
                    id: assessor.id,
                    full_name: assessorUser.full_name,
                    phone_no: assessor.phone_no,
                },
                location: detail.location,
            },
        };
    });
}
