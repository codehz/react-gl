import React, { useEffect, useState } from "react";
import Renderer from "./gl/renderer";

const root = new Renderer();

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
    <shader vert="" frag="" mode="triangle fan" count={4}>
      <uniform name="a" type="int" value={1} />
      <vao>
        <attrib index={0} fixed value={new Float32Array([1, 2, 3])} />
        <attrib index={0} size={1} type="byte" />
      </vao>
    </shader>
  </>;
}

root.render(
  <App />,
  () => console.log("done"),
);
console.log(root);
