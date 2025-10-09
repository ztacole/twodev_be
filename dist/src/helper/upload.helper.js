"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUploader = createUploader;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * Creates a Multer instance with custom storage, filters, and size limits.
 *
 * @param options Upload settings (base path, folder resolver, MIME types, size, cleanup).
 * @returns A Multer instance for handling uploads.
 *
 * @example
 * const uploadPDF = createUploader({
 *   basePath: '../../../../public/uploads/reports',
 *   folderResolver: (req) => req.params.reportId,
 *   allowedMimeTypes: ['application/pdf'],
 *   maxSizeMB: 20,
 *   cleanBeforeUpload: true
 * });
 *
 * router.post(
 *   '/reports/:reportId/upload',
 *   uploadPDF.single('file'),
 *   ReportController.handleUpload
 * );
 */
function createUploader(options) {
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const folderName = options.folderResolver(req);
            const uploadPath = path_1.default.join(__dirname, options.basePath, folderName);
            const reqAny = req;
            const cleanKey = `__uploadCleaned_${options.basePath}`;
            try {
                if (!fs_1.default.existsSync(uploadPath)) {
                    fs_1.default.mkdirSync(uploadPath, { recursive: true });
                }
                else if (options.cleanBeforeUpload && !reqAny[cleanKey]) {
                    for (const fileName of fs_1.default.readdirSync(uploadPath)) {
                        try {
                            fs_1.default.unlinkSync(path_1.default.join(uploadPath, fileName));
                        }
                        catch (_a) { }
                    }
                    reqAny[cleanKey] = true;
                }
            }
            catch (_b) { }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const fileNameResolver = options.fileNameResolver || (() => undefined);
            const fileName = fileNameResolver(req);
            if (typeof fileName === 'string') {
                cb(null, fileName);
            }
            else {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const fileExtension = path_1.default.extname(file.originalname);
                const filename = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
                cb(null, filename);
            }
        }
    });
    const fileFilter = (req, file, cb) => {
        if (options.allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Hanya file dengan tipe ${options.allowedMimeTypes.join(', ')} yang diperbolehkan`), false);
        }
    };
    return (0, multer_1.default)({
        storage,
        fileFilter,
        limits: {
            fileSize: (options.maxSizeMB || 10) * 1024 * 1024
        }
    });
}
