"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validator = void 0;
const validatorjs_1 = __importDefault(require("validatorjs"));
const validator = (body, rules, customMessage, callback) => {
    const validation = new validatorjs_1.default(body, rules, customMessage);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors, false));
};
exports.validator = validator;
