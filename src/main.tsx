import React from "react";
import MockRoot from "./gl/mock";

const root = new MockRoot();
root.render(
  <>
    <group>
      <reset color={[1, 2, 3, 4]} />
    </group>
  </>,
  () => console.log("done"),
);
console.log(root);
