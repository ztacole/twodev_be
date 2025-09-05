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
        const user = await db.query.user.findFirst({ where: eq(userTable.id, assessee.userId) });
        const jobs = await db.select().from(assesseeJobTable).where(eq(assesseeJobTable.assesseeId, id));

        return {
            id: assessee.id,
            full_name: user?.fullName || "",
            identity_number: assessee.identityNumber,
            birth_date: assessee.birthDate as any,
            birth_location: assessee.birthLocation,
            gender: assessee.gender as any,
            nationality: assessee.nationality,
            phone_no: assessee.phoneNo,
            house_phone_no: assessee.housePhoneNo || "",
            office_phone_no: assessee.officePhoneNo || "",
            address: assessee.address,
            postal_code: assessee.postalCode || "",
            educational_qualifications: assessee.educationalQualifications,
            jobs: jobs as any
        };
    }

    static async getAssessorById(id: number): Promise<AssessorResponse> {
        const assessor = await db.query.assessor.findFirst({ where: eq(assessorTable.id, id) });
        if (!assessor) {
            throw new NotFoundError("Assessor not found");
        }
        const user = await db.query.user.findFirst({ where: eq(userTable.id, assessor.userId) });
        const scheme = await db.query.scheme.findFirst({ where: eq(schemeTable.id, assessor.schemeId) });

        return {
            id: assessor.id,
            full_name: user?.fullName || "",
            scheme: scheme as any,
            address: assessor.address,
            phone_no: assessor.phoneNo,
            birth_date: assessor.birthDate as any
        };
    }
}