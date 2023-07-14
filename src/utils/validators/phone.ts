// Value must be 10 numeric digits for proper insertion into DB
export const isValidPhoneNumber = (input: string) => {
  // Check if the resulting string is a valid phone number
  // You can modify this regular expression pattern based on your desired phone number format
  const phoneNumberPattern = /^\d{10}$/; // Example pattern for a 10-digit phone number

  return phoneNumberPattern.test(input);
};
