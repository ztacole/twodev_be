import { IAGroupService } from "./iaGroup.service";
import { asyncHandler } from "../../../common/async.handler";

export class IAGroupController {
    static createIAGroup = asyncHandler(async (req, res) => {
        const iaGroup = await IAGroupService.createIAGroup(req.body);
        res.status(201).json({ success: true, message: 'Group IA berhasil dibuat', data: iaGroup });
    });
}