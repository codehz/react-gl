/// <reference types="vite/client" />

import type { Builtins } from "./gl/builtins";
import type { RenderNode } from "./gl/reconciler";

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

type GetProps<T extends keyof Builtins> = {
  [K in keyof MapBuiltinProps<Builtins>[T]]: MapBuiltinProps<Builtins>[T][K];
};

type GeneralChildren = { children: JSX.Element[] | JSX.Element };

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
    type Element = RenderNode;
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements {
      reset: GetProps<"reset">;
      shader: GetProps<"shader"> & GeneralChildren;
      uniform: GetProps<"uniform">;
      vao: GetProps<"vao"> & GeneralChildren;
      attrib:
        | { index: number; fixed: true; value: Float32Array }
        | {
            index: number;
            size: 1 | 2 | 3 | 4;
            type:
              | "byte"
              | "short"
              | "unsigned byte"
              | "unsigned short"
              | "float";
            normalized?: boolean;
            stride?: number;
            offset?: number;
          };
      buffer: GetProps<"buffer">;
    }
  }
}
