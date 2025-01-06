import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import SawsxKeycloak from "./SawsxKeycloak";

ReactDOM.render(
  <React.StrictMode>
    <ReactKeycloakProvider
      authClient={SawsxKeycloak}
      initOptions={{
        onLoad: "login-required",
        pkceMethod: "S256",
      }}
      autoRefreshToken={true}
    >
      <App />
    </ReactKeycloakProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
