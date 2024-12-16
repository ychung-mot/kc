import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import oidcConfig from "./oidcConfig";

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider
      {...oidcConfig}
      onSigninCallback={(user) => {
        console.log("onSigninCallback", user);
      }}
      onSigninError={(error) => {
        console.error("Signin Error", error);
      }}
      onLogout={(user) => {
        console.log("onLogout", user);
      }}
    >
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
