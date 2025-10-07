import { JwtPayload } from 'jsonwebtoken';
import { NotFoundError } from '../../common/error';
import { db } from '../../config/drizzle';
import {
    assessment as assessmentTable,
    assessmentSchedule as scheduleTable,
    scheduleDetail as scheduleDetailTable,
    occupation as occupationTable,
    scheme as schemeTable,
    user as userTable,
    assessor as assessorTable,
    assessee as assesseeTable,
    result as resultTable,
    resultApl02Header as resultApl02HeaderTable,
    resultIa01Header as resultIa01HeaderTable,
    resultIa02Header as resultIa02HeaderTable,
    resultIa03Header as resultIa03HeaderTable,
    resultIa05Header as resultIa05HeaderTable,
    resultAk01Header as resultAk01HeaderTable,
    resultAk02Header as resultAk02HeaderTable,
    resultAk03Header as resultAk03HeaderTable,
    resultAk05 as resultAk05Table,
} from '../../../drizzle/schema';
import { and, between, eq, gte, inArray, lte } from 'drizzle-orm';
import { ActiveScheduleResponse, DetailResponse, LetterAssignmentRequest, ScheduleRequest, ScheduleResponse, updateScheduleRequest } from './schedule.type';
import { PDFDocument, PDFFont, PDFPage, RGB, StandardFonts, drawLine, drawRectangle, rgb } from "pdf-lib";
import { embedQrCode, kopSurat } from "../../helper/pdfAssets.helper";
import { drawParagraph, drawMixedParagraph, loadAndEmbedImage, drawField } from "../../helper/pdfDraw.helper";
import { getAssessorUrl } from "../../helper/hashids";
import { formatDate, formatDateRange, formatDateRangeSD, formatDay, formatTimeRange } from '../../helper/date.helper';
import path from 'path';
import { AssessorService } from '../assessor/assessor.service';
import { sign } from 'crypto';

export class ScheduleService {
    static async createSchedule(data: ScheduleRequest): Promise<ScheduleResponse> {
        const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, Number(data.assessment_id)) });

        if (!assessment) {
            throw new NotFoundError('Assessment');
        }

        const assessor_ids = data.schedule_details.map(detail => Number(detail.assessor_id));
        const existingAssessors = assessor_ids.length ? await db.select().from(assessorTable).where(inArray(assessorTable.id, assessor_ids)) : [];
        if (existingAssessors.length !== assessor_ids.length) {
            throw new NotFoundError('Assessor');
        }

        const [created] = await db.insert(scheduleTable).values({
            assessment_id: data.assessment_id,
            start_date: new Date(data.start_date),
            end_date: new Date(data.end_date),
        });

        for (const detail of data.schedule_details) {
            await db.insert(scheduleDetailTable).values({
                schedule_id: (created as any).insertId ?? undefined,
                assessor_id: Number(detail.assessor_id),
                location: detail.location,
            });
        }

        const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(scheduleTable.assessment_id, data.assessment_id) });
        if (!schedule) throw new NotFoundError('Schedule');
        return await buildScheduleResponse(schedule);
    }

    static async updateSchedule(id: number, data: updateScheduleRequest): Promise<ScheduleResponse> {
        const existing = await db.query.assessmentSchedule.findFirst({ where: eq(scheduleTable.id, id) });
        if (!existing) {
            throw new NotFoundError('Schedule');
        }

        await db.transaction(async (tx) => {
            // Update schedule main fields
            await tx.update(scheduleTable).set({
                start_date: new Date(data.start_date),
                end_date: new Date(data.end_date),
            }).where(eq(scheduleTable.id, id));

            // If details not provided, skip details handling
            if (!data.schedule_details) return;

            // Fetch existing details for this schedule
            const existingDetails = await tx.select().from(scheduleDetailTable).where(eq(scheduleDetailTable.schedule_id, id));
            const existingIds = new Set(existingDetails.map(d => d.id));

            const incomingIds: number[] = [];
            for (const det of data.schedule_details) {
                if (det.id && existingIds.has(det.id)) {
                    // Update existing detail
                    await tx.update(scheduleDetailTable).set({
                        assessor_id: det.assessor_id,
                        location: det.location,
                    }).where(eq(scheduleDetailTable.id, det.id));
                    incomingIds.push(det.id);
                } else {
                    // Insert new detail
                    await tx.insert(scheduleDetailTable).values({
                        schedule_id: id,
                        assessor_id: det.assessor_id,
                        location: det.location,
                    });
                }
            }

            // Delete details that exist but not present in incoming payload
            const idsToRemove = existingDetails.map(d => d.id).filter(idVal => !incomingIds.includes(idVal));
            if (idsToRemove.length > 0) {
                await tx.delete(scheduleDetailTable).where(inArray(scheduleDetailTable.id, idsToRemove));
            }
        });

        const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(scheduleTable.id, id) });
        if (!schedule) throw new NotFoundError('Schedule');
        return await buildScheduleResponse(schedule);
    }

    static async deleteSchedule(id: number) {
        const existing = await db.query.assessmentSchedule.findFirst({ where: eq(scheduleTable.id, id) });
        if (!existing) {
            throw new NotFoundError('Schedule');
        }

        await db.delete(scheduleDetailTable).where(eq(scheduleDetailTable.schedule_id, id));
        await db.delete(scheduleTable).where(eq(scheduleTable.id, id));
    }

    static async getSchedules(): Promise<ScheduleResponse[]> {
        const schedules = await db.select().from(scheduleTable);
        return Promise.all(schedules.map(s => buildScheduleResponse(s)));
    }

    static async getScheduleById(id: number, user: JwtPayload): Promise<ScheduleResponse> {
        const assessee = await db.select().from(assesseeTable).where(eq(assesseeTable.user_id, user.id));
        if (!assessee) {
            throw new NotFoundError('Assessee');
        }

        const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(scheduleTable.id, id) });
        if (!schedule) {
            throw new NotFoundError('Schedule');
        }
        const scheduleDetail = await db.select().from(scheduleDetailTable).where(eq(scheduleDetailTable.schedule_id, id));
        if (!scheduleDetail) {
            throw new NotFoundError('Schedule Detail');
        }

        const assessor = await db.select().from(assessorTable).where(inArray(assessorTable.id, scheduleDetail.map(detail => detail.assessor_id)));
        if (!assessor) {
            throw new NotFoundError('Assessor');
        }

        return await buildScheduleResponse(schedule, assessee as any);
    }

    static async getActiveSchedules(user: JwtPayload): Promise<ScheduleResponse[]> {
        const assessee = await db.select().from(assesseeTable).where(eq(assesseeTable.user_id, user.id));
        if (!assessee) {
            throw new NotFoundError('Assessee');
        }

        const now = new Date();
        const schedules = await db.select().from(scheduleTable).where(and(lte(scheduleTable.start_date, now as any), gte(scheduleTable.end_date, now as any)));
        return Promise.all(schedules.map(s => buildScheduleResponse(s, assessee as any)));
    }

    static async getActiveSchedulesAssessor(user: JwtPayload): Promise<ScheduleResponse[]> {
        const assessor = await db.select().from(assessorTable).where(eq(assessorTable.user_id, user.id));
        if (!assessor) {
            throw new NotFoundError('Assessor');
        }

        const now = new Date();
        const schedules = await db.select().from(scheduleTable).where(and(lte(scheduleTable.start_date, now as any), gte(scheduleTable.end_date, now as any)));
        return Promise.all(schedules.map(s => buildScheduleResponse(s)));
    }

    static async getCompletedSchedules(user: JwtPayload): Promise<ActiveScheduleResponse[]> {
        const assessees = await db.select().from(assesseeTable).where(eq(assesseeTable.user_id, user.id));
        if (!assessees) return [];

        let results: ActiveScheduleResponse[] = [];

        // Config header dan property
        const headerConfigs = [
            { key: 'APL02', find: (id: number) => db.query.resultApl02Header.findFirst({ where: eq(resultApl02HeaderTable.result_id, id) }) },
            { key: 'IA01', find: (id: number) => db.query.resultIa01Header.findFirst({ where: eq(resultIa01HeaderTable.result_id, id) }) },
            { key: 'IA02', find: (id: number) => db.query.resultIa02Header.findFirst({ where: eq(resultIa02HeaderTable.result_id, id) }) },
            { key: 'IA03', find: (id: number) => db.query.resultIa03Header.findFirst({ where: eq(resultIa03HeaderTable.result_id, id) }) },
            { key: 'IA05', find: (id: number) => db.query.resultIa05Header.findFirst({ where: eq(resultIa05HeaderTable.result_id, id) }) },
            { key: 'AK01', find: (id: number) => db.query.resultAk01Header.findFirst({ where: eq(resultAk01HeaderTable.result_id, id) }) },
            { key: 'AK02', find: (id: number) => db.query.resultAk02Header.findFirst({ where: eq(resultAk02HeaderTable.result_id, id) }) },
            { key: 'AK05', find: (id: number) => db.query.resultAk05.findFirst({ where: eq(resultAk05Table.result_id, id) }) },
        ];

        for (const assessee of assessees) {
            const rawResults = await db.select().from(resultTable).where(eq(resultTable.assessee_id, assessee.id));
            if (rawResults.length === 0) continue;

            for (const r of rawResults) {
                // Ambil semua header sekaligus
                const headers: Record<string, any> = {};
                for (const config of headerConfigs) {
                    headers[config.key] = await config.find(r.id);
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
                let status: string = "On Going";
                // if (resultAPL02 && !resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) status = "Not Competent";
                // if (resultIA01 && !resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) status = "Not Competent";
                if (
                    (resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                    (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                    (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                    (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                    (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee) : true) &&
                    (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                    (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                    (resultAK05 && resultAK05.approved_assessor) &&
                    !resultAK05.is_competent && !r.is_competent
                ) status = "Not Competent";
                if (
                    (resultAPL02 && resultAPL02.is_continue && resultAPL02.approved_assessor && resultAPL02.approved_assessee) &&
                    (resultIA01 && resultIA01.is_competent && resultIA01.approved_assessor && resultIA01.approved_assessee) &&
                    (resultIA02 && resultIA02.approved_assessor && resultIA02.approved_assessee) &&
                    (resultIA03 && resultIA03.approved_assessor && resultIA03.approved_assessee) &&
                    (resultIA05 ? (resultIA05.approved_assessor && resultIA05.approved_assessee && resultIA05.is_achieved) : true) &&
                    (resultAK01 && resultAK01.approved_assessor && resultAK01.approved_assessee) &&
                    (resultAK02 && resultAK02.approved_assessor && resultAK02.approved_assessee) &&
                    (resultAK05 && resultAK05.approved_assessor && resultAK05.is_competent) &&
                    r.is_competent
                ) status = "Competent";
                results.push({ status, detail: await buildActiveScheduleResponse(r) });
            }
        }

        return results;
    }

    static async getScheduleDataForExcel() {
        const schedules = await db.select().from(scheduleTable);

        return Promise.all(schedules.map(async (schedule) => {
            const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, schedule.assessment_id) });
            const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) }) : null;
            const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) }) : null;
            return {
                assessment_id: schedule.assessment_id,
                scheme_code: scheme?.code,
                occupation_name: occupation?.name,
                start_date: schedule.start_date,
                end_date: schedule.end_date,
            };
        }));
    }

    static async getScheduleDetailById(id: number) {
        const detail = await db.query.scheduleDetail.findFirst({ where: eq(scheduleDetailTable.id, id) });
        if (!detail) throw new NotFoundError('Schedule Detail');
        return detail;
    }

    static async generateLetterAssignment({
        type,
        number,
        assigner_name,
        assessor_id,
        position,
        date,
        time,
        location,
        address
    }: LetterAssignmentRequest) {
        // === Get Assessor ===
        const assessor = await AssessorService.getAssessorById(assessor_id);
        const name = assessor?.name || "-";
        const registration_number = assessor?.no_reg_met || "-";
        const scheme = assessor?.scheme.name || "-";

        // === Create a new PDF document ===
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([612, 936]);

        //  === Dates ===
        const now = new Date();
        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        const day = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();

        // === Fonts ===
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontSizeSmall = 14;

        let y = page.getHeight() - 50;
        const l2LineGap = 8;
        const lLineGap = 12;
        const xlLineGap = 20;

        // === Header ===
        const image = "../../public/images/kop-surat-lsp-smkn24j.png";
        y = await kopSurat(pdfDoc, page, image);

        // === Title ===
        y = drawParagraph(page, "SURAT TUGAS", 40, y, fontBold, fontSizeSmall, "center", rgb(0, 0, 0), undefined, undefined, true);
        y = drawParagraph(page, `No : ${number || "-"}`, 40, y, font, fontSizeSmall, "center") - l2LineGap;

        // === Body Identitas ===
        const text1 = "Ketua " + assigner_name + " menugaskan kepada :";
        y = drawParagraph(page, text1, 40, y - xlLineGap, font, fontSizeSmall, "left") - lLineGap;

        y = drawField(page, "Nama", `${name || "-"}`, 40, y - l2LineGap, font, fontSizeSmall);
        y = drawField(page, "No. Reg", `${registration_number || "-"}`, 40, y - l2LineGap, font, fontSizeSmall);
        y = drawField(page, "Jabatan", `${position || "Asesor Kompetensi"}`, 40, y - l2LineGap, font, fontSizeSmall);

        // === Conditional Part ===
        if (type === "verifications") {
            const textVerif = `Untuk dapat bertugas melakukan Verifikasi Persyaratan Teknis TUK dan Pra Uji Kompetensi Keahlian yang akan dilaksanakan oleh ${assigner_name} pada :`;
            y = drawParagraph(page, textVerif, 40, y - xlLineGap, font, fontSizeSmall, "left") - lLineGap;

            if (Array.isArray(date)) {
                const daysStr = date.map(d => formatDay(new Date(d))).join(", ").replace(/, ([^,]*)$/, " dan $1");
                const datesStr = formatDateRange(date.map(d => new Date(d)));

                y = drawField(page, "Hari", daysStr, 40, y - l2LineGap, font, fontSizeSmall);
                y = drawField(page, "Tanggal", datesStr, 40, y - l2LineGap, font, fontSizeSmall);
            } else {
                y = drawField(page, "Hari/Tanggal", `${formatDay(new Date(date))}, ${formatDate(new Date(date))}`, 40, y - l2LineGap, font, fontSizeSmall);
            }
            y = drawField(page, "Waktu", `${time ? `${time} WIB s.d Selesai` : "-"}`, 40, y - l2LineGap, font, fontSizeSmall);
        } else if (type === "assignments") {
            const textDefault = `Untuk dapat bertugas sebagai asesor Uji Kompetensi Keahlian yang akan dilaksanakan oleh ${assigner_name || "-"} pada :`;
            y = drawParagraph(page, textDefault, 40, y - xlLineGap, font, fontSizeSmall, "left") - lLineGap;

            if (Array.isArray(date)) {
                const daysStr = date.map(d => formatDay(new Date(d))).join(", ").replace(/, ([^,]*)$/, " dan $1");
                const datesStr = formatDateRange(date.map(d => new Date(d)));

                y = drawField(page, "Hari", daysStr, 40, y - l2LineGap, font, fontSizeSmall);
                y = drawField(page, "Tanggal", datesStr, 40, y - l2LineGap, font, fontSizeSmall);
            } else {
                y = drawField(page, "Hari/Tanggal", `${formatDay(new Date(date))}, ${formatDate(new Date(date))}`, 40, y - l2LineGap, font, fontSizeSmall);
            }
        } else {
            throw new Error("Tipe surat tugas tidak valid");
        }

        y = drawField(page, "Skema Okupasi", scheme, 40, y - l2LineGap, font, fontSizeSmall);
        y = drawField(page, "Tempat", `${location || "-"}\n${address || "-"}`, 40, y - l2LineGap, font, fontSizeSmall);

        // === Penutup ===
        const text4 = `Demikian surat tugas ini untuk dilaksanakan dengan penuh tanggung jawab, dan atas kerja samanya kami sampaikan terima kasih.`;
        y = drawParagraph(page, text4, 40, y - xlLineGap, font, fontSizeSmall, "left") - lLineGap;

        // === SIGNATURE ===
        const signatureX = 50;
        let signatureY = y - 50;
        const signatureWidth = 60;

        const signatureDate = `Jakarta, ${day + " " + month + " " + year}`;
        drawParagraph(page, `${signatureDate}`, signatureX, signatureY, font, fontSizeSmall, "right");
        drawParagraph(page, `${"Ketua " + assigner_name}`, signatureX, signatureY - 20, font, fontSizeSmall, "right");
        signatureY -= 20;

        const signatureNameLength = font.widthOfTextAtSize(assigner_name || "-", fontSizeSmall);
        const qrData = getAssessorUrl(assessor_id);
        const qrCode = await embedQrCode(pdfDoc, qrData);
        page.drawImage(qrCode,
            { x: page.getWidth() - signatureWidth * 2 - (signatureNameLength / 2) + (signatureWidth / 2) + 9, y: signatureY - signatureWidth - 12, width: signatureWidth, height: signatureWidth }
        );

        const LSPIcon = path.join(__dirname, "../../../public/images/logo-lsp.png");
        const LSPIconPath = await loadAndEmbedImage(pdfDoc, LSPIcon, "png");
        page.drawImage(LSPIconPath,
            { x: page.getWidth() - signatureWidth * 3 - (signatureNameLength / 2) + (signatureWidth / 2) + 9, y: signatureY - signatureWidth - 12, width: signatureWidth * 2, height: signatureWidth, opacity: 0.3 }
        )
        drawParagraph(page, `${assigner_name}`, signatureX, signatureY - 90, font, fontSizeSmall, "right");

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    }

    static async generateLetterAssignmentAssessor(
        data_assessment: any,
        data_result: any,
        params: LetterAssignmentRequest
    ) {
        const {
            number,
            LSP_name,
            assigner_name,
            assessor_id,
            work_unit,
            activity_name,
            date,
            time,
            tuk,
            location,
            address,
            issued_in,
        } = params;

        // === Get Assessor ===
        const assessor = await AssessorService.getAssessorById(assessor_id);
        const name = assessor?.name || "-";
        const registration_number = assessor?.no_reg_met || "-";
        const scheme = assessor?.scheme.name || "-";

        // === Date & Time Formatting ===
        const now = new Date();
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const formattedDate = formatDateRangeSD((Array.isArray(date) ? date : [date]).map(d => new Date(d)));
        const formattedTime =
            typeof time === "string"
                ? formatTimeRange({ start: time.split("-")[0].trim(), end: time.split("-")[1].trim() })
                : formatTimeRange(time);
        const lastDate = Array.isArray(date) ? new Date(Math.max(...date.map(d => new Date(d).getTime()))) : new Date(date);
        const formattedEndDate = `${days[lastDate.getDay()]}, ${lastDate.getDate()} ${months[lastDate.getMonth()]} ${lastDate.getFullYear()}`;

        // === PDF SETUP ===
        const pdfDoc = await PDFDocument.create();
        const [page1, page2, page3] = [pdfDoc.addPage([612, 936]), pdfDoc.addPage([612, 936]), pdfDoc.addPage([612, 936])];

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const color = rgb(0, 0, 0);

        const FONTS = { xSmall: 7, small: 11, medium: 14, large: 16 };
        const GAPS = { s: 8, m: 12, l: 20 };
        let y = page1.getHeight() - 50;

        // === PAGE 1 ===
        y = await kopSurat(pdfDoc, page1, "../../public/images/kop-surat-lsp-smkn24j.png");

        // Title & Header
        y = drawParagraph(page1, "SURAT TUGAS", 40, y, fontBold, FONTS.large, "center", color, undefined, undefined, true);
        y = drawParagraph(page1, `Nomor : ${number}`, 40, y, fontBold, FONTS.small, "center") - GAPS.s;

        y = drawParagraph(page1, "Tentang", 40, y, fontBold, FONTS.small, "center");
        y = drawParagraph(page1, "Pelaksanaan Uji Sertifikasi Kompetensi", 40, y, fontBold, FONTS.small, "center") - GAPS.m;

        // === Body ===
        const textPertimbangan = [
            `1. Berdasarkan Keputusan Rapat Pengurus ${LSP_name}, tentang pelaksanaan Uji Sertifikasi Kompetensi tahun ${now.getFullYear()} bagi peserta Uji Sertifikasi Kompetensi.`,
            `2. Bahwa dalam rangka pelaksanaan Uji Sertifikasi Kompetensi tersebut, dibutuhkan Asesor Kompetensi sebagai penguji.`,
        ].join("\n");

        y = drawField(page1, "Pertimbangan", textPertimbangan, 40, y, fontBold, FONTS.small);
        y = drawField(page1, "Dasar", `Surat Keputusan Ketua ${LSP_name}`, 40, y, fontBold, FONTS.small) - GAPS.m;

        // === Asesor Info ===
        y = drawParagraph(page1, "Menugaskan", 40, y + GAPS.m, fontBold, FONTS.small, "center");
        y = drawField(page1, "Nama", name, 40, y, fontBold, FONTS.small);
        y = drawField(page1, "Nomor Registrasi", registration_number, 40, y, fontBold, FONTS.small);
        y = drawField(page1, "Unit Kerja", work_unit || "-", 40, y, fontBold, FONTS.small);

        // === Detail Kegiatan ===
        const intro = `1. Melaksanakan tugas sebagai Asesor Penguji pada pelaksanaan Uji Sertifikasi Kompetensi Lembaga Sertifikasi Profesi Pihak I ${location} yang akan dilaksanakan sebagai berikut:`;
        y = drawField(page1, "Untuk", intro, 40, y, fontBold, FONTS.small, 110, 8, 14, color, "justify", page1.getWidth() / 2 + 70);

        const details = [
            { label: "     Nama Kegiatan", value: activity_name },
            { label: "     Skema", value: scheme },
            { label: "     Tanggal", value: formattedDate },
            { label: "     Pukul", value: formattedTime },
            { label: "     TUK", value: tuk },
            { label: "     Sekolah", value: location },
            { label: "     Alamat", value: address },
        ];
        for (const { label, value } of details) {
            y = drawField(page1, label, value, 160, y - 4, fontBold, FONTS.small);
        }

        const outro = [
            `2. Melakukan verifikasi data Asesi sesuai dengan Dokumen yang dipersyaratkan;`,
            `3. Menyelesaikan laporan kegiatan paling lambat pada ${formattedEndDate};`,
            `4. Melaksanakan tugas ini dengan sebaik-baiknya dan penuh tanggung jawab.`,
        ].join("\n");
        y = drawField(page1, "", outro, 40, y, fontBold, FONTS.small) - GAPS.m;

        // === Signature ===
        const signatureY = await drawSignatureSection(y, page1);

        // === Tembusan ===
        y = signatureY - 10;
        ["Tembusan :", "1. Para penanggung jawab", "2. Tempat Uji Kompetensi", "3. Arsip"].forEach((line, i) => {
            drawParagraph(page1, line, 40 + (i > 0 ? 20 : 0), y - GAPS.m * i, fontBold, FONTS.small, "left");
        });

        // === PAGE 2 ===
        y = await kopSurat(pdfDoc, page2, "../../public/images/kop-surat-lsp-smkn24j.png");
        y -= 20;
        drawAttachment(y, page2);
        y -= 40;

        drawSchemeTableHeader(page2, y, data_assessment, fontBold, FONTS.small, color);
        y -= 85;

        drawUnitTable(page2, y, data_result, font, fontBold, FONTS.small, color);

        return await pdfDoc.save();

        // === HELPER FUNCTIONS ===

        async function drawSignatureSection(yStart: number, page: PDFPage) {
            const signatureX = page.getWidth() / 2 + 70;
            let signatureY = yStart - 20;
            const signatureWidth = 65;

            signatureY = drawParagraph(page, `Dikeluarkan di : ${issued_in || "Jakarta"}`, signatureX, signatureY, fontBold, FONTS.small, "left", undefined, 240);
            signatureY = drawParagraph(page, `Pada tanggal   : ${now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear()}`, signatureX, signatureY, fontBold, FONTS.small, "left", undefined, 240);
            signatureY = drawParagraph(page, `Ketua`, signatureX + 65, signatureY - 4, fontBold, FONTS.small, "left", undefined, 240);

            signatureY -= 50;
            const qrData = getAssessorUrl(assessor_id);
            const qrCode = await embedQrCode(pdfDoc, qrData);
            page.drawImage(qrCode, { x: signatureX, y: signatureY - 4, width: signatureWidth, height: signatureWidth });

            signatureY = drawParagraph(
                page,
                `Tanda tangan digital ${assigner_name} Ketua ${LSP_name} untuk dokumen dengan No: ${number} Tanggal: ${now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear()}`,
                signatureX + 70,
                signatureY + 54,
                fontBold,
                FONTS.xSmall,
                "justify",
                undefined,
                110
            );
            signatureY = drawParagraph(page, `${assigner_name}`, signatureX + 36, signatureY - 18, fontBold, FONTS.xSmall, "left", undefined, 200);

            return signatureY;
        };

        async function drawAttachment(yStart: number, page: PDFPage) {
            drawParagraph(page, "Lampiran Surat Tugas", page.getWidth() / 2 + 60, yStart, font, FONTS.small, "left", undefined, 260);
            drawParagraph(page, `Nomor      : ${number}`, page.getWidth() / 2 + 60, yStart - GAPS.m, font, FONTS.small, "left", undefined, 260);
            drawParagraph(page, `Tanggal    : ${now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear()}`, page.getWidth() / 2 + 60, yStart - GAPS.m * 2, font, FONTS.small, "left", undefined, 260);
        }

        function drawSchemeTableHeader(page: PDFPage, y: number, data: any, fontBold: PDFFont, fontSize: number, color: RGB) {
            const w = page.getWidth() - 80;
            const x = 40;

            page.drawRectangle({ x, y: y - 60, width: 90, height: 60, borderColor: color, borderWidth: 1 });
            let yText = y - 15;
            yText = drawParagraph(page, "SKEMA", 50, yText - 4, fontBold, fontSize, "left", undefined, 80);
            yText = drawParagraph(page, "SERTIFIKASI", 50, yText, fontBold, fontSize, "left", undefined, 80);
            yText = drawParagraph(page, "OKUPASI", 50, yText, fontBold, fontSize, "left", undefined, 80);

            ["JUDUL", "NOMOR"].forEach((text, i) => {
                const yOffset = y - 30 * (i + 1);
                page.drawRectangle({ x: 130, y: yOffset, width: 80, height: 30, borderColor: color, borderWidth: 1 });
                drawParagraph(page, text, 142, yOffset + 10, fontBold, fontSize);
                drawParagraph(page, ":", 198, yOffset + 10, fontBold, fontSize);
            });

            ["name", "code"].forEach((field, i) => {
                page.drawRectangle({
                    x: 190,
                    y: y - 30 * (i + 1),
                    width: w - 150,
                    height: 30,
                    borderColor: color,
                    borderWidth: 1,
                });
                const value = field === "name" ? data?.occupation?.name?.toUpperCase() : data?.code || "-";
                drawParagraph(page, value, 215, y - 20 - 30 * i, fontBold, fontSize);
            });
        }

        function drawUnitTable(page: PDFPage, y: number, data: any[], font: PDFFont, fontBold: PDFFont, fontSize: number, color: RGB) {
            const x = 40;
            const width = page.getWidth() - 80;
            const rowHeight = 20;
            const col = { no: 30, code: 120, title: width - 150 };

            // Header
            page.drawRectangle({ x, y: y - rowHeight, width, height: rowHeight, borderColor: color, borderWidth: 1 });
            page.drawRectangle({ x: x + col.no, y: y - rowHeight, width: col.code, height: rowHeight, borderColor: color, borderWidth: 1 });
            page.drawRectangle({ x: x + col.no + col.code, y: y - rowHeight, width: col.title, height: rowHeight, borderColor: color, borderWidth: 1 });

            drawParagraph(page, "NO", x + 10, y - 15, fontBold, fontSize);
            drawParagraph(page, "KODE UNIT", x + col.no + 10, y - 15, fontBold, fontSize);
            drawParagraph(page, "JUDUL UNIT", x + col.no + col.code + 10, y - 15, fontBold, fontSize);

            // Rows
            data.forEach((result, i) => {
                const rowY = y - rowHeight - (i + 1) * rowHeight;
                page.drawRectangle({ x, y: rowY, width, height: rowHeight, borderColor: color, borderWidth: 1 });
                page.drawLine({ start: { x: x + col.no, y: rowY }, end: { x: x + col.no, y: rowY + rowHeight }, thickness: 1, color });
                page.drawLine({ start: { x: x + col.no + col.code, y: rowY }, end: { x: x + col.no + col.code, y: rowY + rowHeight }, thickness: 1, color });

                drawParagraph(page, `${i + 1}`, x + 10, rowY + 5, font, fontSize);
                drawParagraph(page, `${result?.unit_code || "-"}`, x + col.no + 10, rowY + 5, font, fontSize);
                drawParagraph(page, `${result?.title || "-"}`, x + col.no + col.code + 10, rowY + 5, font, fontSize);
            });
        }
    }
      
}

interface Assessee {
    id: number;
    user_id: number;
}

async function buildScheduleResponse(schedule: any, user: Assessee[] | null = null): Promise<ScheduleResponse> {
    const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, schedule.assessment_id) });
    const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) }) : null;
    const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) }) : null;
    const details = await db.select().from(scheduleDetailTable).where(eq(scheduleDetailTable.schedule_id, schedule.id));
    const detailed = await Promise.all(details.map(async (detail) => {
        const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, detail.assessor_id) });
        const assessorUser = assessor ? await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) }) : null;
        const results = await db.select().from(resultTable).where(and(eq(resultTable.assessment_id, schedule.assessment_id), eq(resultTable.assessor_id, detail.assessor_id)));
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
    }));

    return {
        id: schedule.id,
        assessment: {
            id: assessment?.id,
            code: assessment?.code,
            occupation: {
                id: occupation?.id,
                name: occupation?.name,
                scheme: {
                    id: scheme?.id,
                    code: scheme?.code,
                    name: scheme?.name,
                },
            },
        },
        start_date: schedule.start_date,
        end_date: schedule.end_date,
        schedule_details: detailed,
    } as any;
}
async function buildActiveScheduleResponse(result: any): Promise<DetailResponse> {
    const assessment = await db.query.assessment.findFirst({ where: eq(assessmentTable.id, result.assessment_id) });
    const occupation = assessment ? await db.query.occupation.findFirst({ where: eq(occupationTable.id, assessment.occupation_id) }) : null;
    const scheme = occupation ? await db.query.scheme.findFirst({ where: eq(schemeTable.id, occupation.scheme_id) }) : null;
    const schedule = await db.query.assessmentSchedule.findFirst({ where: eq(scheduleTable.assessment_id, result.assessment_id) });
    const detail = await db.query.scheduleDetail.findFirst({ where: and(eq(scheduleDetailTable.schedule_id, schedule!.id), eq(scheduleDetailTable.assessor_id, result.assessor_id)) });
    const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, detail!.assessor_id) });
    const assessorUser = await db.query.user.findFirst({ where: eq(userTable.id, assessor!.user_id) });
    return {
        id: schedule!.id,
        assessment: {
            id: assessment!.id,
            code: assessment!.code,
            occupation: {
                id: occupation!.id,
                name: occupation!.name,
                scheme: {
                    id: scheme!.id,
                    code: scheme!.code,
                    name: scheme!.name,
                },
            },
        },
        start_date: schedule!.start_date.toISOString(),
        end_date: schedule!.end_date.toISOString(),
        schedule_details: {
            id: detail!.id,
            assessor: {
                id: assessor!.id,
                full_name: assessorUser!.full_name,
                phone_no: assessor!.phone_no,
            },
            location: detail!.location,
        },
    }
}