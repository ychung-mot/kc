import React, { useState } from "react";
import { useKeycloak } from "@react-keycloak/web";

const App = () => {
  const { keycloak, initialized } = useKeycloak();
  const [kc] = useState(keycloak);

  if (!initialized) return <div>Loading...</div>;

  return keycloak.authenticated ? (
    <div>
      <h1>Welcome, {kc?.tokenParsed?.preferred_username}</h1>
    </div>
  ) : (
    <div>Redirecting to login...</div>
  );
};

export default App;
