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

export interface SelectChoiceIdArgs {
  choiceId: EntityId;
  maximally?: boolean;
}
export interface SelectChoiceIndexArgs {
  choiceIndex: number;
  maximally?: boolean;
}
export const selectChoice = createAction(
  "@inkjs-rtk/extra/selectChoice",
  (args: SelectChoiceIdArgs | SelectChoiceIndexArgs) => {
    if ("choiceId" in args) {
      return {
        payload: {
          choiceId: args.choiceId,
          maximally: args.maximally ?? false,
        },
      };
    }

    return {
      payload: {
        choiceIndex: args.choiceIndex,
        maximally: args.maximally ?? false,
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
