'use strict';
// MODULES IMPORT

var config = require('../config.js');
var multer  = require('multer');
var logInfo = require('debug')('app:info');
var logError = require('debug')('app:error');
var csv = require("fast-csv");
var fs = require('fs');
var u = require('../lib/utils');
var suricatUtils = require("../lib/suricat_utils");
var database = require('../lib/database.js');

// SET UPLOAD PROPERTIES
var maxFileSize = (config.maxFileSize) ? config.maxFileSize : 10000; // in bytes
var fileUploadPath = (config.fileUploadPath) ? config.fileUploadPath : '/tmp/uploads/';
var upload = multer({ dest: fileUploadPath, limits: { fileSize: maxFileSize } });

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  const dbInput = suricatUtils.constructQuery(req.query.search, req.query.status, req.query.index, req.query.size, req.query.order);
  logInfo(dbInput);
  database.query(dbInput.query, dbInput.args).then(function (response) {
    return u.formatResponse(res, u.toSuccess(response, u.HTTP_CODE_200));
  }).catch(function(err){
    logError('err', err);
    return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
  });
});

router.get('/:id', function(req, res) {
  var request = { email : req.params.id};
  database.query( 'SELECT * FROM `suricat` WHERE ?', request).then(function (response) {
    if(response.length === 0){
      return u.formatResponse(res, u.toFailed("NOT_FOUND", "Resource not found", u.HTTP_CODE_404));
    }
    return u.formatResponse(res, u.toSuccess(response[0], u.HTTP_CODE_200));
  }).catch(function(err){
    logError('err', err);
    return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
  });
});

router.post('/', function(req, res) {
  var body = req.body;
  if(!suricatUtils.isValidResource(body)){
    return u.formatResponse(res, u.toFailed("BAD_REQUEST", "Missing mandatory field(s)", u.HTTP_CODE_400));
  }
  body = suricatUtils.setDefaultValues(body);
  database.query( 'INSERT INTO `suricat` SET ?', body).then(function (response) {
    return u.formatResponse(res, u.toSuccess([], u.HTTP_CODE_201));
  }).catch(function(err){
    logError('err', err);
    if(err.code == "ER_DUP_ENTRY"){
      return u.formatResponse(res, u.toFailed("CONFLICT", "Resource already created", u.HTTP_CODE_409));
    }
    return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
  });
});

// router.post('/import', function(req, res) {
//   upload.single('annuaire')(req, res, function (err) {
//   if (err) {
//     logError('err', err);
//     return u.formatResponse(res, u.toFailed(err.code, "Error during the reading of CSV file", u.HTTP_CODE_500));
//   }
//
//   database.query( 'DELETE FROM `suricat`', null, function(err, rows){
//     if(err) {
//       logError(err);
//       return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
//     }
//     var referentiel = [];
//     var first = true;
//     var sleepMode = false;
//     var errorMessage = "";
//     var count = 0;
//
//     var stream = fs.createReadStream(req.file.path);
//     csv.fromStream(stream, {delimiter : ";"})
//     .on("data", function(line){
//      if(first){
//        line.forEach(function(element, index){
//          var ressourceName = suricatUtils.getRessourceName(element);
//          if(ressourceName){
//            referentiel[index] = ressourceName;
//          }
//        });
//        first = false;
//      }
//      else{
//        var suricat = {};
//        line.forEach(function(element, index){
//          suricat[referentiel[index]] = element;
//        });
//        if(suricatUtils.isValidResource(suricat)){
//           if(!sleepMode){
//             suricat = suricatUtils.setDefaultValues(suricat, true);
//             database.query( 'INSERT INTO `suricat` SET ?', suricat).then(function (response) {
//               if(err){
//                 sleepMode = true;
//                 errorMessage = err.code;
//               }
//             });
//           }
//        }else{
//           sleepMode = true;
//           errorMessage = "Missing mandatory fields at line " + (count+1) + ". The batch stop the process.";
//        }
//      }
//      count++;
//     })
//     .on("end", function(){
//       fs.unlink(req.file.path, function (err) {
//         if (err) logError('fail delete file : ' + req.file.path, err);
//       });
//       return (sleepMode) ? u.formatResponse(res, u.toFailed("INTERNAL_ERROR", errorMessage, u.HTTP_CODE_500))
//        : u.formatResponse(res, u.toSuccess(null, u.HTTP_CODE_201));
//    });
//   });
// })
// });

router.put('/:id', function(req, res) {
  var request = { email : req.params.id};
  var body = req.body;

  if(!suricatUtils.isValidResource(body)){
    return u.formatResponse(res, u.toFailed("BAD_REQUEST", "Missing mandatory field(s)", u.HTTP_CODE_400));
  }

  body = suricatUtils.cleanValuesBeforeUpdate(body);

  database.query('UPDATE `suricat` SET ? WHERE ?', [body,request]).then(function (response) {
    if(response.affectedRows !== null && response.affectedRows == 0){
      return u.formatResponse(res, u.toFailed("NOT_FOUND", "Resource not found", u.HTTP_CODE_404));
    }
    u.formatResponse(res, u.toSuccess(null, u.HTTP_CODE_200));
  }).catch(function(err){
    logError('err', err);
    return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
  });
});

router.delete('/:id', function(req, res) {
  var request = { email : req.params.id};
  database.query('DELETE FROM `suricat` WHERE ?', request).then(function (response) {
    if(response.affectedRows !== null && response.affectedRows == 0){
      return u.formatResponse(res, u.toFailed("NOT_FOUND", "Resource not found", u.HTTP_CODE_404));
    }
    return u.formatResponse(res, u.toSuccess([], u.HTTP_CODE_204));
  }).catch(function(err){
    logError('err', err);
    return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
  });
});

router.post('/:id/missions', function(req, res) {
  var body = req.body;
  if(!suricatUtils.isValidMission(body)){
    return u.formatResponse(res, u.toFailed("BAD_REQUEST", "Missing mandatory field(s)", u.HTTP_CODE_400));
  }
  var request = { email : req.params.id};
  database.query('SELECT suricat_id FROM `suricat` WHERE ?', request).then(function (response) {
    if(response.length === 0){
      return Promise.reject({code: 'SURICAT_NOT_FOUND'});
    }else{
      body.suricat_id = response[0].suricat_id;
      request = { client_id : body.client_id};
      return database.query('SELECT client_id FROM `client` WHERE ?',request);
    }
  })
  .then(function (response) {
    if(response.length === 0){
      return Promise.reject({code: 'CLIENT_NOT_FOUND'});
    }
    return database.query('INSERT INTO `mission` SET ?', body);
  })
  .then(function (response) {
    return u.formatResponse(res, u.toSuccess(null, u.HTTP_CODE_201));
  }).catch(function(err){
    logError('err', err);
    if(err.code == "ER_DUP_ENTRY"){
      return u.formatResponse(res, u.toFailed("CONFLICT", "Resource already created", u.HTTP_CODE_409));
    }
    if(err.code == "SURICAT_NOT_FOUND"){
      return u.formatResponse(res, u.toFailed("NOT_FOUND", "Resource not found", u.HTTP_CODE_404));
    }
    if(err.code == "CLIENT_NOT_FOUND"){
      return u.formatResponse(res, u.toFailed("NOT_FOUND", "Client resource not found", u.HTTP_CODE_404));
    }
    return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
  })
});

router.get('/:id/missions', function(req, res) {
  var request = { 'suricat.email' : req.params.id};
  database.query('SELECT mission.client_id, mission.status, mission.start_date, mission.end_date, mission.description, client.name as client_name FROM `mission`  JOIN `suricat` ON suricat.suricat_id = mission.suricat_id JOIN `client` ON client.client_id = mission.client_id WHERE ?', request).then(function (response) {
    if(response.length === 0){
      return u.formatResponse(res, u.toFailed("NOT_FOUND", "Resource not found", u.HTTP_CODE_404));
    }
    return u.formatResponse(res, u.toSuccess(response, u.HTTP_CODE_200));
  }).catch(function(err){
    logError('err', err);
    return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
  });
});

module.exports = router;
