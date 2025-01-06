import React from "react";

const Display = ({ kc, setKc }) => {
  return (
    <div>
      <h1>Welcome, {kc?.tokenParsed?.preferred_username}</h1>
    </div>
  );
};

export default Display;
