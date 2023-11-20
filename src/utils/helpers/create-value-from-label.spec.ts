import {
  blankInputError,
  createValueFromLabel,
  specialCharError,
} from "./create-value-from-label";

// Unit tests
describe("createValueFromLabel", () => {
  // "HomeSlice" -> "homeslice"
  it("should format a camel-cased input", () => {
    const input = "HomeSlice";
    const output = "homeslice";
    expect(createValueFromLabel(input)).toEqual(output);
  });

  // "Home slice" -> "home_slice"
  it("should format two space-separated words", () => {
    const input = "Home slice";
    const output = "home_slice";
    expect(createValueFromLabel(input)).toEqual(output);
  });

  // "Home slice zzz" -> "home_slice_zzz"
  it("should format three space-separated words", () => {
    const input = "Home slice zzz";
    const output = "home_slice_zzz";
    expect(createValueFromLabel(input)).toEqual(output);
  });

  // "Homeslice" -> "homeslice"
  it("should format a single word", () => {
    const input = "Homeslice";
    const output = "homeslice";
    expect(createValueFromLabel(input)).toEqual(output);
  });

  // "homeSlice" -> "homeslice"
  it("should format a single word", () => {
    const input = "homeSlice";
    const output = "homeslice";
    expect(createValueFromLabel(input)).toEqual(output);
  });

  // "home'slice" -> throw Error("Label cannot contain special characters")
  it("should throw an error", () => {
    const input = "home'slice";
    expect(() => createValueFromLabel(input)).toThrowError(specialCharError);
  });

  // "home@slice" -> throw Error("Label cannot contain special characters")
  it("should throw an error", () => {
    const input = "home@slice";
    expect(() => createValueFromLabel(input)).toThrowError(specialCharError);
  });

  // "home!slice" -> throw Error("Label cannot contain special characters")
  it("should throw an error", () => {
    const input = "home!slice";
    expect(() => createValueFromLabel(input)).toThrowError(specialCharError);
  });

  // "home-slice" -> throw Error("Label cannot contain special characters")
  it("should throw an error", () => {
    const input = "home-slice";
    expect(() => createValueFromLabel(input)).toThrowError(specialCharError);
  });

  // "" -> throw Error("Label must be at least one character long")
  it("should throw an error", () => {
    const input = "";
    expect(() => createValueFromLabel(input)).toThrowError(blankInputError);
  });
});