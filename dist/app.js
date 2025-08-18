"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
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
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/admin/dashboard/dashboard.routes"));
const occupation_routes_1 = __importDefault(require("./modules/occupation/occupation.routes"));
const scheme_routes_1 = __importDefault(require("./modules/scheme/scheme.routes"));
const assessment_routes_1 = __importDefault(require("./modules/assessement/assessment.routes"));
const schedule_routes_1 = __importDefault(require("./modules/assessement/schedule/schedule.routes"));
const ak_routes_1 = __importDefault(require("./modules/assessement/ak/ak.routes"));
// Core
app.use('/api/assessment', assessment_routes_1.default);
app.use('/api/assessment/ak', ak_routes_1.default);
app.use('/api/schedule', schedule_routes_1.default);
app.use('/api/uploads', express_1.default.static('uploads'));
// Modules
app.use('/api/auth', auth_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/occupation', occupation_routes_1.default);
app.use('/api/scheme', scheme_routes_1.default);
// error handler middleware (DON'T MOVE IT)
app.use(error_middleware_1.errorHandler);
exports.default = app;
