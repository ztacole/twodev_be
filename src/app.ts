import express from 'express';
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
import scheduleRoutes from './modules/schedule/schedule.routes';
import assessorRoutes from './modules/assessor/assessor.routes';

// Public
import publicRoutes from './modules/public/public.routes';
app.use('/api/public', publicRoutes);

app.use('/api/assessments', assessmentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/uploads', express.static('uploads'));

// Modules
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/occupations', occupationRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/assessor', assessorRoutes);

// error handler middleware (DON'T MOVE IT)
app.use(errorHandler);

export default app;
