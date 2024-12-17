import React, { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import Display from "./Display";

const App = () => {
  const { keycloak, initialized } = useKeycloak();
  const [kc, setKc] = useState(keycloak);

  useEffect(() => {
    if (!keycloak) return;

    const refreshToken = async () => {
      try {
        const refreshed = await keycloak.updateToken(30);
        if (refreshed) {
          setKc({ ...keycloak });
          console.log("Token successfully refreshed");
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
      }
    };

    const interval = setInterval(() => {
      if (keycloak.token && keycloak.isTokenExpired(30)) {
        refreshToken();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [keycloak]);

  if (!initialized) return <div>Loading...</div>;

  return keycloak.authenticated ? (
    <Display kc={kc} setKc={setKc} />
  ) : (
    <div>Redirecting to login...</div>
  );
};

export default App;
