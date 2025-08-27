import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../../../common/async.handler';

// Generic storage (optional broader use beyond apl-01 specific config)
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const folder = req.body.folder || 'misc';
		const uploadPath = path.join(__dirname, '../../../../public/uploads', folder);
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { recursive: true });
		}
		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
	}
});

const fileFilter = (req: any, file: any, cb: any) => {
	if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
		cb(null, true);
	} else {
		cb(new Error('Tipe file tidak didukung'), false);
	}
};

const genericUpload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }).any();

export class UploadsController {
	static uploadFiles = [
		genericUpload,
		asyncHandler(async (req: Request, res: Response) => {
			const files = Array.isArray(req.files) ? req.files : [];
			const folder = req.body.folder || 'misc';
			const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

			const data = files.map((f: any) => ({
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
		})
	];
}

export default UploadsController;
