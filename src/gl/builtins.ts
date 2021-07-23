import type { RenderNode } from "./reconciler";

abstract class BuiltinNode<Tag extends string, Props extends object>
  implements RenderNode
{
  tag: Tag;
  props: Props;
  abstract readonly children: RenderNode[];

  constructor(tag: Tag, props: Props) {
    this.tag = tag;
    this.props = props;
  }
}

class reset extends BuiltinNode<"reset", {}> {
  get children(): RenderNode[] {
    throw new Error("reset cannot have children");
  }

  constructor(props: {}) {
    super("reset", props);
  }
}

const exported = { reset } as const;
export type Builtins = typeof exported;
export default exported;
