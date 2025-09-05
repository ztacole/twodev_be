import { db } from "../../config/drizzle";
import { NotFoundError } from "../../common/error";
import { AssesseeResponse, AssessorResponse } from "./public.type";
import { assessee as assesseeTable, user as userTable, assesseeJob as assesseeJobTable, assessor as assessorTable, scheme as schemeTable } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

export class PublicService {
    static async getAssesseeById(id: number): Promise<AssesseeResponse> {
        const assessee = await db.query.assessee.findFirst({ where: eq(assesseeTable.id, id) });
        if (!assessee) {
            throw new NotFoundError("Assessee not found");
        }
        const user = await db.query.user.findFirst({ where: eq(userTable.id, assessee.user_id) });
        const jobs = await db.select().from(assesseeJobTable).where(eq(assesseeJobTable.assessee_id, id));

        return {
            id: assessee.id,
            full_name: user?.full_name || "",
            identity_number: assessee.identity_number,
            birth_date: assessee.birth_date as any,
            birth_location: assessee.birth_location,
            gender: assessee.gender as any,
            nationality: assessee.nationality,
            phone_no: assessee.phone_no,
            house_phone_no: assessee.house_phone_no || "",
            office_phone_no: assessee.office_phone_no || "",
            address: assessee.address,
            postal_code: assessee.postal_code || "",
            educational_qualifications: assessee.educational_qualifications,
            jobs: jobs as any
        };
    }

    static async getAssessorById(id: number): Promise<AssessorResponse> {
        const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, id) });
        if (!assessor) {
            throw new NotFoundError("Assessor not found");
        }
        const user = await db.query.user.findFirst({ where: eq(userTable.id, assessor.user_id) });
        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, assessor.scheme_id) });

        return {
            id: assessor.id,
            full_name: user?.full_name || "",
            scheme: scheme as any,
            address: assessor.address,
            phone_no: assessor.phone_no,
            birth_date: assessor.birth_date as any
        };
    }
}