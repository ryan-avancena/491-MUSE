import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import { search } from '../server/tunebat.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(bodyParser.json());

// ✅ Serve static files from /client/static under `/static`
app.use('/static', express.static(path.join(__dirname, '../client/static')));

// ✅ Serve index.html from /client/templates
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/templates/index.html'));
});

// ✅ Create room (mock response)
app.get('/create-room', (req, res) => {
  const roomId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:5000/join-room/${roomId}`;

  res.json({ roomId, qrCodeUrl });
});

// Start server
app.listen(port, () => {
  console.log(`Node.js running at http://localhost:${port}`);
});
