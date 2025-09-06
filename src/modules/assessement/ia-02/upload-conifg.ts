import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const assessmentId = req.params.assessmentId || 'unknown-assessment';
    const uploadPath = path.join(__dirname, '../../../../public/uploads/ia-02', `assessment-${assessmentId}`);
    
    if (fs.existsSync(uploadPath)) {
      fs.readdirSync(uploadPath).forEach((file) => {
        const filePath = path.join(uploadPath, file);
        fs.unlinkSync(filePath);
      });
    } else {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
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
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Hanya file PDF yang diperbolehkan'), false);
  }
};

export const uploadIA02 = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});

