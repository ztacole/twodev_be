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

import userRoutes from './modules/user/user.routes';
import authRoutes from './modules/auth/auth.routes';
import dashboardRoutes from './modules/admin/dashboard/dashboard.routes';
import assesseeRoutes from './modules/assessee/assessee.routes';
import assessorRoutes from './modules/assessor/assessor.routes';
import occupationRoutes from './modules/occupation/occupation.routes';
import schemeRoutes from './modules/scheme/scheme.routes';
import apl1Routes from './modules/assessement/apl1/apl1.routes';
import apl2Routes from './modules/assessement/apl2/apl2.routes';
import questionRoutes from './modules/assessement/question/question.routes';
import scheduleRoutes from './modules/assessement/schedule/schedule.routes';

// Core
app.use('/api/assessment/apl1', apl1Routes);
app.use('/api/assessment/apl2', apl2Routes);
app.use('/api/questions', questionRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/uploads', express.static('uploads'));

// Modules
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/assessee', assesseeRoutes);
app.use('/api/assessor', assessorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/occupation', occupationRoutes);
app.use('/api/scheme', schemeRoutes);

// error handler middleware (DON'T MOVE IT)
app.use(errorHandler);

export default app;
