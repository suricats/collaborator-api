'use strict';
// MODULES IMPORT
var config = require('../config.js');
var moment = require('moment');
var skillUtils = require('../lib/client_utils.js');
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

router.get('/:id', function(req, res) {
  var request = { client_id : req.params.id};
  database.query('SELECT * FROM `skill` WHERE ?', request).then(function (response) {
    if(response.length === 0){
      return u.formatResponse(res, u.toFailed("NOT_FOUND", "Resource not found", u.HTTP_CODE_404));
    }
    return u.formatResponse(res, u.toSuccess(response[0], u.HTTP_CODE_200));
  }).catch(function(err){
    logError('err', err);
    return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
  });
});

module.exports = router;
