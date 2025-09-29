import { IA01Service } from "./ia-01.service";
import { asyncHandler } from "../../../common/async.handler";
import { AssessorApproveRequest, SendResultRequest } from "./ia-01.type";

export class IA01Controller {
    static getIA01Groups = asyncHandler(async (req, res) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }

        const iaGroups = await IA01Service.getIA01Groups(resultId);
        res.status(200).json({ success: true, message: 'Group IA berhasil diambil', data: iaGroups });
    });

    static getElementsByUnitId = asyncHandler(async (req, res) => {
        const resultId = Number(req.params.resultId);
        const unitId = Number(req.params.unitId);
        if (!resultId || !unitId) {
            return res.status(400).json({ success: false, message: 'Result ID and Unit ID are required' });
        }

        const elements = await IA01Service.getElementsByUnitId(resultId, unitId);
        res.status(200).json({ success: true, message: 'Elemen berhasil diambil', data: elements });
    });

    static sendResult = asyncHandler(async (req, res) => {
        const data: SendResultRequest = req.body;
        const result = await IA01Service.sendResult(data);
        res.status(200).json({ success: true, message: 'Hasil berhasil dikirimkan', data: result });
    });

    static sendResultHeader = asyncHandler(async (req, res) => {
        const data: AssessorApproveRequest = req.body;
        const result = await IA01Service.sendResultHeader(data);
        res.status(200).json({ success: true, message: 'Hasil berhasil dikirimkan', data: result });
    });

    static approvedByAssessor = asyncHandler(async (req, res) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const result = await IA01Service.approvedByAssessor(resultId);
        res.status(200).json({ success: true, message: 'Hasil berhasil dikirimkan', data: result });
    });

    static approvedByAssessee = asyncHandler(async (req, res) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const result = await IA01Service.approvedByAssessee(resultId);
        res.status(200).json({ success: true, message: 'Hasil berhasil dikirimkan', data: result });
    });

    static getResultDetails = asyncHandler(async (req, res) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const result = await IA01Service.getResultDetails(resultId);
        res.status(200).json({ success: true, message: 'Hasil berhasil diambil', data: result });
    });

    static getIncompleteCriterias = asyncHandler(async (req, res) => {
        const resultId = Number(req.params.resultId);
        if (!resultId) {
            return res.status(400).json({ success: false, message: 'Result ID is required' });
        }
        const incompleteCriterias = await IA01Service.getIncompleteCriterias(resultId);
        res.status(200).json({ success: true, message: 'Hasil berhasil diambil', data: incompleteCriterias });
    });
}