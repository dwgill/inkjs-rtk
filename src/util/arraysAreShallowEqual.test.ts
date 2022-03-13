import arraysAreShallowEqual from "./arraysAreShallowEqual";

describe("arraysAreShallowEqual()", () => {
  it("works", () => {
    expect(arraysAreShallowEqual([], [])).toBe(true);
    expect(arraysAreShallowEqual([1], [1])).toBe(true);
    expect(arraysAreShallowEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(arraysAreShallowEqual([3, 2, 1], [3, 2, 1])).toBe(true);
    expect(
      arraysAreShallowEqual([3, 2, 1, "foobar"], [3, 2, 1, "foobar"])
    ).toBe(true);
    expect(arraysAreShallowEqual([3, 2, 1, "foobar"], [3, 2, 1])).toBe(false);
    expect(arraysAreShallowEqual([3, 2, 1, "foobar"], ["foobar"])).toBe(false);
    expect(arraysAreShallowEqual([3, 2, 1, {}], [3, 2, 1, {}])).toBe(false);
  });
});
