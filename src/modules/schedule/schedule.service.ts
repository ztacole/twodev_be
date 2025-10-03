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
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { embedQrCode, kopSurat } from "../../helper/pdfAssets.helper";
import { drawParagraph, drawMixedParagraph, loadAndEmbedImage, drawField } from "../../helper/pdfDraw.helper";
import { getAssessorUrl } from "../../helper/hashids";
import { formatDate, formatDateRange, formatDay } from '../../helper/date.helper';
import path from 'path';
import { AssessorService } from '../assessor/assessor.service';

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
        const name = assessor?.full_name || "-";
        const registration_number = assessor?.no_reg_met || "-";
        const scheme = assessor?.scheme_name || "-";

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
        y = drawParagraph(page, `Nomor : ${number || "-"}`, 40, y, font, fontSizeSmall, "center") - l2LineGap;

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
            y = drawField(page, "Waktu", `${time || "-"}`, 40, y - l2LineGap, font, fontSizeSmall);
        } else {
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

        const signatureNameLength = font.widthOfTextAtSize(assigner_name, fontSizeSmall);
        const qrData = getAssessorUrl(1);
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

        return await pdfDoc.save();
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