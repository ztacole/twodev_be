"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const error_1 = require("../common/error");
const errorHandler = (err, req, res, next) => {
    const errorResponse = Object.assign({ success: false, message: err.message }, (process.env.NODE_ENV === 'development' && { stack: err.stack }));
    const statusCode = err instanceof error_1.AppError ? err.statusCode : 500;
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
