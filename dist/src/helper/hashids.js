"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeId = exports.getAssessorUrl = exports.getAssesseeUrl = exports.hashids = void 0;
const hashids_1 = __importDefault(require("hashids"));
exports.hashids = new hashids_1.default(process.env.HASH_SALT, 64);
const getAssesseeUrl = (id) => {
    const encodedId = exports.hashids.encode(id);
    return `${process.env.APP_URL}/public/data-asesi/${encodedId}`;
};
exports.getAssesseeUrl = getAssesseeUrl;
const getAssessorUrl = (id) => {
    const encodedId = exports.hashids.encode(id);
    return `${process.env.APP_URL}/public/data-asesor/${encodedId}`;
};
exports.getAssessorUrl = getAssessorUrl;
const decodeId = (id) => exports.hashids.decode(id)[0];
exports.decodeId = decodeId;
