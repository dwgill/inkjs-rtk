import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SimpleSet } from "../util/types";
import { clearStory } from "./independentActions";

export interface VariablesSliceState {
  readonly config: {
    readonly trackedBools: SimpleSet;
    readonly trackedInts: SimpleSet;
    readonly trackedFloats: SimpleSet;
  };
  readonly values: {
    readonly [varName: string]: boolean | number;
  };
}

const initState: VariablesSliceState = {
  config: {
    trackedBools: {},
    trackedInts: {},
    trackedFloats: {},
  },
  values: {},
};

const variablesSlice = createSlice({
  name: "@inkjs-rtk/variables",
  initialState: initState,
  reducers: {
    updateRawVariableValueInRedux(
      state,
      action: PayloadAction<{
        varName: string;
        varValue: number | boolean;
      }>
    ) {
      const {
        payload: { varValue, varName },
      } = action;
      if (varName in state.config.trackedBools) {
        state.values[varName] = Boolean(varValue);
      }
      if (varName in state.config.trackedInts) {
        let num = Math.floor(Number(varValue));
        if (Number.isNaN(num)) {
          num = 0;
        }
        state.values[varName] = num;
      }
      if (varName in state.config.trackedFloats) {
        let num = Number(varValue);
        if (Number.isNaN(num)) {
          num = 0;
        }
        state.values[varName] = num;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearStory, () => initState);
  },
});

export const variablesReducer = variablesSlice.reducer;
export const variablesActions = variablesSlice.actions;
export const getVariablesSelectors = <S>(
  getSliceState: (rootState: S) => VariablesSliceState
) => ({
  selectValueOf(state: S, variableName: string): any {
    return getSliceState(state).values[variableName] ?? null;
  },
  selectIsVariableTracked(state: S, varName: string) {
    const sliceState = getSliceState(state);
    return varName in sliceState.values;
  },
});
