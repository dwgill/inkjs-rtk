import {
  createEntityAdapter,
  createSelector,
  createSlice,
  nanoid,
  PayloadAction,
} from "@reduxjs/toolkit";
import isEmptyTextLine from "../util/isEmptyTextLine";
import {
  evaluateLineGroupIndicator,
  LineGroupIndicator,
} from "../util/lineGroups";
import { simpleSetFromArr } from "../util/simpleSet";
import {
  DistributiveSomePartial,
  LineData,
  SomeOmitSomePartial,
} from "../util/types";
import { TextLineData, SimpleSet } from "../util/types";
import { clearStory, setStory } from "./independentActions";

type NewLinePayload = SomeOmitSomePartial<
  TextLineData,
  "index" | "groupTags" | "ungroupTags",
  "tags" | "meta"
>;

const linesCollectionAdapter = createEntityAdapter<LineData>({
  selectId: (line) => line.id,
  sortComparer: (a, b) => a.index - b.index,
});

export interface LinesSliceState {
  readonly collection: ReturnType<
    typeof linesCollectionAdapter["getInitialState"]
  >;
  readonly groupDefinitions: LineGroupIndicator[];
  readonly groupTags: SimpleSet;
  readonly ungroupTags: SimpleSet;
}

const initialState: LinesSliceState = {
  collection: linesCollectionAdapter.getInitialState(),
  groupDefinitions: [],
  groupTags: {},
  ungroupTags: {},
};

const lineSelectors = linesCollectionAdapter.getSelectors(
  (state: LinesSliceState) => state.collection
);

function getLineIdByIndex(state: LinesSliceState, index: number) {
  if (index == null) return null;
  const lineIds = lineSelectors.selectIds(state);
  return lineIds.at(index) ?? null;
}
function getLineByIndex(state: LinesSliceState, index: number) {
  const lineId = getLineIdByIndex(state, index);
  if (lineId == null) return null;
  return lineSelectors.selectById(state, lineId) ?? null;
}

const linesSlice = createSlice({
  name: "@inkjs-rtk/lines",
  initialState: initialState,
  reducers: {
    addLine: {
      reducer(state, { payload: newLines }: PayloadAction<NewLinePayload[]>) {
        if (!newLines?.length) return;

        for (const partialNewLine of newLines) {
          const tagsList = Object.keys(partialNewLine.tags ?? {});
          const newLine: LineData = {
            id: partialNewLine.id,
            lineKind: partialNewLine.lineKind,
            text: partialNewLine.text?.trim() ?? "",
            index: lineSelectors.selectTotal(state),
            ...(partialNewLine.meta &&
              Object.keys(partialNewLine.meta).length && {
                meta: partialNewLine.meta,
              }),
            ...(tagsList.length && {
              tags: partialNewLine.tags,
              groupTags: tagsList.filter((tag) => tag in state.groupTags),
              ungroupTags: tagsList.filter((tag) => tag in state.groupTags),
            }),
          };
          if (!isEmptyTextLine(newLine)) {
            linesCollectionAdapter.addOne(state.collection, newLine);
          }
        }

        const totalLinesNum = lineSelectors.selectTotal(state);
        if (state.groupDefinitions.length > totalLinesNum) {
          state.groupDefinitions = lineSelectors
            .selectAll(state)
            .map(evaluateLineGroupIndicator);
        }

        if (state.groupDefinitions.length < totalLinesNum) {
          for (let i = state.groupDefinitions.length; i < totalLinesNum; i++) {
            state.groupDefinitions.push(
              evaluateLineGroupIndicator(getLineByIndex(state, i))
            );
          }
        }
      },
      prepare(newLine: DistributiveSomePartial<NewLinePayload, "id">) {
        if (newLine == null) {
          return {
            payload: null as any,
          };
        }

        return {
          payload: [
            {
              ...newLine,
              id: newLine.id ?? nanoid(),
              text: newLine.text?.trim() ?? "",
            },
          ],
        };
      },
    },
    setLineMetadata(
      state,
      { payload }: PayloadAction<{ id: string; meta: Record<string, any> }>
    ) {
      const line = lineSelectors.selectById(state, payload.id);
      if (line == null) {
        return;
      }
      const metaEntries = Object.entries(payload.meta);
      if (metaEntries.length === 0) {
        return;
      }
      const newMeta = { ...line.meta };
      for (const [key, value] of metaEntries) {
        if (value == null) {
          delete newMeta[key];
        } else {
          newMeta[key] = value;
        }
      }
      linesCollectionAdapter.updateOne(state.collection, {
        id: payload.id,
        changes: {
          meta: Object.keys(newMeta).length ? newMeta : undefined,
        },
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setStory, (state, action) => {
      const {
        payload: { config },
      } = action;
      state.groupTags = {};
      state.ungroupTags = {};
      if (config.lineGrouping?.groupTags?.length) {
        state.groupTags = simpleSetFromArr(config.lineGrouping.groupTags);
      }
      if (config.lineGrouping?.grouplessTags?.length) {
        state.ungroupTags = simpleSetFromArr(config.lineGrouping.grouplessTags);
      }
    });
    builder.addCase(clearStory, () => initialState);
  },
});

export const linesReducer = linesSlice.reducer;
export const linesActions = linesSlice.actions;
export const getLinesSelectors = <S>(
  getSliceState: (rootState: S) => LinesSliceState
) => ({
  ...linesCollectionAdapter.getSelectors(
    (state: S) => getSliceState(state).collection
  ),
  selectLineByIndex(state: S, index: number) {
    return getLineByIndex(getSliceState(state), index);
  },
  selectLineIdByIndex(state: S, index: number) {
    return getLineIdByIndex(getSliceState(state), index);
  },
  selectLineGroupDefinitions(state: S) {
    return getSliceState(state).groupDefinitions;
  },
  selectIsLineGroupingEnabled: createSelector(
    (state: S) => getSliceState(state).groupTags,
    (state: S) => getSliceState(state).ungroupTags,
    (groupTags, ungroupTags) =>
      Boolean(Object.keys(groupTags).length + Object.keys(ungroupTags).length)
  ),
});
