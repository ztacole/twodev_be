// import { Request, Response } from "express";
// import { MajorRequest, MajorResponse } from "./major.type";
// import { MajorService } from "./major.service";

// export class MajorController {
//     private majorService: MajorService;

//     constructor() {
//         this.majorService = new MajorService();
//     }

//     async getAllMajors(req: Request, res: Response) {
//         const majors = await this.majorService.getMajors();
//         res.status(200).json({
//             success: true,
//             message: 'Majors retrieved successfully',
//             data: majors
//         });
//     }

//     async createMajor(req: Request, res: Response) {
//         const data: MajorRequest = req.body;
//         if (!data.name || !data.code) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'All field must be filled!'
//             });
//         }
//         const newMajor = await this.majorService.createMajor(data);
//         res.status(201).json({
//             success: true,
//             message: 'Major created successfully',
//             data: newMajor
//         });
//     }

//     async updateMajor(req: Request, res: Response) {
//         const id = Number(req.params.id);
//         const data: MajorRequest = req.body;
//         const updatedMajor = await this.majorService.updateMajor(id, data);
//         res.status(200).json({
//             success: true,
//             message: 'Major updated successfully',
//             data: updatedMajor
//         });
//     }

//     async deleteMajor(req: Request, res: Response) {
//         const id = Number(req.params.id);
//         const deletedMajor = await this.majorService.deleteMajor(id);
//         res.status(200).json({
//             success: true,
//             message: 'Major deleted successfully'
//         });
//     }
// }