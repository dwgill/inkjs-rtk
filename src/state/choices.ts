import {
  createEntityAdapter,
  createSlice,
  nanoid,
  PayloadAction,
} from "@reduxjs/toolkit";
import { ChoiceData } from "../util/types";
import { clearStory } from "./independentActions";

type NewChoiceValue = Omit<ChoiceData, "id"> & Partial<Pick<ChoiceData, "id">>;

const choicesCollectionAdapter = createEntityAdapter<ChoiceData>({
  selectId: (choice) => choice.id,
  sortComparer: (a, b) => a.index - b.index,
});

choicesCollectionAdapter.getSelectors;

export interface ChoicesSliceState {
  readonly collection: ReturnType<
    typeof choicesCollectionAdapter["getInitialState"]
  >;
}

const initState: ChoicesSliceState = {
  collection: choicesCollectionAdapter.getInitialState(),
};

const choicesSlice = createSlice({
  name: "@inkjs-rtk/choices",
  initialState: initState,
  reducers: {
    clearChoices(state) {
      choicesCollectionAdapter.removeAll(state.collection);
    },
    setChoices: {
      reducer(state, action: PayloadAction<{ choices: ChoiceData[] }>) {
        choicesCollectionAdapter.removeAll(state.collection);
        choicesCollectionAdapter.addMany(
          state.collection,
          action.payload.choices
        );
      },
      prepare(choices: NewChoiceValue[] | null = null) {
        return {
          payload: {
            choices:
              choices?.map((choiceData) => ({
                ...choiceData,
                id: choiceData.id ?? nanoid(),
              })) ?? [],
          },
        };
      },
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearStory, () => initState);
  },
});

export const choicesReducer = choicesSlice.reducer;
export const choicesActions = choicesSlice.actions;
export const getChoicesSelectors = <S>(
  getSliceState: (rootState: S) => ChoicesSliceState
) =>
  choicesCollectionAdapter.getSelectors(
    (state: S) => getSliceState(state).collection
  );
