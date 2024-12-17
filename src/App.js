import React from "react";
import { useKeycloak } from "@react-keycloak/web";

const App = () => {
  const { keycloak, initialized } = useKeycloak();

  const epochToReadableTime = (epochTime) => {
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

  if (!initialized) return <div>Loading...</div>;

  return keycloak.authenticated ? (
    <div>
      <h1>Welcome, {keycloak.tokenParsed?.preferred_username}</h1>
      <h2>Access Token: {keycloak.token.slice(-5)}</h2>
      <h2>Refresh Token: {keycloak.refreshToken.slice(-5)}</h2>
      <h2>Expiration: {epochToReadableTime(keycloak.tokenParsed.exp)}</h2>
    </div>
  ) : (
    <div>Redirecting to login...</div>
  );
};

export default App;
