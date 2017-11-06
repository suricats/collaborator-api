'use strict';

var config = require('./config.js');
var express = require('express');
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var suricats = require('./routes/suricats');
var tirosuri = require('./routes/tirosuri');

var app = express();
app.use(bodyParser.json());
app.use('/v1/suricats', suricats);
app.use('/v1/tirosuris', tirosuri);
app.use(function(req, res) {
  res.status(404).send({});
})
.listen(process.env.PORT || config.port);;
