import { IA01Service } from "./ia-01.service";
import { asyncHandler } from "../../../common/async.handler";

export class IA01Controller {
    static getIA01Groups = asyncHandler(async (req, res) => {
        const assessmentId = Number(req.params.assessmentId);
        const iaGroups = await IA01Service.getIA01Groups(assessmentId);
        res.status(200).json({ success: true, message: 'Group IA berhasil diambil', data: iaGroups });
    });

    static getElementsByUnitId = asyncHandler(async (req, res) => {
        const unitId = Number(req.params.unitId);
        const elements = await IA01Service.getElementsByUnitId(unitId);
        res.status(200).json({ success: true, message: 'Elemen berhasil diambil', data: elements });
    });
}