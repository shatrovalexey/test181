"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorRes = exports.successRes = void 0;
const successRes = (data) => {
    return {
        data,
        success: true
    };
};
exports.successRes = successRes;
const errorRes = (errMessage, code = 500) => {
    return {
        data: [],
        success: false,
        error: {
            message: errMessage,
            code
        }
    };
};
exports.errorRes = errorRes;
