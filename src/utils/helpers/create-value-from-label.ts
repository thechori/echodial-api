// Very basic - don't even worry about breaking apart based on capitalization differences
export function createValueFromLabel(label: string) {
  // Remove whitespace
  const trimmed = label.trim();

  // Check for empty input
  if (trimmed === "") throw new Error(blankInputError);

  //replace special characters and spaces with "_", consecutive
  //underscores become one underscore
  const replacedLabel = trimmed.replace(/[^\w\s]/g, "_").replace(/_+/g, "_");
  console.log(replacedLabel.toLowerCase());

  // Return final value
  return replacedLabel.toLowerCase();
}

export const blankInputError = "Label must be at least one character long";
