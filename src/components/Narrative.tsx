import { EntityId } from "@reduxjs/toolkit";
import React, { memo, ReactNode, useMemo } from "react";
import { useSelector } from "react-redux";
import { getLinesFromStorySliceState, StorySliceState } from "../state";
import { getLinesSelectors } from "../state/lines";
import arraysAreShallowEqual from "../util/arraysAreShallowEqual";
import { groupLines } from "../util/lineGroups";
import { LineData } from "../util/types";

interface LineGroupProps {
  children: ReactNode;
  firstLine: LineData | null;
  groupIndex: number;
}
export type LineGroupComponent = React.ComponentType<LineGroupProps>;
interface LineProps {
  lineData: LineData;
  groupHeading: LineData | null;
}
export type LineComponent = React.ComponentType<LineProps>;

interface NarrativeProps<RootState> {
  lineComponent?: LineComponent;
  lineGroupComponent?: LineGroupComponent;
  getState: (rootState: RootState) => StorySliceState;
}

function RawNarrative<RootState>({
  lineComponent: LineComponent = DefaultLine,
  lineGroupComponent: LineGroupComponent = DefaultLineGroup,
  getState,
}: NarrativeProps<RootState>) {
  const linesSelectors = getLinesSelectors(
    getLinesFromStorySliceState(getState)
  );
  const lineIds = useSelector(linesSelectors.selectIds);
  const lineGroupDefinitions = useSelector(
    linesSelectors.selectLineGroupDefinitions
  );

  const groupingEnabled = useSelector(
    linesSelectors.selectIsLineGroupingEnabled
  );

  const groupedLineIds = useMemo(
    () => (!groupingEnabled ? null : groupLines(lineIds, lineGroupDefinitions)),
    [lineIds, lineGroupDefinitions, groupingEnabled]
  );

  return (
    <>
      {!!groupedLineIds &&
        groupedLineIds.map((lineOrGroup, index) => {
          if (!Array.isArray(lineOrGroup)) {
            return (
              <MemoizedLineWrapper
                lineId={lineOrGroup}
                groupHeadingId={null}
                lineComponent={LineComponent}
                key={lineOrGroup}
                getState={getState}
              />
            );
          }
          return (
            <MemoizedLineGroupWrapper
              groupIndex={index}
              key={`group-${lineOrGroup[0]}`}
              lineIds={lineOrGroup}
              lineComponent={LineComponent}
              lineGroupComponent={LineGroupComponent}
              getState={getState}
            />
          );
        })}
      {!groupedLineIds &&
        lineIds.map((lineId) => (
          <MemoizedLineWrapper
            lineId={lineId}
            groupHeadingId={null}
            lineComponent={LineComponent}
            key={lineId}
            getState={getState}
          />
        ))}
    </>
  );
}
const Narrative = memo(RawNarrative) as typeof RawNarrative;
export default Narrative;

interface LineGroupWrapperProps<RootState> {
  getState: (rootState: RootState) => StorySliceState;
  groupIndex: number;
  lineComponent?: LineComponent;
  lineGroupComponent?: LineGroupComponent;
  lineIds: EntityId[];
}

const LineGroupWrapper = function LineGroupWrapper<RootState>({
  lineIds,
  groupIndex,
  lineComponent: LineComponent,
  lineGroupComponent: LineGroupComponent = DefaultLineGroup,
  getState,
}: LineGroupWrapperProps<RootState>) {
  const linesSelectors = getLinesSelectors(
    getLinesFromStorySliceState(getState)
  );
  const firstLine = useSelector((state: RootState) =>
    linesSelectors.selectById(state, lineIds[0])
  );
  if (!lineIds.length) {
    return null;
  }

  return (
    <LineGroupComponent firstLine={firstLine ?? null} groupIndex={groupIndex}>
      {lineIds.map((lineId) => (
        <LineWrapper
          key={lineId}
          lineId={lineId}
          groupHeadingId={firstLine?.id}
          lineComponent={LineComponent}
          getState={getState}
        />
      ))}
    </LineGroupComponent>
  );
};
const MemoizedLineGroupWrapper = memo(
  LineGroupWrapper,
  (prevProps, nextProps) => {
    return (
      prevProps.getState === nextProps.getState &&
      prevProps.groupIndex === nextProps.groupIndex &&
      prevProps.lineComponent === nextProps.lineComponent &&
      prevProps.lineGroupComponent === nextProps.lineGroupComponent &&
      arraysAreShallowEqual(prevProps.lineIds, nextProps.lineIds)
    );
  }
) as typeof LineGroupWrapper;

const DefaultLineGroup: LineGroupComponent = ({ children }: LineGroupProps) => (
  <>{children}</>
);

interface LineWrapperProps<RootState> {
  lineId: EntityId;
  groupHeadingId?: EntityId | null;
  lineComponent?: React.ComponentType<LineProps>;
  getState: (rootState: RootState) => StorySliceState;
}

const LineWrapper = function LineWrapper<RootState>({
  lineId,
  groupHeadingId,
  lineComponent: LineComponent = DefaultLine,
  getState,
}: LineWrapperProps<RootState>) {
  const linesSelectors = getLinesSelectors(
    getLinesFromStorySliceState(getState)
  );
  const line = useSelector((state: RootState) =>
    linesSelectors.selectById(state, lineId)
  );
  const groupHeading = useSelector((state: RootState) =>
    !groupHeadingId
      ? null
      : linesSelectors.selectById(state, groupHeadingId) ?? null
  );

  if (line == null) {
    return null;
  }

  return <LineComponent lineData={line} groupHeading={groupHeading} />;
};
const MemoizedLineWrapper = memo(LineWrapper) as typeof LineWrapper;

const DefaultLine: LineComponent = ({ lineData }: LineProps) => (
  <p>{lineData.text}</p>
);
