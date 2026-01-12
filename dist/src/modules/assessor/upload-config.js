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
        if (file.fieldname === 'signature') {
            const signaturePath = path_1.default.join(__dirname, '../../../public/uploads/signatures');
            if (!fs_1.default.existsSync(signaturePath)) {
                fs_1.default.mkdirSync(signaturePath, { recursive: true });
            }
            cb(null, signaturePath);
        }
        else {
            const defaultPath = path_1.default.join(__dirname, '../../../public/uploads/assessor/default');
            if (!fs_1.default.existsSync(defaultPath)) {
                fs_1.default.mkdirSync(defaultPath, { recursive: true });
            }
            cb(null, defaultPath);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExtension = path_1.default.extname(file.originalname);
        if (file.fieldname === 'signature') {
            const filename = `assessor-signature-${uniqueSuffix}${fileExtension}`;
            cb(null, filename);
        }
        else {
            const filename = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
            cb(null, filename);
        }
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
