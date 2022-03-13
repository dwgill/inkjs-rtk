import { evaluateLineGroupIndicator, groupLines } from "./lineGroups";
import { LineData, LineKind } from "./types";

describe("lineGroups", () => {
  describe("evaluateLineGroupIndicator()", () => {
    it("works", () => {
      const fakeLine: LineData = {
        id: "foo",
        index: 1,
        lineKind: LineKind.Text,
        text: "foobar",
      };
      expect(
        evaluateLineGroupIndicator({
          ...fakeLine,
        })
      ).toEqual(0);
      expect(
        evaluateLineGroupIndicator({
          ...fakeLine,
          groupTags: [],
        })
      ).toEqual(0);
      expect(
        evaluateLineGroupIndicator({
          ...fakeLine,
          groupTags: ["foobar"],
        })
      ).toEqual(1);
      expect(
        evaluateLineGroupIndicator({
          ...fakeLine,
          ungroupTags: ["foobar"],
        })
      ).toEqual(-1);
      expect(
        evaluateLineGroupIndicator({
          ...fakeLine,
          groupTags: ["foobar"],
          ungroupTags: ["barfoo"],
        })
      ).toEqual(1);
    });
  });
  describe("groupLines()", () => {
    it("defaults to one big group", () => {
      expect(
        groupLines(
          [
            "foo0",
            "foo1",
            "foo2",
            "foo3",
            "foo4",
            "foo5",
            "foo6",
            "foo7",
            "foo8",
            "foo9",
          ],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        )
      ).toEqual([
        [
          "foo0",
          "foo1",
          "foo2",
          "foo3",
          "foo4",
          "foo5",
          "foo6",
          "foo7",
          "foo8",
          "foo9",
        ],
      ]);
    });
    it("splits groups over an ungroup entry", () => {
      expect(
        groupLines(
          [
            "foo0",
            "foo1",
            "foo2",
            "foo3",
            "foo4",
            "foo5",
            "foo6",
            "foo7",
            "foo8",
            "foo9",
          ],
          [0, 0, 0, 0, -1, 0, 0, 0, 0, 0]
        )
      ).toEqual([
        ["foo0", "foo1", "foo2", "foo3"],
        "foo4",
        ["foo5", "foo6", "foo7", "foo8", "foo9"],
      ]);
    });
    it("ends & starts a new group when a positive entry is found", () => {
      expect(
        groupLines(
          [
            "foo0",
            "foo1",
            "foo2",
            "foo3",
            "foo4",
            "foo5",
            "foo6",
            "foo7",
            "foo8",
            "foo9",
          ],
          [0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
        )
      ).toEqual([
        ["foo0", "foo1", "foo2", "foo3"],
        ["foo4", "foo5", "foo6", "foo7", "foo8", "foo9"],
      ]);
    });
    it("handles successive newgroup entries as distinct groups", () => {
      expect(
        groupLines(["foo0", "foo1", "foo2", "foo3", "foo4"], [1, 1, 1, 1, 1])
      ).toEqual([["foo0"], ["foo1"], ["foo2"], ["foo3"], ["foo4"]]);
    });
    it("handles successive ungroup entries as distinct groups", () => {
      expect(
        groupLines(
          ["foo0", "foo1", "foo2", "foo3", "foo4"],
          [-1, -1, -1, -1, -1]
        )
      ).toEqual(["foo0", "foo1", "foo2", "foo3", "foo4"]);
    });
    it("normal entries default to groups after an ungroup", () => {
      expect(
        groupLines(["foo0", "foo1", "foo2", "foo3", "foo4"], [-1, -1, 0, 0, 0])
      ).toEqual(["foo0", "foo1", ["foo2", "foo3", "foo4"]]);
    });
  });
});
