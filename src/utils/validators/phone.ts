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

  // Check if it's already a valid value (this is popular when PUTing)
  if (isValidPhoneNumberForDb(trimmedVal)) {
    return trimmedVal;
  }

  // Remove non-digit chars (e.g., "-" or " " or "(" or ")")
  const digits = trimmedVal.replace(/\D/g, "");

  // Check if the digits have length 11 and the first digit is '1'
  if (digits.length === 11 && digits.charAt(0) === '1') {
    // If it is, append "+" and return
    return `+${digits}`;
  } else {
    // If not, prepend +1 for USA country code and return
    return `+1${digits}`;
  }
};
