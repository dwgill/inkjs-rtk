import { simpleSetFromArr, simpleSetToArr } from "./simpleSet";

describe("simpleSet", () => {
  describe("simpleSetFromArr()", () => {
    it("works", () => {
      expect(simpleSetFromArr(["foo", "bar", "foobar"])).toEqual({
        foo: true,
        bar: true,
        foobar: true,
      });
      expect(simpleSetFromArr(["foo", "foobar"])).toEqual({
        foo: true,
        foobar: true,
      });
    });
  });
  describe("simpleSetToArr()", () => {
    const result = simpleSetToArr({
      foo: true,
      foobar: true,
    });
    expect(result.length).toEqual(2);
    expect(result).toEqual(expect.arrayContaining(["foobar", "foo"]));
  });
});
