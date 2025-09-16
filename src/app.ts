import express from 'express';
import path from 'path';
import { authUpload } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error.middleware';
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
app.use('/twodev/api/public', publicRoutes);

app.use('/twodev/api/assessments', assessmentRoutes);
app.use('/twodev/api/assessments', verificationRoutes);
app.use('/twodev/api/schedules', scheduleRoutes);
// Uploads (generic) API
app.use('/twodev/api/uploads', uploadsRoutes);
// Serve uploaded files (secured by auth for now)
app.use('/twodev/uploads', express.static(path.join(__dirname, '../../../public/uploads')));

// Modules
app.use('/twodev/api/users', userRoutes);
app.use('/twodev/api/auth', authRoutes);
app.use('/twodev/api/dashboard', dashboardRoutes);
app.use('/twodev/api/approval', approvalRoutes);
app.use('/twodev/api/occupations', occupationRoutes);
app.use('/twodev/api/schemes', schemeRoutes);
app.use('/twodev/api/assessor', assessorRoutes);
app.use('/twodev/api/assessee', assesseeRoutes);
app.use('/twodev/api/user', userRoutes);
app.use('/twodev/api/assessor-detail', assessorDetailRoutes);

// error handler middleware (DON'T MOVE IT)
app.use(errorHandler);

export default app;
