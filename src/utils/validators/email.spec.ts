import { isValidEmailAddress } from "./email";

// Unit tests for isValidEmailAddress function
describe("isValidEmailAddress", () => {
  it("should return true for a valid email address", () => {
    const emailAddress = "test@example.com";
    const isValid = isValidEmailAddress(emailAddress);
    expect(isValid).toBe(true);
  });

  it("should return false for an invalid email address", () => {
    const emailAddress = "invalid";
    const isValid = isValidEmailAddress(emailAddress);
    expect(isValid).toBe(false);
  });

  it("should return false for an email address without domain", () => {
    const emailAddress = "test@";
    const isValid = isValidEmailAddress(emailAddress);
    expect(isValid).toBe(false);
  });
});
