import React, { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import Display from "./Display";

const App = () => {
  const { keycloak, initialized } = useKeycloak();
  const [kc, setKc] = useState(keycloak);

  const LOCK_KEY = "kc-token-refresh-lock";
  const LOCK_TIMEOUT = 30000;

  useEffect(() => {
    if (!keycloak) return;

    const refreshToken = async () => {
      const lock = localStorage.getItem(LOCK_KEY);

      if (lock && Date.now() - parseInt(lock) < LOCK_TIMEOUT) {
        console.log("Another tab is refreshing the token, skipping...");
        return;
      }

      localStorage.setItem(LOCK_KEY, Date.now().toString());

      try {
        console.log(`Token refreshing using ${keycloak.refreshToken.slice(-5)}`);
        const refreshed = await keycloak.updateToken(30);
        if (refreshed) {
          localStorage.setItem("kc-refresh-token", keycloak.refreshToken);
          localStorage.setItem("kc-id-token", keycloak.idToken);
          localStorage.setItem("kc-token", keycloak.token);
          setKc({ ...keycloak });
          console.log(
            `Token refreshed: ${keycloak.token.slice(
              -5
            )} ${new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}`
          );
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
      } finally {
        setTimeout(() => {
          localStorage.removeItem(LOCK_KEY);
        }, (LOCK_TIMEOUT - 5));
      }
    };

    const interval = setInterval(() => {
      if (keycloak.token && keycloak.isTokenExpired(30)) {
        refreshToken();
      }
    }, (LOCK_TIMEOUT - 5));

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

      localStorage.removeItem("kc-token");
      localStorage.removeItem("kc-refresh-token");
      localStorage.removeItem("kc-id-token");
      localStorage.removeItem("kc-token-refresh-lock");

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
