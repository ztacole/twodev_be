import multer from 'multer';
import path from 'path';
import fs from 'fs';

const ROOT_DIR = path.resolve(__dirname, '../../../'); 
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const fileFilter = (req: any, file: any, cb: any) => {
  if (['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan'), false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const assesseeId = req.params?.assessee_id || req.body?.assessee_id || 'unknown';
    const assessorId = req.params?.assessor_id || req.body?.assessor_id || 'unknown';
    const assessmentId = req.params?.assessment_id || req.body?.assessment_id || 'unknown';

    const uploadPath = path.join(PUBLIC_DIR, 'uploads/apl-01', `${assesseeId}_${assessorId}_${assessmentId}`);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
