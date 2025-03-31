import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import { search } from '../server/tunebat.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({ origin: '*' })); 


app.use('/static', express.static(path.join(__dirname, '../client/static')));

// serve index.html from /client/templates
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/templates/index.html'));
});

app.post('/create-room', async (req, res) => {
  try {
      const { host_id } = req.body;

      console.log("Request body:", req.body); 

      if (!host_id) {
          return res.status(400).json({ error: "Missing room_id or host_id" });
      }

      const flaskResponse = await axios.post('http://127.0.0.1:5000/create-room', 
          { host_id },
          { headers: { 'Content-Type': 'application/json' } }
      );

      res.json(flaskResponse.data);
  } catch (error) {
      console.error("Error creating room:", error.response?.data || error.message);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/join-room', async (req, res) => {
  try {
      const { user_id, room_id } = req.body;

      if (!user_id || !room_id) {
          return res.status(400).json({ error: "Missing user_id or room_id" });
      }

      const flaskResponse = await axios.post('http://127.0.0.1:5000/join-room', 
          { user_id, room_id },
          { headers: { 'Content-Type': 'application/json' } }
      );

      res.json(flaskResponse.data);
  } catch (error) {
      console.error("Error joining room:", error.response?.data || error.message);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/auth-spotify', async (req, res) => {
  const { code } = req.query;
  const response = await axios.post('https://accounts.spotify.com/api/token', null, {
    params: {
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:3000/auth-spotify',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    },
  });

  res.json(response.data);
});

// start server
app.listen(port, () => {
  console.log(`Node.js running at http://localhost:${port}`);
});
