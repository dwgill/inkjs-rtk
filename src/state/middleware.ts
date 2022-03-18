import {
  createListenerMiddleware,
  Dispatch,
  EntityId,
  isAnyOf,
  ListenerEffectAPI,
  TypedStartListening,
} from "@reduxjs/toolkit";
import { Story } from "inkjs";
import { StoryException } from "inkjs/engine/StoryException";
import {
  getStorySelectors,
  storyActions,
  StorySelectors,
  StorySliceState,
} from ".";
import { simpleSetFromArr } from "../util/simpleSet";
import { ExternalFunctionCallback, LineKind } from "../util/types";
import { choicesActions } from "./choices";
import { clearStory } from "./independentActions";
import { linesActions } from "./lines";
import { miscActions } from "./misc";
import { variablesActions } from "./variables";

function isStoryException(err: unknown): err is StoryException {
  return Boolean(err && err instanceof Error && err.name === "StoryException");
}

type VariableObserver = Parameters<
  InstanceType<typeof Story>["ObserveVariable"]
>[1];

let mutableMiddlewareState = {
  initialized: false,
  story: null as null | InstanceType<typeof Story>,
  variableObserver: null as null | VariableObserver,
  boundExternalFunctionNames: [] as string[],
};

const inkjsRtkStoryListenerMiddlewareInstance = createListenerMiddleware({
  extra: mutableMiddlewareState,
});

export const storyMiddleware =
  inkjsRtkStoryListenerMiddlewareInstance.middleware;

type ListenerCleanupCallback = (
  middlewareState: typeof mutableMiddlewareState
) => void;
type StoryStartListening<RootState> = (
  storySelectors: StorySelectors<RootState>,
  startListening: TypedStartListening<
    RootState,
    Dispatch,
    typeof mutableMiddlewareState
  >
) => void | ListenerCleanupCallback;

export function initializeStoryMiddleware<RootState>(
  getStorySliceState: (rootState: RootState) => StorySliceState
) {
  const selectors = getStorySelectors(getStorySliceState);
  const startListening =
    inkjsRtkStoryListenerMiddlewareInstance.startListening as TypedStartListening<
      RootState,
      Dispatch,
      typeof mutableMiddlewareState
    >;

  if (process.env.NODE_ENV === "development") {
    (window as any).storyExtra = mutableMiddlewareState;
  }

  const listenerCleanupCallbacks: ListenerCleanupCallback[] = [];
  for (const listener of [
    startListeningForContinueStory<RootState>(),
    startListeningForChoices<RootState>(),
    startListeningForSetStory<RootState>(),
    startListeningForBindExternalFunc<RootState>(),
    startListeningForSetVariable<RootState>(),
  ]) {
    const cleanupCallback = listener(selectors, startListening);
    if (cleanupCallback) {
      listenerCleanupCallbacks.push(cleanupCallback);
    }
  }

  mutableMiddlewareState.initialized = true;
  return function unintializeStoryMiddleware() {
    inkjsRtkStoryListenerMiddlewareInstance.clearListeners();

    for (const cleanupCallback of listenerCleanupCallbacks) {
      cleanupCallback(mutableMiddlewareState);
    }

    mutableMiddlewareState.initialized = false;
  };
}

const startListeningForContinueStory =
  <RootState>(): StoryStartListening<RootState> =>
  (storySelectors, startListening) => {
    startListening({
      actionCreator: storyActions.continueStory,
      effect({ payload: { maximally } }, listenerApi) {
        if (maximally == null) {
          maximally = storySelectors.misc.selectContinueMaximally(
            listenerApi.getState()
          );
        }
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
          canContinue = readStoryStateToRedux(listenerApi);
          if (!maximally) {
            return;
          }
        }
      },
    });
  };

const startListeningForChoices =
  <RootState>(): StoryStartListening<RootState> =>
  (storySelectors, startListening) => {
    startListening({
      matcher: isAnyOf(
        storyActions.chooseChoiceById,
        storyActions.chooseChoiceByIndex
      ),
      effect(action, listenerApi) {
        const story = listenerApi.extra.story;
        if (story == null) {
          console.error("Attempted to select choice of non-existant story.");
          return;
        }

        let maximally: boolean | null = null;
        let choiceIndex: number | null = null;
        let choiceId: EntityId | null = null;
        if (storyActions.chooseChoiceById.match(action)) {
          maximally = action.payload.maximally ?? null;
          choiceId = action.payload.choiceId;
        } else if (storyActions.chooseChoiceByIndex.match(action)) {
          maximally = action.payload.maximally ?? null;
          choiceIndex = action.payload.choiceIndex;
        } else {
          console.error("Attempted to select choice with unrecognized action.");
          return;
        }

        if (choiceIndex != null) {
          story.ChooseChoiceIndex(choiceIndex);
        } else if (choiceId != null) {
          const choice = storySelectors.choices.selectById(
            listenerApi.getState(),
            choiceId
          );
          if (choice == null) {
            if (process.env.NODE_ENV === "development") {
              console.error(
                `Attempted to select non-existant choice with ID '${choiceId}'.`
              );
            }
            return;
          }
          story.ChooseChoiceIndex(choice.index);
        } else {
          console.error("Attempted to select choice with invalid action.");
          return;
        }

        if (!story.canContinue) {
          readStoryStateToRedux(listenerApi);
        } else {
          if (maximally == null) {
            maximally = storySelectors.misc.selectContinueMaximally(
              listenerApi.getState()
            );
          }
          listenerApi.dispatch(storyActions.continueStory({ maximally }));
        }
      },
    });
  };

const startListeningForSetStory =
  <RootState>(): StoryStartListening<RootState> =>
  (storySelectors, startListening) => {
    startListening({
      actionCreator: storyActions.setStory,
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
        let story: InstanceType<typeof Story>;
        try {
          story = new Story(storyJson);
        } catch (err) {
          console.error("Attempt to set story with invalid json", err);
          listenerApi.dispatch(clearStory);
          return;
        }

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

        if (config?.externalFunctions?.lookaheadSafe) {
          for (const [name, callback] of Object.entries(
            config.externalFunctions.lookaheadSafe
          )) {
            bindFunctionToStory(
              {
                callback,
                name,
                lookaheadSafe: true,
              },
              listenerApi
            );
          }
        }
        if (config?.externalFunctions?.lookaheadUnsafe) {
          for (const [name, callback] of Object.entries(
            config.externalFunctions.lookaheadUnsafe
          )) {
            bindFunctionToStory(
              {
                callback,
                name,
                lookaheadSafe: false,
              },
              listenerApi
            );
          }
        }

        readStoryStateToRedux(listenerApi);
        if (
          storySelectors.misc.selectCanContinue(listenerApi.getState()) &&
          storySelectors.misc.selectContinueMaximally(listenerApi.getState())
        ) {
          listenerApi.dispatch(storyActions.continueStory());
        }
      },
    });

    return function storyCleanup(middlewareState) {
      if (middlewareState.story && middlewareState.variableObserver) {
        middlewareState.story.RemoveVariableObserver(
          middlewareState.variableObserver
        );
      }

      if (mutableMiddlewareState.story) {
        for (const fname of mutableMiddlewareState.boundExternalFunctionNames) {
          mutableMiddlewareState.story.UnbindExternalFunction(fname);
        }
      }

      middlewareState.story = null;
      middlewareState.variableObserver = null;
      mutableMiddlewareState.boundExternalFunctionNames = [];
    };
  };

const startListeningForBindExternalFunc =
  <RootState>(): StoryStartListening<RootState> =>
  (_, startListening) => {
    startListening({
      actionCreator: storyActions.bindExternalFunction,
      effect(action, listenerApi) {
        bindFunctionToStory(action.payload, listenerApi);
      },
    });

    return function externalFuncCleanup() {
      if (mutableMiddlewareState.story) {
        for (const fname of mutableMiddlewareState.boundExternalFunctionNames) {
          mutableMiddlewareState.story.UnbindExternalFunction(fname);
        }
      }
      mutableMiddlewareState.boundExternalFunctionNames = [];
    };
  };

const startListeningForSetVariable =
  <RootState>(): StoryStartListening<RootState> =>
  (_, startListening) => {
    startListening({
      actionCreator: storyActions.setVariable,
      effect({ payload: { name, value: newValue } }, listenerApi) {
        const story = listenerApi.extra.story;
        if (story == null) {
          console.error(
            `Attempted to set variable '${name}' of non-existant story.`
          );
          return;
        }
        if (newValue == null) {
          console.error(`Attempted to set variable '${name}' to null.`);
          return;
        }
        if (!["number", "string", "boolean"].includes(typeof newValue)) {
          console.error(
            `Attempted to set variable '${name}' to complex value.`
          );
          return;
        }
        const oldValue = story.variablesState.$(name, undefined);
        if (!["number", "string", "boolean"].includes(typeof oldValue)) {
          console.error(
            `Attempted to set complex variable '${name}' to number, string, or boolean.`
          );
          return;
        }
        try {
          story.variablesState.$(name, newValue);
        } catch (err) {
          if (!isStoryException(err)) {
            throw err;
          }
          if (
            err.message.match(
              /Cannot assign to a variable.*that hasn't been declared in the story/
            )
          ) {
            console.error(
              `Attempted to set variable '${name}' that has not been declared in the story.`
            );
            return;
          }
          if (err.message.match(/Invalid value passed to VariableState:.*/)) {
            console.error(
              `Attempted to set variable '${name}' to invalid value: ${newValue}`
            );
            return;
          }
          throw err;
        }
      },
    });
  };

function readStoryStateToRedux<RootState>(
  listenerApi: ListenerEffectAPI<
    RootState,
    Dispatch,
    typeof mutableMiddlewareState
  >
) {
  const story = listenerApi.extra.story;
  if (story == null) {
    console.error("Attempted to read state of non-existant story.");
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

function bindFunctionToStory<RootState>(
  functionDefinition: {
    name: string;
    callback: ExternalFunctionCallback;
    lookaheadSafe?: boolean;
  },
  listenerApi: ListenerEffectAPI<
    RootState,
    Dispatch,
    typeof mutableMiddlewareState
  >
) {
  const story = listenerApi.extra.story;
  if (story == null) {
    console.error(
      `Attempted to bind function '${functionDefinition.name}' to non-existant story.`
    );
    return;
  }

  story.BindExternalFunction(
    functionDefinition.name,
    (...args: any[]) => {
      return functionDefinition.callback.apply(null, [
        {
          dispatch: listenerApi.dispatch,
          getState: listenerApi.getState,
          story: story,
        },
        ...args,
      ]);
    },
    functionDefinition.lookaheadSafe ?? false
  );

  listenerApi.extra.boundExternalFunctionNames.push(functionDefinition.name);
}
