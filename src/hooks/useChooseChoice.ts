import { EntityId } from "@reduxjs/toolkit";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { storyActions } from "../state";

interface SelectChoiceOptions {
  continueMaximally?: boolean;
}
export function useChooseChoiceId(
  choiceId: EntityId,
  { continueMaximally: outerMax }: SelectChoiceOptions = {}
) {
  const dispatch = useDispatch();
  return useCallback(
    ({ continueMaximally: innerMax = outerMax }: SelectChoiceOptions = {}) => {
      dispatch(
        storyActions.chooseChoiceById({
          choiceId: choiceId,
          ...(innerMax !== undefined && {
            maximally: innerMax,
          }),
        })
      );
    },
    [outerMax, choiceId]
  );
}

export function useChooseChoiceIndex(
  choiceIndex: number,
  { continueMaximally: outerMax }: SelectChoiceOptions = {}
) {
  const dispatch = useDispatch();
  return useCallback(
    ({ continueMaximally: innerMax = outerMax }: SelectChoiceOptions = {}) => {
      dispatch(
        storyActions.chooseChoiceByIndex({
          choiceIndex,
          ...(innerMax !== undefined && {
            maximally: innerMax,
          }),
        })
      );
    },
    [outerMax, choiceIndex]
  );
}
