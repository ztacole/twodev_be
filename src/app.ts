import express, { Request, Response } from 'express';
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
import occupationRoutes from './modules/occupation/occupation.routes';

// DONE - DONE
import apl1Routes from './modules/assessement/apl1/apl1.routes';
import apl2Routes from './modules/assessement/apl2/apl2.routes';

app.use('/api/assessment/apl1', apl1Routes);
app.use('/api/assessment/apl2', apl2Routes);
// DONE - DONE

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/assessees', assesseeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/occupations', occupationRoutes);

app.use('/uploads', express.static('uploads'));

export default app;
