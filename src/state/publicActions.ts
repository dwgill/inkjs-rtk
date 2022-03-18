import { linesActions } from "./lines";

// The library-consumer facing actions.

export {
  bindExternalFunction,
  chooseChoiceById,
  chooseChoiceByIndex,
  continueStory,
  setStory,
  setVariable,
} from "./independentActions";

export const setLineMetadata = linesActions.setLineMetadata;
