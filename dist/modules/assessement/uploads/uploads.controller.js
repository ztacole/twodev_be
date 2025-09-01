"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const async_handler_1 = require("../../../common/async.handler");
// Generic storage (optional broader use beyond apl-01 specific config)
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const folder = req.body.folder || 'misc';
        const uploadPath = path_1.default.join(__dirname, '../../../../public/uploads', folder);
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
    }
    else {
        cb(new Error('Tipe file tidak didukung'), false);
    }
};
const genericUpload = (0, multer_1.default)({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }).any();
class UploadsController {
}
exports.UploadsController = UploadsController;
_a = UploadsController;
UploadsController.uploadFiles = [
    genericUpload,
    (0, async_handler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const files = Array.isArray(req.files) ? req.files : [];
        const folder = req.body.folder || 'misc';
        const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
        const data = files.map((f) => ({
            original_name: f.originalname,
            filename: f.filename,
            mimetype: f.mimetype,
            size: f.size,
            url: `${BASE_URL}/uploads/${folder}/${f.filename}`
        }));
        res.status(201).json({
            success: true,
            message: 'File berhasil diupload',
            data
        });
    }))
];
exports.default = UploadsController;
