import { createAction, EntityId } from "@reduxjs/toolkit";
import { StoryConfig } from "../util/types";

export interface ContinueStoryArgs {
  maximally?: boolean;
}
export const continueStory = createAction(
  "@inkjs-rtk/no-slice/continueStory",
  ({ maximally = false }: ContinueStoryArgs = {}) => ({
    payload: {
      maximally,
    },
  })
);

export interface ChooseChoiceByIdPayload {
  choiceId: EntityId;
  maximally?: boolean;
}
export const chooseChoiceById = createAction<ChooseChoiceByIdPayload>(
  "@inkjs-rtk/no-slice/chooseChoiceById"
);

export interface ChooseChoiceByIndexPayload {
  choiceIndex: number;
  maximally?: boolean;
}
export const chooseChoiceByIndex = createAction<ChooseChoiceByIndexPayload>(
  "@inkjs-rtk/no-slice/chooseChoiceByIndex"
);

export const setStory = createAction(
  "@inkjs-rtk/no-slice/setStory",
  (storyJson: any, config: StoryConfig) => {
    return {
      payload: {
        storyJson,
        config,
      },
    };
  }
);

export const clearStory = createAction("@inkjs-rtk/no-slice/clearStory");

export interface BindExternalFunctionPayload {
  name: string;
  callback: (...args: any[]) => any;
  lookaheadSafe?: boolean;
}
export const bindExternalFunction = createAction<BindExternalFunctionPayload>(
  "@inkjs-rtk/no-slice/clearStory"
);

export const setVariable = createAction<{
  name: string;
  value: string | number | boolean;
}>("@inkjs-rtk/no-slice/setVariable");
