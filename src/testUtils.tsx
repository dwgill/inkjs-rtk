import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import {
  render as renderCore,
  queries,
  Queries,
  RenderOptions,
  RenderResult,
} from "@testing-library/react";
import { ReactNode } from "react";
import { storySliceReducer, StorySliceState } from "./state";
import { storyMiddleware } from "./state/middleware";
import { Provider } from "react-redux";

export interface TestRootState {
  story: StorySliceState;
}

export const createStore = (preloadedState?: TestRootState) =>
  configureStore({
    preloadedState,
    reducer: {
      story: storySliceReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(storyMiddleware),
  });

interface ReduxTestOptions {
  preloadedState?: TestRootState;
  store?: ReturnType<typeof createStore>;
}

function render<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container
>(
  ui: React.ReactElement,
  {
    preloadedState,
    store = createStore(preloadedState),
    ...options
  }: RenderOptions<Q, Container, BaseElement> & ReduxTestOptions = {}
): RenderResult<Q, Container, BaseElement> {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return renderCore(ui, {
    wrapper: Wrapper,
    ...options,
  });
}

export * from "@testing-library/react";
export { render };
