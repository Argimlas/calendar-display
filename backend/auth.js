const { google } = require("googleapis");
const path = require("path");

const SERVICE_ACCOUNT_FILE = path.join(__dirname, "service-account.json");
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const getAuthenticatedClient = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: SCOPES,
  });
  return auth.getClient();
};

module.exports = { getAuthenticatedClient };
