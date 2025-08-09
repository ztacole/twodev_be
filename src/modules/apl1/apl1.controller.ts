import { Request, Response } from 'express';
import { APL1Service } from './apl1.service';

export class Apl1Controller {
  private apl1Service: APL1Service;

  constructor() {
    this.apl1Service = new APL1Service();
  }

  async createAssesseAPL1(req: Request, res: Response) {
    try {
      const assesse = await this.apl1Service.createAssesse(req.body);
      if (req.body.jobs) {
        await Promise.all(
          req.body.jobs.map((job: any) =>
            this.apl1Service.createAssesseJob({
              assessee_id: assesse.id,
              ...job,
            })
          )
        );
      }

      res.status(201).json({
        success: true,
        message: 'Data asesi berhasil dibuat',
        data: assesse,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}