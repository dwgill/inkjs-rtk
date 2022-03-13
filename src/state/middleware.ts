import {
  createListenerMiddleware,
  Dispatch,
  ListenerEffectAPI,
} from "@reduxjs/toolkit";
import { Story } from "inkjs";
import { getStorySelectors, storyActions, StorySliceState } from ".";
import { simpleSetFromArr } from "../util/simpleSet";
import { LineKind } from "../util/types";
import { choicesActions } from "./choices";
import { clearStory } from "./independentActions";
import { linesActions } from "./lines";
import { miscActions } from "./misc";
import { variablesActions } from "./variables";

type VariableObserver = Parameters<
  InstanceType<typeof Story>["ObserveVariable"]
>[1];

let mutableMiddlewareState = {
  initialized: false,
  story: null as null | InstanceType<typeof Story>,
  variableObserver: null as null | VariableObserver,
};

const inkjsRtkStoryListenerMiddlewareInstance = createListenerMiddleware({
  extra: mutableMiddlewareState,
});

export const storyMiddleware =
  inkjsRtkStoryListenerMiddlewareInstance.middleware;

export function initializeStoryMiddleware<RootState>(
  getStorySliceState: (rootState: RootState) => StorySliceState
) {
  const selectors = getStorySelectors(getStorySliceState);

  inkjsRtkStoryListenerMiddlewareInstance.startListening({
    actionCreator: storyActions.misc.continueStory,
    effect({ payload: { maximally } }, listenerApi) {
      const story = listenerApi.extra.story;
      if (story == null) {
        console.error("Attempted to continue non-existant story.");
        return;
      }

      let canContinue = story.canContinue;

      if (!story.canContinue) {
        console.error("Attempted to continue non-continuable story.");
        return;
      }

      while (canContinue) {
        story.Continue();
        canContinue = handleStoryStep(listenerApi);
        if (!maximally) {
          return;
        }
      }
    },
  });

  inkjsRtkStoryListenerMiddlewareInstance.startListening({
    actionCreator: storyActions.choices.chooseChoice,
    effect({ payload: { choiceId, maximally, choiceIndex } }, listenerApi) {
      const story = listenerApi.extra.story;
      if (story == null) {
        console.error("Attempted to select choice of non-existant story.");
        return;
      }

      if (choiceIndex) {
        story.ChooseChoiceIndex(choiceIndex);
      } else if (choiceId != null) {
        const choice = selectors.choices.selectById(
          listenerApi.getState() as RootState,
          choiceId
        );
        if (choice == null) {
          if (process.env.NODE_ENV === "development") {
            console.error(
              `Attempted to select non-existant choice of ID '${choiceId}'.`
            );
          }
          return;
        }
        story.ChooseChoiceIndex(choice.index);
      } else {
        return;
      }

      if (!story.canContinue) {
        handleStoryStep(listenerApi);
      } else {
        listenerApi.dispatch(storyActions.misc.continueStory({ maximally }));
      }
    },
  });

  inkjsRtkStoryListenerMiddlewareInstance.startListening({
    actionCreator: storyActions.misc.setStory,
    effect({ payload: { config, storyJson } }, listenerApi) {
      if (!config || config.version !== 1) {
        console.error("Attempted to set story with invalid configuration.");
        listenerApi.dispatch(clearStory());
        return;
      }
      if (storyJson == null) {
        console.error("Attempted to set story with non-existant json.");
        listenerApi.dispatch(clearStory());
        return;
      }
      let story;
      try {
        story = new Story(storyJson);
      } catch (err) {
        console.error("Attempt to set story with invalid json");
        listenerApi.dispatch(clearStory);
        return;
      }

      listenerApi.dispatch(clearStory());
      listenerApi.extra.story = story;
      const observedVarNames = [
        ...(config?.trackedVariables?.bool ?? []),
        ...(config?.trackedVariables?.int ?? []),
        ...(config?.trackedVariables?.float ?? []),
      ];
      if (observedVarNames.length) {
        listenerApi.extra.variableObserver = (varName, varValue) => {
          listenerApi.dispatch(
            variablesActions.updateRawVariableValueInRedux({
              varName,
              varValue,
            })
          );
        };
        for (const varName of observedVarNames) {
          const varValue = story.variablesState.$(varName, undefined);
          listenerApi.dispatch(
            variablesActions.updateRawVariableValueInRedux({
              varName,
              varValue,
            })
          );
          story.ObserveVariable(varName, listenerApi.extra.variableObserver);
        }
      }
    },
  });

  mutableMiddlewareState.initialized = true;
  return function initializeStoryMiddleware() {
    inkjsRtkStoryListenerMiddlewareInstance.clearListeners();
    if (
      mutableMiddlewareState.story &&
      mutableMiddlewareState.variableObserver
    ) {
      mutableMiddlewareState.story.RemoveVariableObserver(
        mutableMiddlewareState.variableObserver
      );
    }
    mutableMiddlewareState.initialized = false;
    mutableMiddlewareState.story = null;
    mutableMiddlewareState.variableObserver = null;
  };
}

function handleStoryStep(
  listenerApi: ListenerEffectAPI<
    unknown,
    Dispatch,
    typeof mutableMiddlewareState
  >
) {
  const story = listenerApi.extra.story;
  if (story == null) {
    console.error("Attempted to handle story step of non-existant story.");
    return false;
  }
  const canContinue = story.canContinue;
  const currentText = story.currentText;
  const currentTags = story.currentTags;
  const currentErrors = story.currentErrors;
  const currentChoices = story.currentChoices;

  if (currentText?.trim() || currentTags?.length) {
    listenerApi.dispatch(
      linesActions.addLine({
        lineKind: LineKind.Text,
        text: currentText ?? "",
        ...(!!currentTags?.length && {
          tags: simpleSetFromArr(currentTags.map((t) => t.trim())),
        }),
      })
    );
  }

  listenerApi.dispatch(miscActions.setStoryErrors(currentErrors ?? []));
  listenerApi.dispatch(miscActions.setCanContinue(canContinue));
  listenerApi.dispatch(choicesActions.setChoices(currentChoices));
  return canContinue;
}
