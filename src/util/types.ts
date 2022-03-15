export enum LineKind {
  Text = "text",
}

interface AbstractLineData {
  readonly id: string;
  readonly lineKind: unknown;
  readonly index: number;
  readonly meta?: Record<string, any>;
  readonly tags?: Record<string, true>;
  readonly groupTags?: string[];
  readonly ungroupTags?: string[];
}

export interface TextLineData extends AbstractLineData {
  readonly lineKind: LineKind.Text;
  readonly text: string;
}

export type LineData = TextLineData;

export type SimpleSet = Record<number | string, true>;

export interface ChoiceData {
  readonly id: string;
  readonly index: number;
  readonly text: string;
  readonly isInvisibleDefault: boolean;
  readonly originalThreadIndex: number;
}

export type Predicate<T> = (value: T) => boolean;
export type ArrayPredicate<T> = (
  value: T,
  index: number,
  array: T[]
) => boolean;

export type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

export type DistributivePick<T, K extends keyof T> = T extends unknown
  ? Pick<T, K>
  : never;

export type PickPartial<T, K extends keyof T> = Partial<Pick<T, K>>;

export type DistributivePickPartial<T, K extends keyof T> = T extends unknown
  ? PickPartial<T, K>
  : never;

export type SomePartial<T, K extends keyof T> = Omit<T, K> & PickPartial<T, K>;

export type DistributiveSomePartial<T, K extends keyof T> = T extends unknown
  ? SomePartial<T, K>
  : never;

export type SomeOmitSomePartial<
  T,
  Rem extends keyof T,
  Part extends keyof T
> = Omit<T, Rem | Part> & PickPartial<T, Part>;

export type DistributiveSomeOmitSomePartial<
  T,
  Rem extends keyof T,
  Part extends keyof T
> = T extends unknown ? SomeOmitSomePartial<T, Rem, Part> : never;

export interface StoryConfigV1 {
  version: 1;
  trackedVariables?: {
    bool?: string[];
    int?: string[];
    float?: string[];
  };
  lineGrouping?: {
    groupTags: string[];
    grouplessTags: string[];
  };
  continueMaximally?: boolean;
}

export type StoryConfig = StoryConfigV1;

export const defaultStoryConfig: StoryConfig = {
  version: 1,
};
