import { IA01Service } from "./ia-01.service";
import { asyncHandler } from "../../../common/async.handler";

export class IA01Controller {
    static getIA01Groups = asyncHandler(async (req, res) => {
        const iaGroups = await IA01Service.getIA01Groups(Number(req.params.assessmentId));
        res.status(200).json({ success: true, message: 'Group IA berhasil diambil', data: iaGroups });
    });

    static getElementsByUnitCode = asyncHandler(async (req, res) => {
        const elements = await IA01Service.getElementsByUnitCode(req.params.unitCode);
        res.status(200).json({ success: true, message: 'Elemen berhasil diambil', data: elements });
    });
}