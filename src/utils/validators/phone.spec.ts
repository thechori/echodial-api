import { isValidPhoneNumber } from "./phone";

// Unit tests for isValidPhoneNumber function
describe("isValidPhoneNumber", () => {
  it("should return true for a valid phone number", () => {
    const phoneNumber = "+18326460869";
    const isValid = isValidPhoneNumber(phoneNumber);
    expect(isValid).toBe(true);
  });

  it("should return false for an invalid phone number", () => {
    const phoneNumber = "1234";
    const isValid = isValidPhoneNumber(phoneNumber);
    expect(isValid).toBe(false);
  });

  it("should return false for a phone number with non-digit characters", () => {
    const phoneNumber = "123-456-7890";
    const isValid = isValidPhoneNumber(phoneNumber);
    expect(isValid).toBe(false);
  });
});
