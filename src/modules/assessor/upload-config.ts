import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const assessorId = req.params?.id || req.params?.assessor_id || req.body?.assessor_id || req.body?.assessorId;
    
    // Jika tidak ada assessor ID, gunakan folder default
    if (!assessorId) {
      const defaultPath = path.join(__dirname, '../../../public/uploads/assessor/default');
      if (!fs.existsSync(defaultPath)) {
        fs.mkdirSync(defaultPath, { recursive: true });
      }
      cb(null, defaultPath);
      return;
    }
    
    const uploadPath = path.join(__dirname, '../../../public/uploads/assessor', `assessor-${assessorId}`);
    
    const reqAny: any = req as any;
    const alreadyCleaned = Boolean(reqAny.__assessorUploadCleaned);

    try {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      } else if (!alreadyCleaned) {
        for (const fileName of fs.readdirSync(uploadPath)) {
          const filePath = path.join(uploadPath, fileName);
          try {
            fs.unlinkSync(filePath);
          } catch {}
        }
        reqAny.__assessorUploadCleaned = true;
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

