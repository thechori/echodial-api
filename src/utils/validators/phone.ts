// Value must be 10 numeric digits for proper insertion into DB
export const isValidPhoneNumber = (input: string) => {
  // Check if the resulting string is a valid phone number
  const phoneNumberPattern = /^\+[1-9]{1}[0-9]{3,14}$/;

  return phoneNumberPattern.test(input);
};
