"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const error_middleware_1 = require("./middleware/error.middleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = (0, express_1.default)();
// Trust reverse proxy (LiteSpeed) so rate-limiter and client IP work correctly
app.set("trust proxy", 1);
// whitelist domain from env
const whitelist = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
    : [];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS blocked: Origin ${origin} has no access.`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
// rate limitter
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 menit
    max: 300,
    standardHeaders: true,
    legacyHeaders: true,
});
// auth limitter
const authLimitter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 1 menit
    max: 50,
    standardHeaders: true,
    legacyHeaders: true,
    message: {
        success: false,
        message: "Terlalu banyak percobaan login, coba lagi setelah 15 menit",
    },
});
app.use(generalLimiter);
// Disable caching for all API responses
app.use((req, res, next) => {
    res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
    });
    next();
});
app.use(express_1.default.json({ limit: "100mb" }));
app.use(express_1.default.urlencoded({ limit: "100mb", extended: true }));
// ROUTES
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const approval_routes_1 = __importDefault(require("./modules/admin/approval/approval.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const occupation_routes_1 = __importDefault(require("./modules/occupation/occupation.routes"));
const scheme_routes_1 = __importDefault(require("./modules/scheme/scheme.routes"));
const assessment_routes_1 = __importDefault(require("./modules/assessement/assessment.routes"));
const verification_routes_1 = __importDefault(require("./modules/assessement/verification/verification.routes"));
const schedule_routes_1 = __importDefault(require("./modules/schedule/schedule.routes"));
const assessor_routes_1 = __importDefault(require("./modules/assessor/assessor.routes"));
const assessor_detail_routes_1 = __importDefault(require("./modules/assessor-detail/assessor-detail.routes"));
const asseesee_routes_1 = __importDefault(require("./modules/assessee/asseesee.routes"));
const role_routes_1 = __importDefault(require("./modules/role/role.routes"));
const public_routes_1 = __importDefault(require("./modules/public/public.routes"));
// Public routes
app.use("/twodev/api/public", public_routes_1.default);
app.use("/twodev/api/uploads", express_1.default.static(path_1.default.join(__dirname, "../public/uploads")));
// Modules
app.use("/twodev/api/assessments", assessment_routes_1.default);
app.use("/twodev/api/assessments", verification_routes_1.default);
app.use("/twodev/api/schedules", schedule_routes_1.default);
// app.use('/twodev/api/uploads', uploadsRoutes);
// 📁 Serve uploads (tanpa cache)
app.use("/twodev/api/roles", role_routes_1.default);
app.use("/twodev/api/users", user_routes_1.default);
app.use("/twodev/api/user", user_routes_1.default);
app.use("/twodev/api/auth", auth_routes_1.default);
app.use("/twodev/api/dashboard", dashboard_routes_1.default);
app.use("/twodev/api/approval", approval_routes_1.default);
app.use("/twodev/api/admins", admin_routes_1.default);
app.use("/twodev/api/occupations", occupation_routes_1.default);
app.use("/twodev/api/schemes", scheme_routes_1.default);
app.use("/twodev/api/assessor", assessor_routes_1.default);
app.use("/twodev/api/assessor-detail", assessor_detail_routes_1.default);
app.use("/twodev/api/assessee", asseesee_routes_1.default);
// Error handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
