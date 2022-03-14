import { combineReducers } from "@reduxjs/toolkit";
import React from "react";
import { getStorySelectors, storySliceReducer } from "../state";
import { setStory } from "../state/independentActions";
import { linesActions } from "../state/lines";
import {
  cleanup,
  createStore,
  render,
  screen,
  TestRootState,
} from "../testUtils";
import { simpleSetFromArr } from "../util/simpleSet";
import { LineKind } from "../util/types";
import Narrative, { LineComponent, LineGroupComponent } from "./Narrative";

const selectors = getStorySelectors((state: TestRootState) => state.story);

const reducer = combineReducers({ story: storySliceReducer });

const texts = {
  quickBrownFox: "The quick brown fox jumps over the lazy dog.",
  onceUponTime: "Once upon a time there was was man and a woman.",
  toBeOrNot: "To be or not to be, that is the question.",
  theseAreTimes: "These are the times that try men's souls.",
};

const newLine = (text: string, { tags = [] }: { tags?: string[] } = {}) =>
  linesActions.addLine({
    lineKind: LineKind.Text,
    text,
    ...(!!tags?.length && {
      tags: simpleSetFromArr(tags),
    }),
  });

const CustomLine: LineComponent = ({ lineData }) => {
  return <span id={lineData.id}>{lineData.text}</span>;
};

const CustomLineGroup: LineGroupComponent = ({ children, firstLine }) => {
  return <p id={`group-${firstLine?.id}`}>{children}</p>;
};

describe("<Narrative />", () => {
  afterEach(() => {
    cleanup();
  });

  const initState = [
    newLine(texts.quickBrownFox),
    newLine(texts.onceUponTime),
  ].reduce(reducer, undefined);

  it("works w/defaults", () => {
    const store = createStore(initState);
    render(<Narrative getState={selectors.selectStorySlice} />, { store });
    expect(screen.getByText(texts.quickBrownFox)).toBeInTheDocument();
    expect(screen.getByText(texts.quickBrownFox).tagName).toEqual("P");
    expect(screen.getByText(texts.onceUponTime)).toBeInTheDocument();
    expect(screen.getByText(texts.onceUponTime).tagName).toEqual("P");
    expect(() => {
      screen.getByText(texts.toBeOrNot);
    }).toThrow();
    store.dispatch(newLine(texts.toBeOrNot));
    expect(screen.getByText(texts.toBeOrNot)).toBeInTheDocument();
    expect(screen.getByText(texts.toBeOrNot).tagName).toEqual("P");
  });

  it("works w/custom line", () => {
    const store = createStore(initState);
    render(
      <Narrative
        getState={selectors.selectStorySlice}
        lineComponent={CustomLine}
      />,
      { store }
    );
    expect(screen.getByText(texts.quickBrownFox)).toBeInTheDocument();
    expect(screen.getByText(texts.quickBrownFox).tagName).toEqual("SPAN");
    expect(screen.getByText(texts.quickBrownFox).id).toBeTruthy();
    expect(screen.getByText(texts.onceUponTime)).toBeInTheDocument();
    expect(screen.getByText(texts.onceUponTime).tagName).toEqual("SPAN");
    expect(screen.getByText(texts.onceUponTime).id).toBeTruthy();
  });

  it("works w/custom line & group", () => {
    const store = createStore(
      [
        setStory(null, {
          version: 1,
          lineGrouping: {
            groupTags: ["foo"],
            grouplessTags: [],
          },
        }),
        newLine(texts.onceUponTime),
        newLine(texts.quickBrownFox, { tags: ["foo"] }),
        newLine(texts.toBeOrNot),
        newLine(texts.theseAreTimes, { tags: ["foo"] }),
      ].reduce(reducer, undefined)
    );
    render(
      <Narrative
        getState={selectors.selectStorySlice}
        lineComponent={CustomLine}
        lineGroupComponent={CustomLineGroup}
      />,
      { store }
    );
    expect(screen.getByText(texts.onceUponTime)).toBeInTheDocument();
    expect(screen.getByText(texts.onceUponTime).tagName).toEqual("SPAN");
    expect(screen.getByText(texts.onceUponTime).parentElement?.tagName).toEqual(
      "P"
    );
    expect(screen.getByText(texts.onceUponTime).parentElement?.id).toBeTruthy();
    expect(
      screen.getByText(texts.onceUponTime).parentElement?.childElementCount
    ).toEqual(1);

    expect(screen.getByText(texts.quickBrownFox)).toBeInTheDocument();
    expect(
      screen.getByText(texts.quickBrownFox).parentElement?.childElementCount
    ).toEqual(2);
    expect(
      screen.getByText(texts.quickBrownFox).nextSibling?.textContent
    ).toEqual(texts.toBeOrNot);

    expect(screen.getByText(texts.theseAreTimes)).toBeInTheDocument();
    expect(
      screen.getByText(texts.theseAreTimes).parentElement?.childElementCount
    ).toEqual(1);
    store.dispatch(newLine("foobar"));
    expect(
      screen.getByText(texts.theseAreTimes).parentElement?.childElementCount
    ).toEqual(2);
  });
});
