import { gl } from "./canvas";
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
  render(): void {}
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

  render() {
    gl.clearColor(
      this.props.color[0],
      this.props.color[1],
      this.props.color[2],
      this.props.color[3]
    );
    gl.clear(gl.COLOR_BUFFER_BIT);
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
