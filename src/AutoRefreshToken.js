import { useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";

const AutoRefreshToken = ({ children, setKc }) => {
  const LOCK_CHANNEL = "kc-token-refresh";
  const LOCK_TIMEOUT = 1 * 60 * 1000 - 10000; // Token expiration in minutes * 60 seconds - 10 seconds
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

    const refreshToken = async () => {
      if (Date.now() - lastUpdate < LOCK_TIMEOUT) {
        return;
      }

      const newLastUpdate = Date.now();
      lastUpdate = newLastUpdate;

      refreshChannel.postMessage({
        type: "LAST_UPDATE",
        lastUpdate: newLastUpdate,
      });

      await delay(); // Introduce a small delay to allow other tabs to process the message

      if (lastUpdate !== newLastUpdate) {
        console.log("Another tab has taken the lock.");
        return;
      }

      console.log(`Locked for token refresh at ${getDate()}`);

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
          console.log(
            `Token refreshed: ${keycloak.token.slice(-5)} at ${getDate()}`
          );
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
      }
    };

    const interval = setInterval(() => {
      if (keycloak.token && keycloak.isTokenExpired(30)) {
        refreshToken();
      }
    }, 10000); // Check every 30 seconds, adjust as needed

    const handleBroadcastMessage = (event) => {
      switch (event.data.type) {
        case "LAST_UPDATE":
          lastUpdate = event.data.lastUpdate;
          console.log(
            `LastUpdate synchronized across tabs: ${getDate(
              new Date(lastUpdate)
            )}`
          );
          break;

        case "TOKEN_UPDATE":
          if (event.data.token) {
            keycloak.token = event.data.token;
            keycloak.refreshToken = event.data.refreshToken;
            keycloak.idToken = event.data.idToken;

            setKc({ ...keycloak });
            console.log(
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
  }, []);

  return children;
};

export default AutoRefreshToken;
