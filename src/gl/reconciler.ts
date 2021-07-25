import ReactReconciler, { HostConfig } from "react-reconciler";
import builtins from "./builtins";
import { diff, apply } from "./diff";

export type RenderRoot = {
  readonly children: RenderNode[];
};

type RenderTag = string;

export interface RenderNode {
  readonly tag: RenderTag;
  readonly props: object;
  readonly children: RenderNode[];
  readonly root?: RenderRoot;
  hidden?: boolean;
  notifyChildren(): void;
  notifyProps(): void;
  mount(root: RenderRoot): void;
  unmount(): void;
  commit(): void;
  render(): void;
}

const MyHostConfig: HostConfig<
  RenderTag,
  object,
  RenderRoot,
  RenderNode,
  never,
  RenderNode,
  never,
  RenderNode,
  null,
  ReturnType<typeof diff>,
  never,
  number,
  number
> = {
  supportsMutation: true,
  supportsHydration: false,
  supportsPersistence: false,

  createInstance(
    type: RenderTag,
    props: object,
    _rootContainer: RenderRoot,
    _hostContext: null,
    _internalHandle: null
  ): RenderNode {
    if (type in builtins) {
      const ret = new (builtins as any)[type]();
      apply(diff(ret.props, props), ret.props);
      return ret;
    }
    throw new Error(`Unsupported tag: ${type}`);
  },

  createTextInstance(
    _text: string,
    _rootContainer: RenderRoot,
    _hostContext: null,
    _internalHandle: null
  ): never {
    throw new Error(`Text node is not supported`);
  },

  appendInitialChild(parentInstance: RenderNode, child: RenderNode): void {
    parentInstance.children.push(child);
  },

  finalizeInitialChildren(
    instance: RenderNode,
    _type: RenderTag,
    _props: object,
    rootContainer: RenderRoot,
    _hostContext: null
  ): boolean {
    instance.mount(rootContainer);
    return false;
  },

  prepareUpdate(
    _instance: RenderNode,
    _type: RenderTag,
    oldProps: object,
    newProps: object,
    _rootContainer: RenderRoot,
    _hostContext: null
  ) {
    return diff(oldProps, newProps);
  },

  shouldSetTextContent(_type: RenderTag, _props: object): boolean {
    return false;
  },

  getRootHostContext(_rootContainer: RenderRoot): null {
    return null;
  },

  getChildHostContext(
    _parentHostContext: null,
    _type: RenderTag,
    _rootContainer: RenderRoot
  ): null {
    return null;
  },

  getPublicInstance(instance: RenderNode): RenderNode {
    return instance;
  },

  prepareForCommit(_containerInfo: RenderRoot): Record<string, any> | null {
    return null;
  },

  resetAfterCommit(_containerInfo: RenderRoot): void {},

  preparePortalMount(_containerInfo: RenderRoot): void {},

  now(): number {
    return performance.now();
  },

  scheduleTimeout(fn: (...args: unknown[]) => unknown, delay?: number): number {
    return setTimeout(fn, delay);
  },

  cancelTimeout(id: number): void {
    clearTimeout(id);
  },

  noTimeout: -1,

  queueMicrotask(fn: () => void): void {
    queueMicrotask(fn);
  },

  isPrimaryRenderer: true,

  appendChild(parentInstance: RenderNode, child: RenderNode): void {
    parentInstance.children.push(child);
    parentInstance.notifyChildren();
  },

  appendChildToContainer(container: RenderRoot, child: RenderNode): void {
    container.children.push(child);
  },

  insertBefore(
    parentInstance: RenderNode,
    child: RenderNode,
    beforeChild: RenderNode
  ): void {
    const index = parentInstance.children.indexOf(beforeChild);
    if (index !== -1) {
      parentInstance.children.splice(index, 0, child);
    }
    parentInstance.notifyChildren();
  },

  insertInContainerBefore(
    container: RenderRoot,
    child: RenderNode,
    beforeChild: RenderNode
  ): void {
    const index = container.children.indexOf(beforeChild);
    if (index !== -1) {
      container.children.splice(index, 0, child);
    }
  },

  removeChild(parentInstance: RenderNode, child: RenderNode): void {
    parentInstance.notifyChildren();
    const index = parentInstance.children.indexOf(child);
    if (index !== -1) {
      parentInstance.children.splice(index, 1);
    }
    child.unmount();
  },

  removeChildFromContainer(container: RenderRoot, child: RenderNode): void {
    const index = container.children.indexOf(child);
    if (index !== -1) {
      container.children.splice(index, 1);
    }
    child.unmount();
  },

  commitMount(
    _instance: RenderNode,
    _type: RenderTag,
    _props: object,
    _internalInstanceHandle: never
  ): void {},

  commitUpdate(
    instance: RenderNode,
    updatePayload: ReturnType<typeof diff>,
    _type: RenderTag,
    _prevProps: object,
    _nextProps: object,
    _internalHandle: never
  ): void {
    apply(updatePayload, instance.props);
    instance.notifyProps();
  },

  hideInstance(instance: RenderNode): void {
    instance.hidden = true;
  },

  unhideInstance(instance: RenderNode, _props: object): void {
    instance.hidden = false;
  },

  clearContainer(container: RenderRoot): void {
    container.children.length = 0;
  },
};

export default ReactReconciler(MyHostConfig);
