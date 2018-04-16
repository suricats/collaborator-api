'use strict';
// MODULES IMPORT
var config = require('../config.js');
var moment = require('moment');
var sectorUtils = require('../lib/sector_utils.js');
var database = require('../lib/database.js');
var u = require('../lib/utils');
var logInfo = require('debug')('app:info');
var logError = require('debug')('app:error');

var express = require('express');
var router = express.Router();


router.post('/', function(req, res) {
  var body = req.body;
  if(!sectorUtils.isValidResource(body)){
    return u.formatResponse(res, u.toFailed("BAD_REQUEST", "Missing mandatory field(s)", u.HTTP_CODE_400));
  }
  database.query('INSERT INTO `sector` SET ?', body).then(function (response) {
    return u.formatResponse(res, u.toSuccess(null, u.HTTP_CODE_201));
  }).catch(function(err){
    logError('err', err);
    if(err.code == "ER_DUP_ENTRY") {
      return u.formatResponse(res, u.toFailed("CONFLICT", "Resource already existing", u.HTTP_CODE_409));
    }
    return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
  });
});

router.get('/', function(req, res) {
  database.query('SELECT * FROM `sector`').then(function (response) {
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
  var request = { sector_id : req.params.id};
  database.query('SELECT * FROM `sector` WHERE ?', request).then(function (response) {
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
  var request = { sector_id : req.params.id};
  var body = req.body;
  if(!sectorUtils.isValidResource(body)){
    return u.formatResponse(res, u.toFailed("BAD_REQUEST", "Missing mandatory field(s)", u.HTTP_CODE_400));
  }
  database.query('UPDATE `sector` SET ? WHERE ?', [body,request]).then(function (response) {
    if(response.affectedRows === 0){
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
