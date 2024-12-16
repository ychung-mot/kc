import { WebStorageStateStore } from "oidc-client-ts";

const oidcConfig = {
  authority:
    "https://keycloak-b07b69-dev.apps.advsol-ams.3j6z.p1.openshiftapps.com/realms/master", // Keycloak's realm URL
  client_id: "advsol-public", // Client ID
  redirect_uri: window.location.origin, // Where the user is redirected after login
  post_logout_redirect_uri: window.location.origin, // Where the user is redirected after logout
  response_type: "code", // Use Authorization Code Flow
  scope: "openid profile email", // Specify the scopes you need
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: false,
};

export default oidcConfig;