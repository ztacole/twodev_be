import { DuplicateEntryError, NotFoundError } from "../../../common/error";
import { db } from "../../../config/drizzle";

import {
    user as userTable,
    assessment as assessmentTable,
    occupation as occupationTable,
    scheme as schemeTable,
    assessmentSchedule as assessmentScheduleTable,
    scheduleDetail as scheduleDetailTable,
    ucApl02 as ucApl02Table,
    elementApl02 as elementApl02Table,
    elementDetailsApl02 as elementDetailsApl02Table,
    groupIa01 as groupIa01Table,
    groupIa02 as groupIa02Table,
    groupIa03 as groupIa03Table,
    ucIa01 as ucIa01Table,
    ucIa02 as ucIa02Table,
    ucIa03 as ucIa03Table,
    elementIa as elementIaTable,
    elementDetailsIa as elementDetailsIaTable,
    ia02Tool as ia02ToolTable,
    ia03Question as ia03QuestionTable,
    ia05Question as ia05QuestionTable,
    ia07Question as ia07QuestionTable,
    questionOption as questionOptionTable,
    result as resultTable,
    assessor as assessorTable,
    assessee as assesseeTable,
    resultDoc as resultDocTable,
    resultApl02Header as resultApl02HeaderTable,
    resultIa01Header as resultIa01HeaderTable,
    resultIa02Header as resultIa02HeaderTable,
    resultIa03Header as resultIa03HeaderTable,
    resultIa05Header as resultIa05HeaderTable,
    resultIa07Header as resultIa07HeaderTable,
    resultAk01Header as resultAk01HeaderTable,
    resultAk02Header as resultAk02HeaderTable,
    resultAk03Header as resultAk03HeaderTable,
    resultAk04 as resultAk04Table,
    resultAk05 as resultAk05Table,
    ia02Pdf as ia02PdfTable,
    assessee,
    resultIa01Header,
    resultIa02Header,
    resultIa03Header,
    resultIa05Header,
    resultAk01Header,
    resultAk02Header,
    resultAk03Header,
    resultAk04,
    resultAk05,
    assessor,
    resultIa07Header,
    scheduleDetail,
    resultApl02,
    resultIa01,
    resultIa05,
} from "../../../../drizzle/schema";
import { eq, and, desc, asc, is, sql } from "drizzle-orm";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { embedQrCode, kopSurat } from "../../../helper/pdfAssets.helper";
import { drawParagraph, drawMixedParagraph, loadAndEmbedImage } from "../../../helper/pdfDraw.helper";
import { getAssessorUrl } from "../../../helper/hashids";

export class ResultPdfService {
    
}