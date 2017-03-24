'use strict';

var config = require('./config.js');
var express = require('express');
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var collaborateurs = require('./routes/collaborateurs');

var app = express();
app.use(bodyParser.json());
app.use('/v1/collaborateurs', collaborateurs).
use(function(req, res) {
  res.status(404).send({});
})
.listen(process.env.PORT || config.port);;
