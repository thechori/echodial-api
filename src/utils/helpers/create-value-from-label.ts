// Very basic - don't even worry about breaking apart based on capitalization differences
export function createValueFromLabel(label: string) {
  // Remove whitespace
  const trimmed = label.trim();

  // Check for empty input
  if (trimmed === "") throw new Error(blankInputError);

  // Check for special characters
  const regex = /[^A-Za-z0-9 ]/;
  if (regex.test(trimmed)) {
    // special chars found, throw error
    throw new Error(specialCharError);
  }

  // Return final value
  return trimmed.toLowerCase().split(" ").join("_");
}

export const blankInputError = "Label must be at least one character long";
export const specialCharError = "Label cannot contain special characters";
