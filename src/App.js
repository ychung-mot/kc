import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import Display from "./Display";

const App = () => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) return <div>Loading...</div>;

  return keycloak.authenticated ? (
    <Display keycloak={keycloak} />
  ) : (
    <div>Redirecting to login...</div>
  );
};

export default App;
