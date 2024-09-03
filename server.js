#!/usr/bin/node

/**
 * Entry point of node app
 */

const express = require('express');
const router = require('./routes/index');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use('/', router);

app.set('strict routing', false);

app.listen(port, port, () => {
  console.log(`Server running on port ${port}`);
});
