import React, { useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import Display from "./Display";

const App = () => {
  const { keycloak, initialized } = useKeycloak();
  const [kc, setKc] = useState(keycloak);

  if (!initialized) return <div>Loading...</div>;

  return keycloak.authenticated ? (
    <Display kc={kc} setKc={setKc} />
  ) : (
    <div>Redirecting to login...</div>
  );
};

export default App;
