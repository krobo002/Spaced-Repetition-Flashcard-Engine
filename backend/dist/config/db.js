"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            console.error('MONGO_URI not found in .env file');
            process.exit(1);
        }
        await mongoose_1.default.connect(mongoURI);
        console.log('MongoDB Connected...');
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};
exports.default = connectDB;
