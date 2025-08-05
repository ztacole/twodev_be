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

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

export default app;
