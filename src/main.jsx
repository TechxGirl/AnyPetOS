import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./index.css";
import App from "./App.jsx";
import { applyTheme, getInitialTheme } from "./utils/theme";

// Apply the saved preference before React renders so light-theme users do not
// see a brief dark flash while the application starts.
applyTheme(getInitialTheme());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
