import type { RenderNode, RenderRoot } from "./reconciler";
import { Color } from "./types";

abstract class BuiltinNode<Tag extends string> implements RenderNode {
  readonly tag: Tag;
  abstract readonly props: any;
  hidden = false;
  #root?: RenderRoot;

  constructor(tag: Tag) {
    this.tag = tag;
  }
  get children(): RenderNode[] {
    throw new Error(this.tag + " cannot have children");
  }
  notifyChildren(): void {}
  notifyProps(): void {}
  mount(root: RenderRoot): void {
    this.#root = root;
  }
  unmount(): void {}
  commit(): void {}
  get root() {
    return this.#root;
  }
}

class reset extends BuiltinNode<"reset"> {
  static defaultProps = { color: [0, 0, 0, 0] as Color };
  readonly props: { color: Color } = reset.defaultProps;
  constructor() {
    super("reset");
  }
}

class group extends BuiltinNode<"group"> {
  get props() {
    return {};
  }
  #children: RenderNode[] = [];
  get children() {
    return this.#children;
  }
  constructor() {
    super("group");
  }
}

const exported = { reset, group } as const;
export type Builtins = typeof exported;
export default exported;
