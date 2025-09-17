"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        var _a, _b, _c, _d, _e, _f;
        const assesseeId = ((_a = req.params) === null || _a === void 0 ? void 0 : _a.assessee_id) || ((_b = req.body) === null || _b === void 0 ? void 0 : _b.assessee_id) || 'unknown';
        const assessorId = ((_c = req.params) === null || _c === void 0 ? void 0 : _c.assessor_id) || ((_d = req.body) === null || _d === void 0 ? void 0 : _d.assessor_id) || 'unknown';
        const assessmentId = ((_e = req.params) === null || _e === void 0 ? void 0 : _e.assessment_id) || ((_f = req.body) === null || _f === void 0 ? void 0 : _f.assessment_id) || 'unknown';
        const uploadPath = path_1.default.join(__dirname, '../../../../public/uploads/apl-01', `${assesseeId}_${assessorId}_${assessmentId}`);
        const reqAny = req;
        const alreadyCleaned = Boolean(reqAny.__apl01UploadCleaned);
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
                    catch (_g) { }
                }
                reqAny.__apl01UploadCleaned = true;
                setTimeout(() => cb(null, uploadPath), 50);
                return;
            }
        }
        catch (_h) { }
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
    if (['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'].includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Hanya file gambar yang diperbolehkan'), false);
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});
