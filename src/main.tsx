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
    <shader vert="" frag="" attr-test={0} uniform-demo="" />
  </>;
}

root.render(
  <App />,
  () => console.log("done"),
);
console.log(root);
