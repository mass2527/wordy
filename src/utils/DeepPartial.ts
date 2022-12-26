// rome-ignore lint/nursery/noBannedTypes: <explanation>
export type DeepPartial<T> = T extends Function
  ? T
  : T extends Array<infer K>
  ? Array<DeepPartial<K>>
  : T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T | undefined;
