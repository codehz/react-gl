import Reconciler, { RenderNode, RenderRoot } from "./reconciler";

export default class Renderer implements RenderRoot {
  children: RenderNode[] = [];
  #root: any;

  #loop() {
    for (const child of this.children) {
      child.render();
    }
  }

  constructor() {
    this.#root = Reconciler.createContainer(this, 0, false, null);
    const loop = () => {
      this.#loop();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  render(component: RenderNode, callback: () => void) {
    return Reconciler.updateContainer(component, this.#root, null, callback);
  }
}