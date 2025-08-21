import { prisma } from "../../config/db";
import { NotFoundError } from "../../common/error";
import { AssesseeResponse, AssessorResponse } from "./public.type";

export class PublicService {
    static async getAssesseeById(id: number): Promise<AssesseeResponse> {
        const assessee = await prisma.assessee.findUnique({
            where: { id },
            include: {
                jobs: true,
                user: true
            },
        });
        
        if (!assessee) {
            throw new NotFoundError("Assessee not found");
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
    }

    static async getAssessorById(id: number): Promise<AssessorResponse> {
        const assessor = await prisma.assessor.findUnique({
            where: { id },
            include: {
                user: true,
                scheme: true
            },
        });

        if (!assessor) {
            throw new NotFoundError("Assessor not found");
        }

        return {
            id: assessor.id,
            full_name: assessor.user.full_name,
            scheme: assessor.scheme,
            address: assessor.address,
            phone_no: assessor.phone_no,
            birth_date: assessor.birth_date
        };
    }
}