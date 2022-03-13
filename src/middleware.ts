import { createListenerMiddleware } from "@reduxjs/toolkit";
import { InkjsRtkState } from "./types";

export function createInkjsRtkMiddleware<Slice extends string>() {
  return createListenerMiddleware<InkjsRtkState<Slice>>();
}
