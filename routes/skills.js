'use strict';
// MODULES IMPORT
var config = require('../config.js');
var moment = require('moment');
var skillUtils = require('../lib/skill_utils.js');
var Database = require('../lib/database.js');
var u = require('../lib/utils');
var logInfo = require('debug')('app:info');
var logError = require('debug')('app:error');

//Database connection
var dbConfig = {
  host     : config.dbHost,
  user     : config.dbUser,
  password : config.dbPassword,
  database : config.dbName,
  port     : config.dbPort
};

var database = new Database(dbConfig);

var express = require('express');
var router = express.Router();


router.post('/', function(req, res) {
  var body = req.body;
  if(!skillUtils.isValidResource(body)){
    return u.formatResponse(res, u.toFailed("BAD_REQUEST", "Missing mandatory field(s)", u.HTTP_CODE_400));
  }
  database.query('INSERT INTO `skill` SET ?', body).then(function (response) {
    return u.formatResponse(res, u.toSuccess(null, u.HTTP_CODE_201));
  }).catch(function(err){
    logError('err', err);
    return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
  });
});

router.get('/', function(req, res) {
  database.query('SELECT * FROM `skill`').then(function (response) {
    return u.formatResponse(res, u.toSuccess(response, u.HTTP_CODE_200));
  }).catch(function(err){
    logError('err', err);
    return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
  });
});


module.exports = router;
