import express from 'express';
const app = express();
import bodyparser from 'body-parser';
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));


import con from '../database/connection.js'

const route = '/comment'

app.post(route + '/add')

const port = 3000
app.listen(port, () => {
  console.log('server running on ' + port)
});

