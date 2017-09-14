'use strict';
// MODULES IMPORT
var config = require('../config.js');
var moment = require('moment');
var collabUtils = require("../lib/collaborateur_utils");
var mysqlFactory = require("../lib/mysql_factory");

// DATABASE CONNECTION
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : config.dbHost,
  user     : config.dbUser,
  password : config.dbPassword,
  database : config.dbName,
  port     : config.dbPort
});

connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
} else {
    console.log("Error connecting database ... nn");
}
});

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  //TODO
  res.json({"status" : "Success"});
});

module.exports = router;
