import React from "react";
import { useKeycloak } from "@react-keycloak/web";

const App = () => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) return <div>Loading...</div>;

  return keycloak.authenticated ? (
    <div>
      <h1>Welcome, {keycloak.tokenParsed?.preferred_username}</h1>
      <button onClick={() => keycloak.logout()}>Logout</button>
    </div>
  ) : (
    <div>Redirecting to login...</div>
  );
};

export default App;
