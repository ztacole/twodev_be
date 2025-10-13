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

// 🚫 Middleware global anti-cache (sebelum semua route)
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
  });

  // Hindari ETag dan Last-Modified dari middleware lain
  res.removeHeader('ETag');
  res.removeHeader('Last-Modified');

  next();
});

// ROUTES
import userRoutes from './modules/user/user.routes';
import authRoutes from './modules/auth/auth.routes';
import approvalRoutes from './modules/admin/approval/approval.routes';
import adminRoutes from './modules/admin/admin.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import occupationRoutes from './modules/occupation/occupation.routes';
import schemeRoutes from './modules/scheme/scheme.routes';
import assessmentRoutes from './modules/assessement/assessment.routes';
import verificationRoutes from './modules/assessement/verification/verification.routes';
import uploadsRoutes from './modules/assessement/uploads/uploads.routes';
import scheduleRoutes from './modules/schedule/schedule.routes';
import assessorRoutes from './modules/assessor/assessor.routes';
import assessorDetailRoutes from './modules/assessor-detail/assessor-detail.routes';
import assesseeRoutes from './modules/assessee/asseesee.routes';
import roleRoutes from './modules/role/role.routes';
import publicRoutes from './modules/public/public.routes';

// Public routes
app.use('/twodev/api/public', publicRoutes);

// Modules
app.use('/twodev/api/assessments', assessmentRoutes);
app.use('/twodev/api/assessments', verificationRoutes);
app.use('/twodev/api/schedules', scheduleRoutes);
app.use('/twodev/api/uploads', uploadsRoutes);

// 📁 Serve uploads (tanpa cache)
app.use(
  '/twodev/api/uploads',
  express.static(path.join(__dirname, '../public/uploads'), {
    etag: false,
    lastModified: false,
    cacheControl: false,
    setHeaders: (res) => {
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      });
    },
  })
);

app.use('/twodev/api/roles', roleRoutes);
app.use('/twodev/api/users', userRoutes);
app.use('/twodev/api/auth', authRoutes);
app.use('/twodev/api/dashboard', dashboardRoutes);
app.use('/twodev/api/approval', approvalRoutes);
app.use('/twodev/api/admins', adminRoutes);
app.use('/twodev/api/occupations', occupationRoutes);
app.use('/twodev/api/schemes', schemeRoutes);
app.use('/twodev/api/assessor', assessorRoutes);
app.use('/twodev/api/assessor-detail', assessorDetailRoutes);
app.use('/twodev/api/assessee', assesseeRoutes);
app.use('/twodev/api/user', userRoutes);

// Error handler
app.use(errorHandler);

export default app;
