import isEmptyTextLine from "./isEmptyTextLine";
import { LineKind, TextLineData } from "./types";

describe("isEmptyTextLine()", () => {
  it("works", () => {
    expect(isEmptyTextLine(null as any)).toBe(false);
    const emptyLine: TextLineData = {
      id: "fooid",
      index: 123,
      lineKind: LineKind.Text,
      text: "",
    };
    expect(isEmptyTextLine(emptyLine)).toBe(true);
    expect(
      isEmptyTextLine({
        ...emptyLine,
        tags: {},
      })
    ).toBe(true);
    expect(
      isEmptyTextLine({
        ...emptyLine,
        meta: {},
      })
    ).toBe(true);
    expect(
      isEmptyTextLine({
        ...emptyLine,
        meta: {},
        tags: {},
      })
    ).toBe(true);
    expect(
      isEmptyTextLine({
        ...emptyLine,
        text: "foo",
      })
    ).toBe(false);
    expect(
      isEmptyTextLine({
        ...emptyLine,
        tags: { foo: true },
      })
    ).toBe(false);
    expect(
      isEmptyTextLine({
        ...emptyLine,
        meta: { foo: true },
      })
    ).toBe(false);
    expect(
      isEmptyTextLine({
        ...emptyLine,
        meta: { foo: true },
        tags: { bar: true },
      })
    ).toBe(false);
  });
});
