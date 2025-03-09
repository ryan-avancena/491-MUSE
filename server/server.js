/* server.js

- TODO: Add a description

*/

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { search } = require('./tunebat')

const app = express();
const port = 3000;

app.use(bodyParser.json());


// homepage
app.get('/', (req, res) => {
  res.send('Hello from Node.js backend!');
});


// search for a song
app.post('/process', async (req, res) => {
    const { data } = req.body;  
  
    try {
      const results = await search(data);
      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching data from Tunebat' });
    }
});

// start the server
app.listen(port, () => {
  console.log(`Node.js backend running at http://localhost:${port}`);
});
