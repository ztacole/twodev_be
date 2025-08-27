import express from 'express';
import path from 'path';
import fs from 'fs';
import { authUpload } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error.middleware';
const cors = require('cors');
const dotenv = require('dotenv');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(__dirname + '/../api-contract/openapi.yaml');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

import userRoutes from './modules/user/user.route';
import authRoutes from './modules/auth/auth.routes';
import approvalRoutes from './modules/admin/approval/approval.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import occupationRoutes from './modules/occupation/occupation.routes';
import schemeRoutes from './modules/scheme/scheme.routes';
import assessmentRoutes from './modules/assessement/assessment.routes';
import verificationRoutes from './modules/assessement/verification.routes';
import uploadsRoutes from './modules/assessement/uploads/uploads.routes';
import scheduleRoutes from './modules/schedule/schedule.routes';
import assessorRoutes from './modules/assessor/assessor.routes';
import assessorDetailRoutes from './modules/assessor-detail/assessor-detail.routes';
import assesseeRoutes from './modules/assessee/asseesee.routes';

// Public
import publicRoutes from './modules/public/public.routes';
app.use('/api/public', publicRoutes);

app.get('/uploads/apl-01/:folder/:filename', authUpload, (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(__dirname, '../public/uploads/apl-01', folder, filename);

  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });

  res.sendFile(filePath);
});

app.use('/api/assessments', assessmentRoutes);
app.use('/api/assessments', verificationRoutes);
app.use('/api/schedules', scheduleRoutes);
// Uploads (generic) API
app.use('/api/uploads', uploadsRoutes);
// Serve uploaded files (secured by auth for now)
app.use('/uploads', authUpload, express.static(path.join(__dirname, '../public/uploads')));

// Modules
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/occupations', occupationRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/assessor', assessorRoutes);
app.use('/api/assessee', assesseeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/assessor-detail', assessorDetailRoutes);

// error handler middleware (DON'T MOVE IT)
app.use(errorHandler);

export default app;
