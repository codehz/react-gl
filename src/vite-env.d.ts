/// <reference types="vite/client" />

import type { Builtins } from "./gl/builtins";
import type { RenderNode } from "./gl/reconciler";

type MapBuiltinProps<T> = {
  [K in keyof T]: T[K] extends new (props: infer Props) => any ? Props : never;
};

declare global {
  namespace JSX {
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements extends MapBuiltinProps<Builtins> {}
  }
}
