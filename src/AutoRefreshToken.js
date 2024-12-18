import { useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";

const LOCK_CHANNEL = "kc-token-refresh";
const LOCK_TIMEOUT = 5 * 60 * 1000 - 20000; // Token expiration in minutes * 60 seconds - 20 seconds

const AutoRefreshToken = ({ children, setKc }) => {
  const { keycloak } = useKeycloak();

  useEffect(() => {
    if (!keycloak) return;

    const refreshChannel = new BroadcastChannel(LOCK_CHANNEL);
    let lastUpdate = Date.now();

    const getDate = (date = new Date()) =>
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

    const delay = (ms = 1000) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const attemptTokenRefresh = async () => {
      if (Date.now() - lastUpdate < LOCK_TIMEOUT) return;

      const newLastUpdate = Date.now();
      lastUpdate = newLastUpdate;

      refreshChannel.postMessage({
        type: "LAST_UPDATE",
        lastUpdate: newLastUpdate,
      });

      await delay(); // Allow other tabs to process the message

      if (lastUpdate !== newLastUpdate) {
        return;
      }

      try {
        const refreshed = await keycloak.updateToken(30);
        if (refreshed) {
          const tokenUpdate = {
            type: "TOKEN_UPDATE",
            token: keycloak.token,
            refreshToken: keycloak.refreshToken,
            idToken: keycloak.idToken,
          };
          setKc({ ...keycloak });
          refreshChannel.postMessage(tokenUpdate);
          console.debug(
            `Token refreshed: ${keycloak.token.slice(-5)} at ${getDate()}`
          );
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
      }
    };

    const interval = setInterval(() => {
      if (keycloak.token && keycloak.isTokenExpired(30)) {
        attemptTokenRefresh();
      }
    }, 10000);

    const handleBroadcastMessage = (event) => {
      const {
        type,
        lastUpdate: newLastUpdate,
        token,
        refreshToken,
        idToken,
      } = event.data || {};
      switch (type) {
        case "LAST_UPDATE":
          lastUpdate = newLastUpdate;
          break;

        case "TOKEN_UPDATE":
          if (token) {
            keycloak.token = token;
            keycloak.refreshToken = refreshToken;
            keycloak.idToken = idToken;
            setKc({ ...keycloak });
            console.debug(
              `Token updated across tabs: ${keycloak.token.slice(
                -5
              )} at ${getDate()}`
            );
          }
          break;

        default:
          break;
      }
    };

    refreshChannel.addEventListener("message", handleBroadcastMessage);

    return () => {
      clearInterval(interval);
      refreshChannel.removeEventListener("message", handleBroadcastMessage);
      refreshChannel.close();
    };
  }, [keycloak, setKc]);

  return children;
};

export default AutoRefreshToken;
