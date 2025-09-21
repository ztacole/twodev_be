"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanString = cleanString;
function cleanString(str) {
    return str.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
}
