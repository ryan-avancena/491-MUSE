
import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import { search } from './tunebat.js'; 


const app = express();
const port = 3000;

app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.send('Hello from Node.js backend!');
});


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


app.listen(port, () => {
  console.log(`node.js running: http://localhost:${port}`);
});
