import React from "react";
import ReactDOM from "react-dom/client";
import Content from "./Content";

const root = document.createElement("div");
root.id = "crx-root";
document.body.append(root);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Content />
  </React.StrictMode>
);
