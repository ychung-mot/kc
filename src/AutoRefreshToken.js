import { useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";

const LOCK_CHANNEL = "kc-token-refresh";
const LOCK_TIMEOUT = 1 * 60 * 1000 - 20000; // Token expiration in minutes * 60 seconds - 20 seconds
const LOCK_OWNER_KEY = "kc-lock-owner";
const uniqueTabId = `${Math.random().toString(36).substring(7)}`; // Unique identifier for this tab

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

    const getLockOwner = () => localStorage.getItem(LOCK_OWNER_KEY);
    const setLockOwner = (owner) => localStorage.setItem(LOCK_OWNER_KEY, owner);

    const attemptTokenRefresh = async () => {
      const currentLockOwner = getLockOwner();

      // Skip if another tab owns the lock or if the timeout hasn't expired
      if (
        (currentLockOwner && currentLockOwner !== uniqueTabId) ||
        Date.now() - lastUpdate < LOCK_TIMEOUT
      ) {
        return;
      }

      // Try to acquire the lock
      setLockOwner(uniqueTabId);
      lastUpdate = Date.now();

      refreshChannel.postMessage({
        type: "LAST_UPDATE",
        lastUpdate: lastUpdate,
      });

      // Verify if the current tab still owns the lock
      if (getLockOwner() !== uniqueTabId) {
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
            `Token renewed: ${keycloak.token.slice(
              -5
            )} at ${getDate()} ${lastUpdate} ${uniqueTabId}`
          );
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
      }
    };

    const interval = setInterval(() => {
      const owner = localStorage.getItem(LOCK_OWNER_KEY);
      if (!owner) {
        localStorage.setItem(LOCK_OWNER_KEY, uniqueTabId);
      }
      if (keycloak.token && keycloak.isTokenExpired(30)) {
        attemptTokenRefresh();
      }
    }, 10000);

    const ownerMaintenance = setInterval(() => {
      if (Date.now() - lastUpdate > LOCK_TIMEOUT + 60000) {
        localStorage.removeItem(LOCK_OWNER_KEY);
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
              `Token updated: ${keycloak.token.slice(
                -5
              )} at ${getDate()} ${lastUpdate}`
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
      clearInterval(ownerMaintenance);
      localStorage.removeItem(LOCK_OWNER_KEY);
    };
  }, [keycloak, setKc]);

  return children;
};

export default AutoRefreshToken;
