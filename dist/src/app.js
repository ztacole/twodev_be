"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_middleware_1 = require("./middleware/auth.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(__dirname + '/../api-contract/openapi.yaml');
dotenv.config();
const app = (0, express_1.default)();
app.use(cors());
app.use(express_1.default.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const user_route_1 = __importDefault(require("./modules/user/user.route"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const approval_routes_1 = __importDefault(require("./modules/admin/approval/approval.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const occupation_routes_1 = __importDefault(require("./modules/occupation/occupation.routes"));
const scheme_routes_1 = __importDefault(require("./modules/scheme/scheme.routes"));
const assessment_routes_1 = __importDefault(require("./modules/assessement/assessment.routes"));
const verification_routes_1 = __importDefault(require("./modules/assessement/verification.routes"));
const uploads_routes_1 = __importDefault(require("./modules/assessement/uploads/uploads.routes"));
const schedule_routes_1 = __importDefault(require("./modules/schedule/schedule.routes"));
const assessor_routes_1 = __importDefault(require("./modules/assessor/assessor.routes"));
const assessor_detail_routes_1 = __importDefault(require("./modules/assessor-detail/assessor-detail.routes"));
const asseesee_routes_1 = __importDefault(require("./modules/assessee/asseesee.routes"));
// Public
const public_routes_1 = __importDefault(require("./modules/public/public.routes"));
app.use('/api/public', public_routes_1.default);
app.get('/uploads/apl-01/:folder/:filename', auth_middleware_1.authUpload, (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path_1.default.join(__dirname, '../public/uploads/apl-01', folder, filename);
    if (!fs_1.default.existsSync(filePath))
        return res.status(404).json({ message: 'File not found' });
    res.sendFile(filePath);
});
app.use('/api/assessments', assessment_routes_1.default);
app.use('/api/assessments', verification_routes_1.default);
app.use('/api/schedules', schedule_routes_1.default);
// Uploads (generic) API
app.use('/api/uploads', uploads_routes_1.default);
// Serve uploaded files (secured by auth for now)
app.use('/uploads', auth_middleware_1.authUpload, express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
// Modules
app.use('/api/users', user_route_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/approval', approval_routes_1.default);
app.use('/api/occupations', occupation_routes_1.default);
app.use('/api/schemes', scheme_routes_1.default);
app.use('/api/assessor', assessor_routes_1.default);
app.use('/api/assessee', asseesee_routes_1.default);
app.use('/api/user', user_route_1.default);
app.use('/api/assessor-detail', assessor_detail_routes_1.default);
// error handler middleware (DON'T MOVE IT)
app.use(error_middleware_1.errorHandler);
exports.default = app;
