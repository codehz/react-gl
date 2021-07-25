export const canvas = document.createElement("canvas");
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100vw";
canvas.style.height = "100vh";
document.body.appendChild(canvas);

export const gl = canvas.getContext("webgl")!;

let currentViewport: [number, number] = [0.0, 0.0];
let first: ((value: [number, number]) => void) | null = null;

export function viewport() {
  return currentViewport;
}

function fit(entries: ResizeObserverEntry[]) {
  const { width, height } = entries[0].contentRect;
  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  gl.viewport(0, 0, width * devicePixelRatio, height * devicePixelRatio);
  // fitFramebuffers(width * devicePixelRatio, height * devicePixelRatio);
  currentViewport = [width, height];
  if (first) first([width, height]);
  first = null;
}

new ResizeObserver(fit).observe(document.body);

await new Promise((resolve) => first = resolve);