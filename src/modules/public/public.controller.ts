import { PublicService } from "./public.service";
import { Request, Response } from "express";

export class PublicController {
    public static async getAssesseeById(req: Request, res: Response) {
        const id = Number(req.params.id);
        const assessee = await PublicService.getAssesseeById(id);
        res.status(200).json(assessee);
    }

    public static async getAssessorById(req: Request, res: Response) {
        const id = Number(req.params.id);
        const assessor = await PublicService.getAssessorById(id);
        res.status(200).json(assessor);
    }
}