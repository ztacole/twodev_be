const express = require('express');
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
// import majorRoutes from './modules/major/major.routes';
import dashboardRoutes from './modules/admin/dashboard/dashboard.routes';
import assesseeRoutes from './modules/assessee/assessee.routes';
import unitCompetencyRoutes from './modules/unit-competency/unit-competency.routes';
import occupationRoutes from './modules/occupation/occupation.routes';
import apl1Routes from './modules/apl1/apl1.routes';

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api/majors', majorRoutes);
app.use('/api/assessees', assesseeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/unit-competencies', unitCompetencyRoutes);
app.use('/api/occupations', occupationRoutes);
app.use('/api/apl1', apl1Routes);

/* -------- TODO --------
  
*/


export default app;
