"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
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
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/admin/dashboard/dashboard.routes"));
const assessee_routes_1 = __importDefault(require("./modules/assessee/assessee.routes"));
const occupation_routes_1 = __importDefault(require("./modules/occupation/occupation.routes"));
const scheme_routes_1 = __importDefault(require("./modules/scheme/scheme.routes"));
// DONE - DONE
const apl1_routes_1 = __importDefault(require("./modules/assessement/apl1/apl1.routes"));
const apl2_routes_1 = __importDefault(require("./modules/assessement/apl2/apl2.routes"));
const schedule_routes_1 = __importDefault(require("./modules/assessement/schedule/schedule.routes"));
app.use('/api/assessment/apl1', apl1_routes_1.default);
app.use('/api/assessment/apl2', apl2_routes_1.default);
app.use('/api/schedule', schedule_routes_1.default);
app.use('/api/uploads', express_1.default.static('uploads'));
// DONE - DONE
app.use('/api/user', user_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/assessee', assessee_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/occupation', occupation_routes_1.default);
app.use('/api/scheme', scheme_routes_1.default);
exports.default = app;
