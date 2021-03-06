import { EntityId } from "@reduxjs/toolkit";
import React, { memo } from "react";
import { useSelector } from "react-redux";
import { useChooseChoiceId } from "../hooks/useChooseChoice";
import { getChoicesFromStorySliceState, StorySliceState } from "../state";
import { getChoicesSelectors } from "../state/choices";
import { ChoiceData } from "../util/types";

export type ChoiceComponent = React.ComponentType<ChoiceProps>;
interface ChoicesProps<RootState> {
  choiceComponent?: ChoiceComponent;
  continueMaximally?: boolean;
  getState: (rootState: RootState) => StorySliceState;
}
export default function Choices<RootState>({
  choiceComponent: ChoiceComponent = DefaultChoice,
  getState,
}: ChoicesProps<RootState>) {
  const choicesSelectors = getChoicesSelectors(
    getChoicesFromStorySliceState(getState)
  );
  const choiceIds = useSelector((rootState: RootState) =>
    choicesSelectors.selectIds(rootState)
  );
  return (
    <>
      {choiceIds.map((choiceId) => (
        <MemoizedChoiceWrapper
          key={choiceId}
          choiceId={choiceId}
          choiceComponent={ChoiceComponent}
          getState={getState}
        />
      ))}
    </>
  );
}

interface ChoiceWrapperProps<RootState> {
  choiceId: EntityId;
  choiceComponent: React.ComponentType<ChoiceProps>;
  getState: (rootState: RootState) => StorySliceState;
}
function ChoiceWrapper<RootState>({
  choiceId,
  choiceComponent: ChoiceComponent,
  getState,
}: ChoiceWrapperProps<RootState>) {
  const choicesSelectors = getChoicesSelectors(
    getChoicesFromStorySliceState(getState)
  );
  const choiceData = useSelector((rootState: RootState) =>
    choicesSelectors.selectById(rootState, choiceId)
  );
  if (choiceData == null) {
    return null;
  }
  return <ChoiceComponent choiceData={choiceData} />;
}
const MemoizedChoiceWrapper = memo(ChoiceWrapper) as typeof ChoiceWrapper;

interface ChoiceProps {
  choiceData: ChoiceData;
}
function DefaultChoice({ choiceData }: ChoiceProps) {
  const onChooseChoice = useChooseChoiceId(choiceData.id);
  return (
    <li>
      <button onClick={() => onChooseChoice()}>{choiceData.text}</button>
    </li>
  );
}
