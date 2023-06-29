/**
 *
 * @param error Generic error object
 * @param message Optional message that can be passed in to override default message
 * @returns Error message to show user
 */
exports.extractErrorMessage = (
  error,
  message = "There was an error. Please try again later."
) => {
  if (error instanceof Error) {
    return error.message;
  }

  return message;
};
