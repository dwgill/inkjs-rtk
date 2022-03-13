import { combineReducers } from "@reduxjs/toolkit";
import React from "react";
import { getStorySelectors, storySliceReducer } from "../state";
import { choicesActions } from "../state/choices";
import { chooseChoice } from "../state/independentActions";
import {
  render,
  TestRootState,
  screen,
  createStore,
  fireEvent,
} from "../testUtils";
import Choices from "./Choices";

const selectors = getStorySelectors((state: TestRootState) => state.story);

const reducer = combineReducers({ story: storySliceReducer });

describe("<Choices />", () => {
  it("works", () => {
    const initState = [
      choicesActions.setChoices([
        {
          id: "foo_id",
          index: 0,
          isInvisibleDefault: false,
          originalThreadIndex: 0,
          text: "foo",
        },
        {
          id: "bar_id",
          index: 1,
          isInvisibleDefault: false,
          originalThreadIndex: 0,
          text: "bar",
        },
        {
          id: "foobar_id",
          index: 2,
          isInvisibleDefault: false,
          originalThreadIndex: 0,
          text: "foobar",
        },
        {
          id: "barfoo_id",
          index: 3,
          isInvisibleDefault: false,
          originalThreadIndex: 0,
          text: "barfoo",
        },
      ]),
    ].reduce(reducer, undefined);
    const store = createStore(initState);
    const dispatch = jest.spyOn(store, "dispatch");

    render(<Choices getState={selectors.selectStorySlice} />, {
      store,
    });
    expect(screen.getByText("foo", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("bar", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("foobar", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("barfoo", { exact: true })).toBeInTheDocument();
    fireEvent.click(screen.getByText("barfoo", { exact: true }));
    expect(dispatch).toHaveBeenCalledWith(
      chooseChoice({
        choiceId: "barfoo_id",
      })
    );
  });
});
