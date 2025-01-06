import React from "react";

const Display = ({ kc, setKc }) => {
  return (
    <div>
      <h1>Welcome, {kc?.tokenParsed?.preferred_username}</h1>
      <h2>Access Token: {kc?.token?.slice(-5)}</h2>
      <h2>Refresh Token: {kc?.refreshToken?.slice(-5)}</h2>
    </div>
  );
};

export default Display;
