import { Request, Response } from 'express';
import { AssesseeService } from './assessee.service';

export class AssesseeController {
    private assesseeService = new AssesseeService();
  
    async createAssesse(req: Request, res: Response) {
      try {
        const assesse = await assesseeService.createAssesse(req.body);
        res.status(201).json({
          success: true,
          message: 'Data asesi berhasil dibuat',
          data: assesse,
        });
      } catch (error : any) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    };

    async getAssesses(req: Request, res: Response) {
      try {
        const assesses = await assesseeService.getAssesses();
        res.json({
          success: true,
          message: 'Data asesi berhasil diambil',
          data: assesses,
        });
      } catch (error : any) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    };

    async getAssesseById(req: Request, res: Response) {
      try {
        const assesse = await assesseeService.getAssesseById(Number(req.params.id));
        if (!assesse) {
          return res.status(404).json({
            success: false,
            message: 'Data asesi tidak ditemukan',
          });
        }
        res.json({
          success: true,
          message: 'Data asesi berhasil diambil',
          data: assesse,
        });
      } catch (error : any) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    };

    async updateAssesse(req: Request, res: Response) {
      try {
        const assesse = await assesseeService.updateAssesse(
          Number(req.params.id),
          req.body
        );
        if (!assesse) {
          return res.status(404).json({
            success: false,
            message: 'Data asesi tidak ditemukan',
          });
        }
        res.json({
          success: true,
          message: 'Data asesi berhasil diubah',
          data: assesse,
        });
      } catch (error : any) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    };

    async deleteAssesse(req: Request, res: Response) {
      try {
        const assesse = await assesseeService.deleteAssesse(Number(req.params.id));
        if (!assesse) {
          return res.status(404).json({
            success: false,
            message: 'Data asesi tidak ditemukan',
          });
        }
        res.json({
          success: true,
          message: 'Data asesi berhasil dihapus',
        });
      } catch (error : any) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    };
} 