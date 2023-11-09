/**
 *
 * @param error Generic error object
 * @param message Optional message that can be passed in to override default message
 * @returns Error message to show user
 */
export const extractErrorMessage = (
  error: unknown,
  message = "There was an error. Please try again later.",
) => {
  if (error === null || error === undefined) return null;
  if (error instanceof Error) {
    return error.message;
  }

  return message;
};
