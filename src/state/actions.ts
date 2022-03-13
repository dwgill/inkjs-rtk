import { linesActions } from "./lines";
import { continueStory, chooseChoice, setStory } from "./independentActions";

// The library-consumer facing actions.

export const choices = {
  chooseChoice,
};

export const misc = {
  continueStory,
  setStory,
};

export const lines = {
  setLineMetadata: linesActions.setLineMetadata,
};
