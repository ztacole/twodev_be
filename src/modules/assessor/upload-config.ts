import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let assessorId = req.params?.id || req.params?.assessor_id || req.body?.assessor_id || req.body?.assessorId;
    
    if (!assessorId) {
      assessorId = 'temp';
    }
    
    const uploadPath = path.join(process.cwd(), 'public/uploads/assessor', `assessor-${assessorId}`);
    
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
  if (['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan'), false);
  }
};

export const uploadAssessorDetail = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).any();

