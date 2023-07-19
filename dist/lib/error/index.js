"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractErrorMessage = void 0;
/**
 *
 * @param error Generic error object
 * @param message Optional message that can be passed in to override default message
 * @returns Error message to show user
 */
var extractErrorMessage = function (error, message) {
    if (message === void 0) { message = "There was an error. Please try again later."; }
    if (error instanceof Error) {
        return error.message;
    }
    return message;
};
exports.extractErrorMessage = extractErrorMessage;
//# sourceMappingURL=index.js.map