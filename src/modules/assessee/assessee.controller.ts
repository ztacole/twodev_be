import { Request, Response } from 'express';
import { AssesseeService } from './assessee.service';

export class AssesseeController {
    private assesseeService = new AssesseeService();

    async getAllWithJobs(req: Request, res: Response) {
        const data = await this.assesseeService.getAllWithJobs();
        res.status(200).json({ success: true, data });
    }

    async create(req: Request, res: Response) {
        const data = req.body;
        const result = await this.assesseeService.create(data);
        res.status(201).json({ success: true, data: result });
    }

    async update(req: Request, res: Response) {
        const id = Number(req.params.id);
        const data = req.body;
        const result = await this.assesseeService.update(id, data);
        res.status(200).json({ success: true, data: result });
    }

    async delete(req: Request, res: Response) {
        const id = Number(req.params.id);
        await this.assesseeService.delete(id);
        res.status(200).json({ success: true, message: 'Assessee deleted' });
    }
} 