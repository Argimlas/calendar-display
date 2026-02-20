const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = path.join(__dirname, "token.json");
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const loadCredentials = () => {
  try {
    const content = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Failed to load credentials.json:", err.message);
    return null;
  }
};

const createOAuth2Client = () => {
  const credentials = loadCredentials();
  if (!credentials) return null;

  const { client_id, client_secret, redirect_uris } = credentials.web;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
};

const getAuthUrl = () => {
  try {
    const client = createOAuth2Client();
    if (!client) return null;

    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });
    console.log("Generated auth URL");
    return url;
  } catch (err) {
    console.error("Failed to generate auth URL:", err.message);
    return null;
  }
};

const getTokenFromCode = async (code) => {
  try {
    const client = createOAuth2Client();
    if (!client) return null;

    const { tokens } = await client.getToken(code);
    console.log("Token obtained from authorization code");
    return tokens;
  } catch (err) {
    console.error("Failed to get token from code:", err.message);
    return null;
  }
};

const saveToken = (token) => {
  try {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
    console.log("Token saved to", TOKEN_PATH);
  } catch (err) {
    console.error("Failed to save token:", err.message);
  }
};

const loadToken = () => {
  try {
    if (!fs.existsSync(TOKEN_PATH)) return null;
    const content = fs.readFileSync(TOKEN_PATH, "utf-8");
    console.log("Token loaded from", TOKEN_PATH);
    return JSON.parse(content);
  } catch (err) {
    console.error("Failed to load token:", err.message);
    return null;
  }
};

const getAuthenticatedClient = async () => {
  try {
    const token = loadToken();
    if (!token) {
      console.log("No token found, authentication required");
      return null;
    }

    const client = createOAuth2Client();
    if (!client) return null;

    client.setCredentials(token);

    // Refresh token if expired
    if (token.expiry_date && token.expiry_date < Date.now()) {
      console.log("Token expired, refreshing...");
      if (!token.refresh_token) {
        console.warn("Missing refresh_token; re-authentication required");
        return null;
      }
      const { credentials } = await client.refreshToken(token.refresh_token);
      const mergedCredentials = { ...token, ...credentials };
      client.setCredentials(mergedCredentials);
      saveToken(mergedCredentials);
      console.log("Token refreshed successfully");
    }

    return client;
  } catch (err) {
    console.error("Failed to get authenticated client:", err.message);
    return null;
  }
};

module.exports = {
  getAuthUrl,
  getTokenFromCode,
  saveToken,
  loadToken,
  getAuthenticatedClient,
};
