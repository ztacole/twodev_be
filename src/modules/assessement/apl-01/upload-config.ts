import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const assesseeId = req.params?.assessee_id || req.body?.assessee_id || 'unknown';
    const assessorId = req.params?.assessor_id || req.body?.assessor_id || 'unknown';
    const assessmentId = req.params?.assessment_id || req.body?.assessment_id || 'unknown';
    const uploadPath = path.join(__dirname, '../../../../public/uploads/apl-01', `${assesseeId}_${assessorId}_${assessmentId}`);
    
    const reqAny: any = req as any;
    const alreadyCleaned = Boolean(reqAny.__apl01UploadCleaned);

    try {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      } else if (!alreadyCleaned) {
        for (const fileName of fs.readdirSync(uploadPath)) {
          const filePath = path.join(uploadPath, fileName);
          try { fs.unlinkSync(filePath); } catch {}
        }
        reqAny.__apl01UploadCleaned = true;
        setTimeout(() => cb(null, uploadPath), 50);
        return;
      }
    } catch {}

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
    cb(null, filename);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

