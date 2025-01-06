import Keycloak from "keycloak-js";

const SawsxKeycloak = new Keycloak({
  realm: "standard",
  url: "https://dev.loginproxy.gov.bc.ca/auth",
  clientId: "saw-sx-5132",
  checkLoginIframe: false,
});

SawsxKeycloak.onAuthRefreshError = () =>
  console.log("Error on refreshing token!");

export default SawsxKeycloak;
