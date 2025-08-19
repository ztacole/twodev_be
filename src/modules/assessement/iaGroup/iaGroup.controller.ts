import { IAGroupService } from "./iaGroup.service";
import { asyncHandler } from "../../../common/async.handler";

export class IAGroupController {
    static createIAGroup = asyncHandler(async (req, res) => {
        const iaGroup = await IAGroupService.createIAGroup(req.body);
        res.status(201).json({ success: true, message: 'Group IA berhasil dibuat', data: iaGroup });
    });

    static getIA01Groups = asyncHandler(async (req, res) => {
        const iaGroups = await IAGroupService.getIA01Groups(Number(req.params.assessmentId));
        res.status(200).json({ success: true, message: 'Group IA berhasil diambil', data: iaGroups });
    });
}