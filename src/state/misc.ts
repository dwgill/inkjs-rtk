import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearStory, setStory } from "./independentActions";

export interface MiscSliceState {
  readonly storyErrors: string[];
  readonly canContinue: boolean;
  readonly continueMaximally: boolean;
  readonly storyIsSet: boolean;
}

const initState: MiscSliceState = {
  canContinue: false,
  storyErrors: [],
  storyIsSet: false,
  continueMaximally: false,
};

const miscSlice = createSlice({
  initialState: initState,
  name: "@inkjs-rtk/misc",
  reducers: {
    setStoryErrors(state, action: PayloadAction<string[]>) {
      if (state.storyErrors.length === 0 && action.payload.length === 0) {
        return;
      }
      state.storyErrors = [...action.payload];
    },
    setCanContinue(state, action: PayloadAction<boolean>) {
      state.canContinue = !!action.payload;
    },
    setStoryIsSet(state, action: PayloadAction<boolean>) {
      state.storyIsSet = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setStory, (state, { payload: { config } }) => {
      state.canContinue = initState.canContinue;
      state.storyErrors = initState.storyErrors;
      state.storyIsSet = false;
      state.continueMaximally = !!config.continueMaximally;
    });
    builder.addCase(clearStory, () => initState);
  },
});

export const miscActions = miscSlice.actions;
export const miscReducer = miscSlice.reducer;
export const getMiscSelectors = <S>(
  selectSliceState: (rootState: S) => MiscSliceState
) => ({
  selectCanContinue(state: S) {
    return selectSliceState(state).canContinue;
  },
  selectErrors(state: S) {
    return selectSliceState(state).storyErrors;
  },
  selectStoryIsSet(state: S) {
    return selectSliceState(state).storyIsSet;
  },
  selectContinueMaximally(state: S) {
    return selectSliceState(state).continueMaximally;
  },
});
