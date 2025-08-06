const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Import route modules
import userRoutes from './modules/user/user.routes';
import authRoutes from './modules/auth/auth.routes';

import dashboardRoutes from './modules/admin/dashboard/dashboard.routes';

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

export default app;
