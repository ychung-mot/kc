import React, { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import Display from "./Display";

const App = () => {
  const { keycloak, initialized } = useKeycloak();
  const [kc, setKc] = useState(keycloak);

  useEffect(() => {
    if (!keycloak) return;

    const refreshToken = async () => {
      const LOCK_KEY = "kc-token-refresh-lock";
      const LOCK_TIMEOUT = 10000; // 10 seconds timeout
      const lock = localStorage.getItem(LOCK_KEY);

      if (lock && Date.now() - parseInt(lock) < LOCK_TIMEOUT) {
        console.log("Another tab is refreshing the token, skipping...");
        return;
      }

      localStorage.setItem(LOCK_KEY, Date.now().toString());

      try {
        const refreshed = await keycloak.updateToken(30);
        if (refreshed) {
          localStorage.setItem("kc-token", keycloak.token);
          localStorage.setItem("kc-refresh-token", keycloak.refreshToken);
          localStorage.setItem("kc-id-token", keycloak.idToken);
          setKc({ ...keycloak });
          console.log("Token successfully refreshed");
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
      } finally {
        localStorage.removeItem(LOCK_KEY);
      }
    };

    const interval = setInterval(() => {
      if (keycloak.token && keycloak.isTokenExpired(30)) {
        refreshToken();
      }
    }, 10000);

    const handleStorageEvent = (event) => {
      if (event.key === "kc-token" && event.newValue) {
        console.log("Token updated in localStorage, updating Keycloak...");

        // Update Keycloak's in-memory tokens
        keycloak.token = localStorage.getItem("kc-token");
        keycloak.refreshToken = localStorage.getItem("kc-refresh-token");
        keycloak.idToken = localStorage.getItem("kc-id-token");
        setKc({ ...keycloak });
      }
    };

    window.addEventListener("storage", handleStorageEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [keycloak]);

  if (!initialized) return <div>Loading...</div>;

  return keycloak.authenticated ? (
    <Display kc={kc} setKc={setKc} />
  ) : (
    <div>Redirecting to login...</div>
  );
};

export default App;
