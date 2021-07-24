import { Component } from "react";
import Reconciler, { RenderNode, RenderRoot } from "./reconciler";

export default class MockRoot implements RenderRoot {
  children: RenderNode[] = [];
  #root: any;

  get context(): WebGLRenderingContext {
    throw new Error("mock");
  }

  constructor() {
    this.#root = Reconciler.createContainer(this, 0, false, null);
    console.log(this.#root);
  }

  render(component: Component<any, any>, callback: () => void) {
    return Reconciler.updateContainer(component, this.#root, null, callback);
  }
}
