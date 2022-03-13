import { combineReducers } from "@reduxjs/toolkit";
import React from "react";
import { useChooseChoiceIndex } from "../hooks/useChooseChoice";
import { getStorySelectors, storySliceReducer } from "../state";
import { choicesActions } from "../state/choices";
import { chooseChoice } from "../state/independentActions";
import {
  render,
  TestRootState,
  screen,
  createStore,
  fireEvent,
  cleanup,
} from "../testUtils";
import Choices, { ChoiceComponent } from "./Choices";

const selectors = getStorySelectors((state: TestRootState) => state.story);

const reducer = combineReducers({ story: storySliceReducer });

describe("<Choices />", () => {
  afterEach(() => {
    cleanup();
  });
  it("works with default values", () => {
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
    for (const text of ["foo", "bar", "foobar", "barfoo"]) {
      expect(screen.getByText(text, { exact: true })).toBeInTheDocument();
      expect(screen.getByText(text, { exact: true }).tagName).toEqual("BUTTON");
    }
    fireEvent.click(screen.getByText("barfoo", { exact: true }));
    expect(dispatch).toHaveBeenCalledWith(
      chooseChoice({
        choiceId: "barfoo_id",
      })
    );
  });
  it("works with custom Choice element", () => {
    const CustomChoice: ChoiceComponent = ({ choiceData }) => {
      const onChooseChoice = useChooseChoiceIndex(choiceData.index);
      return (
        <div id={`choice-${choiceData.id}`}>
          <button onClick={() => onChooseChoice()}>{choiceData.text}</button>
        </div>
      );
    };
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
    const { container } = render(
      <Choices
        getState={selectors.selectStorySlice}
        choiceComponent={CustomChoice}
      />,
      { store }
    );
    for (const [id, text] of [
      ["foo_id", "foo"],
      ["bar_id", "bar"],
      ["foobar_id", "foobar"],
      ["barfoo_id", "barfoo"],
    ]) {
      // prettier-ignore
      expect(container.querySelector(`#choice-${id}`)).toBeInTheDocument();
      // prettier-ignore
      expect(container.querySelector(`#choice-${id}`)?.tagName).toEqual('DIV');
      // prettier-ignore
      expect(container.querySelector(`#choice-${id}`)?.childElementCount).toEqual(1);
      // prettier-ignore
      expect(container.querySelector(`#choice-${id}`)?.children.item(0)).toBeInTheDocument();
      // prettier-ignore
      expect(container.querySelector(`#choice-${id}`)?.children.item(0)?.textContent).toEqual(text)
      // prettier-ignore
      expect(container.querySelector(`#choice-${id}`)?.children.item(0)?.tagName).toEqual('BUTTON')
    }

    fireEvent.click(container.querySelector("#choice-foobar_id button")!);
    expect(dispatch).toHaveBeenCalledWith(
      chooseChoice({
        choiceIndex: 2,
      })
    );
  });
});
