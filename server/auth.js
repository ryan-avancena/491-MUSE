import dotenv from 'dotenv';
import crypto from 'crypto';
import express from 'express';
import fetch from 'node-fetch';
import session from 'express-session';
import { fileURLToPath } from 'url';
import path from 'path';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = 8000; // Same as the redirect_uri

app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

// Generate random string
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.randomBytes(length);
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

// SHA-256 hashing function
const sha256 = (plain) => {
  const hash = crypto.createHash('sha256');
  hash.update(plain);
  return hash.digest();
}

// Base64 encoding function
const base64encode = (input) => {
  return input.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

console.log(clientId, clientSecret);

const redirectUri = 'http://127.0.0.1:8000/callback'; // Make sure this matches your Spotify redirect URI
const scope = 'user-read-private user-read-email';

// Generate code_verifier and code_challenge
const codeVerifier = generateRandomString(64);
const hashed = sha256(codeVerifier);
const codeChallenge = base64encode(hashed);

// Store code_verifier in session
app.get('/login', (req, res) => {
  req.session.codeVerifier = codeVerifier;
  const authUrl = new URL("https://accounts.spotify.com/authorize");
  const params = {
    response_type: 'code',
    client_id: clientId,
    scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();
  res.redirect(authUrl.toString());
});

// Route to handle Spotify callback and get access token
app.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    res.status(400).send("Authorization code not found.");
    return;
  }

  const tokenUrl = "https://accounts.spotify.com/api/token";
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(clientId + ':' + clientSecret).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: req.session.codeVerifier,  // Retrieve code_verifier from session
    }),
  };

  try {
    const response = await fetch(tokenUrl, payload);
    const data = await response.json();

    console.log("Token Response:", data);

    if (data.access_token) {
      res.send("Successfully authenticated! Access Token: " + data.access_token);
    } else {
      res.status(400).send("Error retrieving access token: " + JSON.stringify(data));
    }
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server started at http://127.0.0.1:${port}`);
  console.log(`Go to http://127.0.0.1:${port}/login to start the authorization process.`);
});
