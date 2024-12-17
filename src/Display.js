import { useKeycloak } from "@react-keycloak/web";
import React from "react";

const Display = ({ kc, setKc }) => {
  const keycloak = useKeycloak();

  const epochToReadableTime = (epochTime) => {
    if (!epochTime) return "";

    const date = new Date(epochTime * 1000);

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };

    return date.toLocaleDateString("en-US", options);
  };

  const handleClick = async () => {
    const refreshed = await kc.updateToken(30);
    if (refreshed) {
      setKc({ ...keycloak });
    }
  };

  return (
    <div>
      <h1>Welcome, {kc?.tokenParsed?.preferred_username}</h1>
      <h2>Access Token: {kc?.token?.slice(-5)}</h2>
      <h2>Refresh Token: {kc?.refreshToken?.slice(-5)}</h2>
      <h2>Expiration: {epochToReadableTime(kc?.tokenParsed?.exp)}</h2>
      <button onClick={handleClick}>Refresh Token</button>
    </div>
  );
};

export default Display;
