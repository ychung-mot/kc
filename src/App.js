// src/App.jsx
import React, { useEffect } from "react";
import { useAuth } from "react-oidc-context";

const App = () => {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated) {
      const handle = setInterval(() => {
        auth.signinSilent();
      }, 2000);

      return () => clearInterval(handle);
    }
  }, [auth]);

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
    default:
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        Hello {auth.user?.profile.sub}{" "}
        <button onClick={() => void auth.removeUser()}>Log out</button>
      </div>
    );
  }

  return <button onClick={() => void auth.signinRedirect()}>Log in</button>;
};

export default App;
