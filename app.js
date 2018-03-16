'use strict';

var express = require('express');
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var morgan = require('morgan');
var config = require('./config.js');
var suricats = require('./routes/suricats');
var sectors = require('./routes/sectors');
var clients = require('./routes/clients');
var tirosuri = require('./routes/tirosuri');

var app = express();
if (app.get('env') == 'production') {
  app.use(morgan('common', { skip: function(req, res) { return res.statusCode < 400 } }));
} else {
  app.use(morgan('dev'));
}
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use('/v1/suricats', suricats);
app.use('/v1/sectors', sectors);
app.use('/v1/clients', clients);
//app.use('/v1/tirosuris', tirosuri);
app.use(function(req, res) {
  res.status(404).send({});
})
.listen(process.env.PORT || config.port);
