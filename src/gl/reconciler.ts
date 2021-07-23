import ReactReconciler, { HostConfig } from "react-reconciler";
import builtins from "./builtins";

export type RenderRoot = {
  children: RenderNode[];
};

type RenderTag = string;

export interface RenderNode {
  tag: RenderTag;
  props: object;
  children: RenderNode[];
  hidden?: boolean;
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
  null,
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
      return (builtins as any)[type](props);
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
    _instance: RenderNode,
    _type: RenderTag,
    _props: object,
    _rootContainer: RenderRoot,
    _hostContext: null
  ): boolean {
    return false;
  },

  prepareUpdate(
    _instance: RenderNode,
    _type: RenderTag,
    _oldProps: object,
    _newProps: object,
    _rootContainer: RenderRoot,
    _hostContext: null
  ): null {
    return null;
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
    const index = parentInstance.children.indexOf(child);
    if (index !== -1) {
      parentInstance.children.splice(index, 1);
    }
  },

  removeChildFromContainer(_container: RenderRoot, _child: RenderNode): void {},

  commitMount(
    _instance: RenderNode,
    _type: RenderTag,
    _props: object,
    _internalInstanceHandle: never
  ): void {},

  commitUpdate(
    instance: RenderNode,
    _updatePayload: null,
    _type: RenderTag,
    _prevProps: object,
    nextProps: object,
    _internalHandle: never
  ): void {
    instance.props = nextProps;
  },

  hideInstance(instance: RenderNode): void {
    instance.hidden = true;
  },

  unhideInstance(instance: RenderNode, _props: object): void {
    instance.hidden = false;
  },

  clearContainer(container: RenderRoot): void {
    container.children = [];
  },
};

export default ReactReconciler(MyHostConfig);
