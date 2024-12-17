import React, { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import Display from "./Display";

const App = () => {
  const { keycloak, initialized } = useKeycloak();
  const [kc, setKc] = useState(keycloak);

  const LOCK_CHANNEL = "kc-token-refresh";
  const LOCK_TIMEOUT = 30000;

  useEffect(() => {
    if (!keycloak) return;

    // Create a broadcast channel for token synchronization
    const refreshChannel = new BroadcastChannel(LOCK_CHANNEL);
    let refreshLock = false;

    const getDate = () =>
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

    const refreshToken = async () => {
      // Use broadcast channel to prevent multiple simultaneous refreshes
      if (refreshLock) {
        return;
      }

      refreshLock = true;
      console.log(`Locked: ${getDate()}`);

      refreshChannel.postMessage({ type: "REFRESH_LOCK", refreshLock });

      try {
        const refreshed = await keycloak.updateToken(30);

        if (refreshed) {
          const tokenUpdate = {
            type: "TOKEN_UPDATE",
            token: keycloak.token,
            refreshToken: keycloak.refreshToken,
            idToken: keycloak.idToken,
          };

          // Broadcast token update to all tabs
          refreshChannel.postMessage(tokenUpdate);

          setKc({ ...keycloak });
          console.log(
            `Token refreshed: ${keycloak.token.slice(-5)} ${getDate()}`
          );
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
      } finally {
        // Release lock after timeout
        setTimeout(() => {
          refreshLock = false;
          refreshChannel.postMessage({ type: "REFRESH_LOCK", refreshLock });
          console.log(`UnLocked: ${getDate()}`);
        }, LOCK_TIMEOUT);
      }
    };

    // Token refresh interval
    const interval = setInterval(() => {
      refreshToken();
    }, LOCK_TIMEOUT);

    // Handle messages from other tabs
    const handleBroadcastMessage = (event) => {
      switch (event.data.type) {
        case "REFRESH_LOCK":
          refreshLock = event.data.refreshLock;
          break;

        case "TOKEN_UPDATE":
          if (event.data.token) {
            console.log("Token updated across tabs, updating Keycloak...");

            // Update Keycloak's in-memory tokens
            keycloak.token = event.data.token;
            keycloak.refreshToken = event.data.refreshToken;
            keycloak.idToken = event.data.idToken;

            setKc({ ...keycloak });
          }
          break;

        default:
      }
    };

    // Add broadcast channel message listener
    refreshChannel.addEventListener("message", handleBroadcastMessage);

    return () => {
      // Cleanup
      clearInterval(interval);
      refreshChannel.removeEventListener("message", handleBroadcastMessage);
      refreshChannel.close();
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
