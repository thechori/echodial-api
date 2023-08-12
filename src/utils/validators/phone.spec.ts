import { isValidPhoneNumberForDb, transformPhoneNumberForDb } from "./phone";

// Unit tests for isValidPhoneNumberForDb function
describe("isValidPhoneNumberForDb", () => {
  it("should return true for a valid phone number", () => {
    const phoneNumber = "+18326460869";
    const isValid = isValidPhoneNumberForDb(phoneNumber);
    expect(isValid).toBe(true);
  });

  it("should return false for a valid phone number with a non-US country code", () => {
    const phoneNumber = "+28326460869";
    const isValid = isValidPhoneNumberForDb(phoneNumber);
    expect(isValid).toBe(false);
  });

  it("should return false for an invalid phone number", () => {
    const phoneNumber = "+12234";
    const isValid = isValidPhoneNumberForDb(phoneNumber);
    expect(isValid).toBe(false);
  });

  it("should return false for a phone number with non-digit characters", () => {
    const phoneNumber = "123-456-7890";
    const isValid = isValidPhoneNumberForDb(phoneNumber);
    expect(isValid).toBe(false);
  });

  it("should return false for a phone number with non-digit characters", () => {
    const phoneNumber = "123-456-7890";
    const isValid = isValidPhoneNumberForDb(phoneNumber);
    expect(isValid).toBe(false);
  });

  it("should return false for a random, invalid number", () => {
    const phoneNumber = "234234";
    const isValid = isValidPhoneNumberForDb(phoneNumber);
    expect(isValid).toBe(false);
  });
});

// Unit tests for transformPhoneNumberForDb function
describe("transformPhoneNumberForDb", () => {
  it("should properly format a well-formed number", () => {
    const input = "832-646-0869";
    const output = "+18326460869";
    expect(transformPhoneNumberForDb(input)).toEqual(output);
  });

  it("should properly format a number with spaces", () => {
    const input = "832 646 0869";
    const output = "+18326460869";
    expect(transformPhoneNumberForDb(input)).toEqual(output);
  });

  it("should properly format a number with spaces and a dash", () => {
    const input = " 832  646 - 0869 ";
    const output = "+18326460869";
    expect(transformPhoneNumberForDb(input)).toEqual(output);
  });

  it("should properly format a number with parantheses and a dash", () => {
    const input = "(832) 646-0869";
    const output = "+18326460869";
    expect(transformPhoneNumberForDb(input)).toEqual(output);
  });
});
