import React from "react";
import MockRoot from "./gl/mock";

const root = new MockRoot();
root.render(<reset />, () => console.log("here"));
console.log(root);