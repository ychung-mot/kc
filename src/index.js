import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import SawsxKeycloak from "./SawsxKeycloak"; // Your Keycloak configuration

// Define a function to log Keycloak events (optional)
const eventLogger = (event, error) => {
  console.log("onKeycloakEvent", event, error);
};

// Define a function to log Keycloak tokens (optional)
const tokenLogger = (tokens) => {
  console.log("onKeycloakTokens", tokens);
};

ReactDOM.render(
  <React.StrictMode>
    <ReactKeycloakProvider
      authClient={SawsxKeycloak}
      initOptions={{ onLoad: "login-required", pkceMethod: "S256" }}
      onEvent={eventLogger} // Optional: for logging events
      onTokens={tokenLogger} // Optional: for logging tokens
    >
      <App />
    </ReactKeycloakProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
