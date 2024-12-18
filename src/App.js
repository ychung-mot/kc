import React, { useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import Display from "./Display";
import AutoRefreshToken from "./AutoRefreshToken";

const App = () => {
  const { keycloak, initialized } = useKeycloak();
  const [kc, setKc] = useState(keycloak);

  if (!initialized) return <div>Loading...</div>;

  return keycloak.authenticated ? (
    <AutoRefreshToken setKc={setKc}>
      <Display kc={kc} setKc={setKc} />
    </AutoRefreshToken>
  ) : (
    <div>Redirecting to login...</div>
  );
};

export default App;
