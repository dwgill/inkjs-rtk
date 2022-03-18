import { combineReducers } from "@reduxjs/toolkit";
import { choicesReducer, getChoicesSelectors } from "./choices";
import { getLinesSelectors, linesReducer } from "./lines";
import { getMiscSelectors, miscReducer } from "./misc";
import { getVariablesSelectors, variablesReducer } from "./variables";

export const storySliceReducer = combineReducers({
  lines: linesReducer,
  variables: variablesReducer,
  misc: miscReducer,
  choices: choicesReducer,
});

export type StorySliceState = ReturnType<typeof storySliceReducer>;

export const getLinesFromStorySliceState =
  <S>(getStorySliceState: (rootState: S) => StorySliceState) =>
  (rootState: S) =>
    getStorySliceState(rootState).lines;
export const getVariablesFromStorySliceState =
  <S>(getStorySliceState: (rootState: S) => StorySliceState) =>
  (rootState: S) =>
    getStorySliceState(rootState).variables;
export const getChoicesFromStorySliceState =
  <S>(getStorySliceState: (rootState: S) => StorySliceState) =>
  (rootState: S) =>
    getStorySliceState(rootState).choices;
export const getMiscFromStorySliceState =
  <S>(getStorySliceState: (rootState: S) => StorySliceState) =>
  (rootState: S) =>
    getStorySliceState(rootState).misc;

export const getStorySelectors = <S>(
  getStorySliceState: (rootState: S) => StorySliceState
) => ({
  selectStorySlice: getStorySliceState,
  lines: getLinesSelectors(getLinesFromStorySliceState(getStorySliceState)),
  variables: getVariablesSelectors(
    getVariablesFromStorySliceState(getStorySliceState)
  ),
  choices: getChoicesSelectors(
    getChoicesFromStorySliceState(getStorySliceState)
  ),
  misc: getMiscSelectors(getMiscFromStorySliceState(getStorySliceState)),
});

class _GetStorySelectorsReturnTypeWrapper<S> {
  fn(getStorySliceState: (rootState: S) => StorySliceState) {
    return getStorySelectors(getStorySliceState);
  }
}

export type StorySelectors<S> = ReturnType<
  _GetStorySelectorsReturnTypeWrapper<S>["fn"]
>;

export * as storyActions from "./publicActions";
