"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
exports.default = {
    schema: './src/drizzle/schema.ts',
    out: './drizzle/migrations',
    driver: 'mysql2',
    dialect: 'mysql',
    dbCredentials: {
        uri: process.env.DATABASE_URL,
    },
};
