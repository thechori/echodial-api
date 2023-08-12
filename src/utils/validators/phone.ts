// Value must be "+1" followed by 10 numeric digits for proper insertion into DB
// E.g., +18326460869
export const isValidPhoneNumberForDb = (input: string) => {
  // Check if the resulting string is a valid phone number
  const phoneNumberPattern = /\+1\d{10}/;

  return phoneNumberPattern.test(input);
};

// Goal:
// Take raw inputs:
// - "832-646-0869"
// - "832 646 0869"
// - " 832  646 - 0869 "
// - "(832) 646-0869"
// And format the string to insert into DB with "+1"
// Returns "+18326460869"
export const transformPhoneNumberForDb = (input: string) => {
  // Remove whitespace
  const trimmedVal = input.trim();

  // Remove non-digit chars (e.g., "-" or " " or "(" or ")")
  const digits = trimmedVal.replace(/\D/g, "");

  // Prepend +1 for USA country code and return
  return `+1${digits}`;
};
