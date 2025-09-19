"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAssessorDetail = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        var _a, _b, _c, _d;
        const assessorId = ((_a = req.params) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.params) === null || _b === void 0 ? void 0 : _b.assessor_id) || ((_c = req.body) === null || _c === void 0 ? void 0 : _c.assessor_id) || ((_d = req.body) === null || _d === void 0 ? void 0 : _d.assessorId);
        // Jika tidak ada assessor ID, gunakan folder default
        if (!assessorId) {
            const defaultPath = path_1.default.join(__dirname, '../../../public/uploads/assessor/default');
            if (!fs_1.default.existsSync(defaultPath)) {
                fs_1.default.mkdirSync(defaultPath, { recursive: true });
            }
            cb(null, defaultPath);
            return;
        }
        const uploadPath = path_1.default.join(__dirname, '../../../public/uploads/assessor', `assessor-${assessorId}`);
        const reqAny = req;
        const alreadyCleaned = Boolean(reqAny.__assessorUploadCleaned);
        try {
            if (!fs_1.default.existsSync(uploadPath)) {
                fs_1.default.mkdirSync(uploadPath, { recursive: true });
            }
            else if (!alreadyCleaned) {
                for (const fileName of fs_1.default.readdirSync(uploadPath)) {
                    const filePath = path_1.default.join(uploadPath, fileName);
                    try {
                        fs_1.default.unlinkSync(filePath);
                    }
                    catch (_e) { }
                }
                reqAny.__assessorUploadCleaned = true;
                setTimeout(() => cb(null, uploadPath), 50);
                return;
            }
        }
        catch (_f) { }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExtension = path_1.default.extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
        cb(null, filename);
    }
});
const fileFilter = (req, file, cb) => {
    if (['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'].includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Hanya file gambar yang diperbolehkan'), false);
    }
};
exports.uploadAssessorDetail = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 5MB
    }
}).any();
