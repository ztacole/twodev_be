import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'signature') {
      const signaturePath = path.join(__dirname, '../../../public/uploads/signatures');
      if (!fs.existsSync(signaturePath)) {
        fs.mkdirSync(signaturePath, { recursive: true });
      }
      cb(null, signaturePath);
    } else {
      const defaultPath = path.join(__dirname, '../../../public/uploads/assessor/default');
      if (!fs.existsSync(defaultPath)) {
        fs.mkdirSync(defaultPath, { recursive: true });
      }
      cb(null, defaultPath);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    if (file.fieldname === 'signature') {
      const filename = `assessor-signature-${uniqueSuffix}${fileExtension}`;
      cb(null, filename);
    } else {
      const filename = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
      cb(null, filename);
    }
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan'), false);
  }
};

export const uploadAssessorDetail = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 5MB
  }
}).any();

