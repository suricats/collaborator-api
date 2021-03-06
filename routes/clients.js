'use strict';
// MODULES IMPORT
var config = require('../config.js');
var moment = require('moment');
var clientUtils = require('../lib/client_utils.js');
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
  if(!clientUtils.isValidResource(body)){
    return u.formatResponse(res, u.toFailed("BAD_REQUEST", "Missing mandatory field(s)", u.HTTP_CODE_400));
  }
  database.query('INSERT INTO `client` SET ?', body).then(function (response) {
    return u.formatResponse(res, u.toSuccess(null, u.HTTP_CODE_201));
  }).catch(function(err){
    if(err) {
      logError('err', err);
      return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
    }
    return u.formatResponse(res, u.toFailed("INTERNAL_ERROR", "", u.HTTP_CODE_500));
  });
});

router.get('/', function(req, res) {
  database.query('SELECT * FROM `client`').then(function (response) {
    return u.formatResponse(res, u.toSuccess(response, u.HTTP_CODE_200));
  }).catch(function(err){
    if(err) {
      logError('err', err);
      return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
    }
    return u.formatResponse(res, u.toFailed("INTERNAL_ERROR", "", u.HTTP_CODE_500));
  });
});

router.get('/:id', function(req, res) {
  var request = { client_id : req.params.id};
  database.query('SELECT * FROM `client` WHERE ?', request).then(function (response) {
    if(response.length === 0){
      return u.formatResponse(res, u.toFailed("NOT_FOUND", "Resource not found", u.HTTP_CODE_404));
    }
    return u.formatResponse(res, u.toSuccess(response[0], u.HTTP_CODE_200));
  }).catch(function(err){
    if(err) {
      logError('err', err);
      return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
    }
    return u.formatResponse(res, u.toFailed("INTERNAL_ERROR", "", u.HTTP_CODE_500));
  });
});

router.put('/:id', function(req, res) {
  var request = { client_id : req.params.id};
  var body = req.body;
  if(!clientUtils.isValidResource(body)){
    return u.formatResponse(res, u.toFailed("BAD_REQUEST", "Missing mandatory field(s)", u.HTTP_CODE_400));
  }
  database.query('UPDATE `client` SET ? WHERE ?', [body,request]).then(function (response) {
    if(response.length === 0){
      return u.formatResponse(res, u.toFailed("NOT_FOUND", "Resource not found", u.HTTP_CODE_404));
    }
    return u.formatResponse(res, u.toSuccess(null, u.HTTP_CODE_200));
  }).catch(function(err){
    if(err) {
      logError('err', err);
      return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
    }
    return u.formatResponse(res, u.toFailed("INTERNAL_ERROR", "", u.HTTP_CODE_500));
  });
});

module.exports = router;
