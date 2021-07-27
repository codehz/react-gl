import React, { useEffect, useState } from "react";
import Renderer from "./gl/renderer";

const root = new Renderer();

const vert = `
  precision mediump float;
  attribute vec2 pos;
  void main(void) {
    gl_Position = vec4(pos, 0.0, 1.0);
  }
`;

const frag = `
  precision mediump float;
  void main(void) {
    gl_FragColor = vec4(1, 0.5, 0.0, 1);
  }
`;

const data = new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, -0.5]);

function App() {
  const [red, setRed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setRed(Math.random());
    }, 100);
    return () => clearInterval(id);
  }, []);
  return <>
    <reset color={[red, 0, 0, 1]} />
    <shader vert={vert} frag={frag} mode="triangles" count={3}>
      <vao>
        <buffer target="array" usage="static" data={data} />
        <attrib name="pos" size={2} type="float" />
      </vao>
    </shader>
  </>;
}

root.render(
  <App />,
  () => console.log("done"),
);
console.log(root);
