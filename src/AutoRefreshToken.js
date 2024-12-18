import { useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";

const AutoRefreshToken = ({ children, setKc }) => {
  const LOCK_CHANNEL = "kc-token-refresh";
  const LOCK_TIMEOUT = 1 * 60 * 1000 - 10000; // token expiration in minutes * 60 seconds - 20 seconds
  const { keycloak } = useKeycloak();

  useEffect(() => {
    if (!keycloak) return;

    // Create a broadcast channel for token synchronization
    const refreshChannel = new BroadcastChannel(LOCK_CHANNEL);
    let lastUpdate = Date.now();

    const getDate = () =>
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

    const delay = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    };

    const refreshToken = async () => {
      if (lastUpdate && Date.now() - parseInt(lastUpdate) < LOCK_TIMEOUT) {
        return;
      }

      const newLastUpdate = Date.now();

      refreshChannel.postMessage({
        type: "LAST_UPDATE",
        lastUpdate: newLastUpdate,
      });

      await delay();

      if (lastUpdate !== newLastUpdate) {
        console.log(`Another tab is trying to lock`);
        return;
      }

      console.log(`Locked: ${getDate()}`);

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

          console.log(
            `Token refreshed: ${keycloak.token.slice(-5)} ${getDate()}`
          );
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
      }
    };

    // Token refresh interval
    const interval = setInterval(() => {
      if (keycloak.token && keycloak.isTokenExpired(30)) {
        refreshToken();
      }
    }, 10000);

    // Handle messages from other tabs
    const handleBroadcastMessage = (event) => {
      switch (event.data.type) {
        case "LAST_UPDATE":
          lastUpdate = event.data.lastUpdate;
          console.log(`LastUpdate updated across tabs: ${lastUpdate}`);
          break;

        case "TOKEN_UPDATE":
          if (event.data.token) {
            // Update Keycloak's in-memory tokens
            keycloak.token = event.data.token;
            keycloak.refreshToken = event.data.refreshToken;
            keycloak.idToken = event.data.idToken;

            setKc({ ...keycloak });

            console.log(
              `Token updated across tabs: ${keycloak.token.slice(
                -5
              )} ${getDate()}`
            );
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
  }, []);

  return children;
};

export default AutoRefreshToken;
