/// <reference types="vite/client" />

import type { Builtins } from "./gl/builtins";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K> = K extends keyof T
  ? Omit<T, K> & Partial<Pick<T, K>>
  : never;

type MapBuiltinProps<T> = {
  [K in keyof T]: T[K] extends new () => { props: infer Props }
    ? T[K] extends { defaultProps: infer DefaultProps }
      ? PartialBy<Props, keyof DefaultProps>
      : Props
    : never;
};

type GetPropsNonObject<T extends keyof Builtins> = {
  [K in keyof MapBuiltinProps<Builtins>[T]]: MapBuiltinProps<Builtins>[T][K] extends infer V
    ? V extends Array<any>
      ? V
      : V extends Object
      ? never
      : V
    : never;
};

declare global {
  type TypedArray =
    | Int8Array
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Uint8ClampedArray
    | Float32Array
    | Float64Array;

  namespace JSX {
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements {
      reset: GetPropsNonObject<"reset">;
      group: GetPropsNonObject<"group">;
      shader: {
        vert: string;
        frag: string;
      };
    }
  }
}
