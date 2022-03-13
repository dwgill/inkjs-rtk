import { linesActions } from "./lines";
import { continueStory, selectChoice, setStory } from "./independentActions";

// The library-consumer facing actions.

export const choices = {
  selectChoice,
};

export const misc = {
  continueStory,
  setStory,
};

export const lines = {
  setLineMetadata: linesActions.setLineMetadata,
};
