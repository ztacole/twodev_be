"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateEntryError = exports.UnauthorizedError = exports.ValidationError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(entity) {
        super(`${entity} not found`, 404);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends AppError {
    constructor(details) {
        super('Validation failed: ' + details, 400);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class DuplicateEntryError extends AppError {
    constructor(field, value) {
        super(`${field} '${value}' already exists`, 409);
        this.name = 'DuplicateEntryError';
    }
}
exports.DuplicateEntryError = DuplicateEntryError;
