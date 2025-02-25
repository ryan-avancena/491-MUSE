const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { search } = require('./tunebat')

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Simple route
app.get('/', (req, res) => {
  res.send('Hello from Node.js backend!');
});

// Example API endpoint (for example, to fetch some data)
app.post('/process', async (req, res) => {
    const { data } = req.body;  // Assuming a JSON payload with data field
  
    try {
      // Call the search function from tunebat.js
      const results = await search(data);
  
      // Respond with the search results
      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching data from Tunebat' });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Node.js backend running at http://localhost:${port}`);
});
