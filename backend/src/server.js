const express = require('express');
const bodyParser = require('body-parser')
const eeRouter = require('./routes/earth-engine');

// Create a new express application instance
const app = express();
const port = process.env.PORT || 3000;

// Start the server
app.use(express.static('public'));
app.use(bodyParser.json())

// Start the server
require('./controller/gee-authenticate')(app, port);

// Use routes
app.use('/ee', eeRouter);