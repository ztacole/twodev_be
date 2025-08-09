import { Request, Response } from 'express';
import { APL1Service } from './apl1.service';

export class Apl1Controller {
  private apl1Service: APL1Service;

  constructor() {
    this.apl1Service = new APL1Service();
  }

  async createAssesseAPL1(req: Request, res: Response) {
    try {
      const assesse = await this.apl1Service.createOrUpdateAssesse(req.body);

      res.status(201).json({
        success: true,
        message: 'Asesmen berhasil dibuat',
        data: {
          id: assesse.id,
          user_id: assesse.user_id,
          full_name: assesse.full_name,
          identity_number: assesse.identity_number,
          birth_date: assesse.birth_date,
          birth_location: assesse.birth_location,
          gender: assesse.gender,
          nationality: assesse.nationality,
          phone_no: assesse.phone_no,
          house_phone_no: assesse.house_phone_no,
          office_phone_no: assesse.office_phone_no,
          address: assesse.address,
          postal_code: assesse.postal_code,
          educational_qualifications: assesse.educational_qualifications,
          jobs: req.body.jobs.map((job: any) => ({
            institution_name: job.institution_name,
            address: job.address,
            postal_code: job.postal_code,
            position: job.position,
            phone_no: job.phone_no,
            job_email: job.job_email,
          })),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createAssesseCertificate(req: Request, res: Response) {
    try {
      const certificate = await this.apl1Service.createAssesseCertificate(req.body);
  
      res.status(201).json({
        success: true,
        message: 'Data sertifikat berhasil dibuat',
        data: {
          id: certificate.id,
          result_id: certificate.result_id,
          assessor_id: certificate.assessor_id,
          purpose: certificate.purpose,
          school_report_card: certificate.school_report_card,
          field_work_practice_certificate: certificate.field_work_practice_certificate,
          student_card: certificate.student_card,
          family_card: certificate.family_card,
          id_card: certificate.id_card,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}