import { createAction, EntityId } from "@reduxjs/toolkit";
import { StoryConfig } from "../util/types";

export interface ContinueStoryArgs {
  maximally?: boolean;
}
export const continueStory = createAction(
  "@inkjs-rtk/extra/continueStory",
  ({ maximally = false }: ContinueStoryArgs = {}) => ({
    payload: {
      maximally,
    },
  })
);

export interface ChooseChoiceIdArgs {
  choiceId: EntityId;
  maximally?: boolean;
}
export interface ChooseChoiceIndexArgs {
  choiceIndex: number;
  maximally?: boolean;
}
export const chooseChoice = createAction(
  "@inkjs-rtk/extra/chooseChoice",
  (args: ChooseChoiceIdArgs | ChooseChoiceIndexArgs) => {
    if ("choiceId" in args) {
      return {
        payload: {
          choiceId: args.choiceId,
          maximally: args.maximally,
        },
      };
    }

    return {
      payload: {
        choiceIndex: args.choiceIndex,
        maximally: args.maximally,
      },
    };
  }
);

export const setStory = createAction(
  "@inkjs-rtk/extra/setStory",
  (storyJson: any, config: StoryConfig) => {
    return {
      payload: {
        storyJson,
        config,
      },
    };
  }
);

export const clearStory = createAction("@inkjs-rtk/extra/clearStory");
