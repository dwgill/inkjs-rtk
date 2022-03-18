import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { storyActions } from "../state";

interface ContinueStoryOptions {
  continueMaximally?: boolean;
}
export function useContinueStory({
  continueMaximally: outerMax,
}: ContinueStoryOptions = {}) {
  const dispatch = useDispatch();
  return useCallback(
    ({ continueMaximally: innerMax = outerMax }: ContinueStoryOptions = {}) => {
      dispatch(
        storyActions.continueStory({
          maximally: innerMax ?? true,
        })
      );
    },
    [outerMax, dispatch]
  );
}
