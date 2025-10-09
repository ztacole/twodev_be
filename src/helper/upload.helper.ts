import multer from 'multer';
import path from 'path';
import fs from 'fs';

export interface UploadOptions {
  /** Base folder path, e.g. '../../../../public/uploads/apl-01' */
  basePath: string;

  /** Function to resolve subfolder name from the request */
  folderResolver: (req: any) => string;

  /** Function to resolve file name from the request */
  fileNameResolver?: (req: any) => string;

  /** Allowed MIME types, e.g. ['application/pdf', 'image/png'] */
  allowedMimeTypes: string[];

  /** Max file size in MB (default: 10) */
  maxSizeMB?: number;

  /** Remove old files before saving new ones (default: false) */
  cleanBeforeUpload?: boolean;
}

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

export function createUploader(options: UploadOptions) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const folderName = options.folderResolver(req);
      const uploadPath = path.join(__dirname, options.basePath, folderName);

      const reqAny: any = req as any;
      const cleanKey = `__uploadCleaned_${options.basePath}`;

      try {
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });          
        } else if (options.cleanBeforeUpload && !reqAny[cleanKey]) {
          for (const fileName of fs.readdirSync(uploadPath)) {
            try { fs.unlinkSync(path.join(uploadPath, fileName)); } catch {}
          }
          reqAny[cleanKey] = true;
        }
      } catch {}

      cb(null, uploadPath);
    },
    
    filename: (req, file, cb) => {
      const fileNameResolver = options.fileNameResolver || (() => undefined);
      const fileName = fileNameResolver(req);
      if(typeof fileName === 'string') {
        cb(null, fileName);
      } else {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
        cb(null, filename);
      }
    }
  });

  const fileFilter = (req: any, file: any, cb: any) => {
    if (options.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Hanya file dengan tipe ${options.allowedMimeTypes.join(', ')} yang diperbolehkan`
        ),
        false
      );
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: (options.maxSizeMB || 10) * 1024 * 1024
    }
  });
}
