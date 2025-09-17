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
        var _a, _b;
        const assessorId = ((_a = req.params) === null || _a === void 0 ? void 0 : _a.assessor_id) || ((_b = req.body) === null || _b === void 0 ? void 0 : _b.assessor_id) || 'unknown';
        const uploadPath = path_1.default.join(__dirname, '../../../public/uploads/assessor', `assessor-${assessorId}`);
        if (fs_1.default.existsSync(uploadPath)) {
            fs_1.default.readdirSync(uploadPath).forEach((file) => {
                const filePath = path_1.default.join(uploadPath, file);
                fs_1.default.unlinkSync(filePath);
            });
        }
        else {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
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
exports.uploadAssessorDetail = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});
