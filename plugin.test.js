import { XlsTranslations } from "./index.mjs";

describe("XlsTranslations", () => {
  it("should be defined", () => {
    expect(XlsTranslations).toBeDefined();
  });
  it("should be a class", () => {
    expect(typeof XlsTranslations).toBe("function");
  });
  it("should have a constructor", () => {
    expect(XlsTranslations.prototype.constructor).toBeDefined();
  });
  it("should have a method called getTranslations", () => {
    expect(XlsTranslations.prototype.getTranslations).toBeDefined();
  });
  it("should have a method called getTranslationsFromXls", () => {
    expect(XlsTranslations.prototype.getTranslationsFromXls).toBeDefined();
  });
});
