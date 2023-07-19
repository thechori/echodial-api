export const isValidEmailAddress = (input: string): boolean => {
  // Email address validation regular expression pattern
  // This pattern follows a simple format, but may not cover all edge cases
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  return emailPattern.test(input);
};
