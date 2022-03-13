export type InkjsRtkState<Slice extends string> = {
  [slice in Slice]: {
    foo: "bar";
  };
};
