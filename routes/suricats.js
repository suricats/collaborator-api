'use strict';
// MODULES IMPORT

var config = require('../config.js');
var multer  = require('multer');
var csv = require("fast-csv");
var fs = require('fs');
var u = require('../lib/utils');
var collabUtils = require("../lib/collaborateur_utils");
var tirosuriUtils = require("../lib/tirosuri_utils");
var mysqlFactory = require("../lib/mysql_factory");

// SET UPLOAD PROPERTIES
var maxFileSize = (config.maxFileSize) ? config.maxFileSize : 10000; // in bytes
var fileUploadPath = (config.fileUploadPath) ? config.fileUploadPath : '/tmp/uploads/';
var upload = multer({ dest: fileUploadPath, limits: { fileSize: maxFileSize } });

// DATABASE CONNECTION
var connection = mysqlFactory.connection(config.dbHost, config.dbUser, config.dbPassword, config.dbName, config.dbPort);

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
  mysqlFactory.request(connection, 'SELECT * FROM `collaborateur`', null, function(err, rows, fields){
    if(err) {
      console.log('err', err);
      return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
    }
    return u.formatResponse(res, u.toSuccess(rows, u.HTTP_CODE_200));
  });
});

router.get('/:id', function(req, res) {
  var request = { email : req.params.id};
  mysqlFactory.request(connection, 'SELECT * FROM `collaborateur` WHERE ?', request, function(err, rows, fields){
    if(err) {
      console.log('err', err);
      return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
    }
    if(rows.length === 0){
      return u.formatResponse(res, u.toFailed("NOT_FOUND", "Resource not found", u.HTTP_CODE_404));
    }
    return u.formatResponse(res, u.toSuccess(rows[0], u.HTTP_CODE_200));
  });
});

router.post('/', function(req, res) {
  var body = req.body;
  if(!collabUtils.isValidResource(body)){
    return u.formatResponse(res, u.toFailed("BAD_REQUEST", "Missing mandatory field(s)", u.HTTP_CODE_400));
  }
  body = collabUtils.setDefaultValues(body);
  mysqlFactory.request(connection, 'INSERT INTO `collaborateur` SET ?', body, function(err, rows, fields){
    if(err) {
      console.log('err', err);
      return res.status(500).send({"status" : "Error", "text" : "missing mandatory fields"});
    }
    body.id = rows.insertId;
    return u.formatResponse(res, u.toSuccess([], u.HTTP_CODE_201));
  });
});

router.post('/import', function(req, res) {
  upload.single('annuaire')(req, res, function (err) {
  if (err) {
    console.info('err', err);
    return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
  }

  mysqlFactory.request(connection, 'DELETE FROM `collaborateur`', null, function(err, rows){
    if(err) {
      console.info(err);
      return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
    }
    var referentiel = [];
    var first = true;
    var sleepMode = false;
    var errorMessage = "";
    var count = 0;

    var stream = fs.createReadStream(req.file.path);
    csv.fromStream(stream, {delimiter : ";"})
    .on("data", function(line){
     if(first){
       line.forEach(function(element, index){
         var ressourceName = collabUtils.getRessourceName(element);
         if(ressourceName){
           referentiel[index] = ressourceName;
         }
       });
       first = false;
     }
     else{
       var collaborateur = {};
       line.forEach(function(element, index){
         collaborateur[referentiel[index]] = element;
       });
       //console.info('**** curent collaborateur ****', collaborateur);
       if(collabUtils.isValidResource(collaborateur)){
          if(!sleepMode){
            collaborateur = collabUtils.setDefaultValues(collaborateur, true);
            mysqlFactory.request(connection, 'INSERT INTO collaborateur SET ?', collaborateur, function(err,rows){
              if(err){
                //console.info('**** erreur insert ****', err);
                sleepMode = true;
                errorMessage = err.code;
              }
            });
          }
       }else{
          //console.info('**** curent collab invalid ****');
          sleepMode = true;
          errorMessage = "Missing mandatory fields at line " + (count+1) + ". The batch stop the process.";
       }
     }
     count++;
    })
    .on("end", function(){
      fs.unlink(req.file.path, function (err) {
        if (err) console.log('fail delete file : ' + req.file.path, err);
      });
      return (sleepMode) ? u.formatResponse(res, u.toFailed("INTERNAL_ERROR", errorMessage, u.HTTP_CODE_500))
       : u.formatResponse(res, u.toSuccess([], u.HTTP_CODE_201));
   });
  });
})
});

router.put('/:id', function(req, res) {
  var request = { email : req.params.id};
  var body = req.body;

  if(!collabUtils.isValidResource(body)){
    return u.formatResponse(res, u.toFailed("BAD_REQUEST", "Missing mandatory field(s)", u.HTTP_CODE_400));
  }

  body = collabUtils.cleanValuesBeforeUpdate(body);

  mysqlFactory.request(connection, 'UPDATE `collaborateur` SET ? WHERE ?', [body,request], function(err,rows){
    if(err) {
      console.log('err', err);
      return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
    }

    if(rows.affectedRows !== null && rows.affectedRows == 0){
      return u.formatResponse(res, u.toFailed("NOT_FOUND", "Resource not found", u.HTTP_CODE_404));
    }
    u.formatResponse(res, u.toSuccess([], u.HTTP_CODE_200));
  });
});

router.delete('/:id', function(req, res) {
  var request = { email : req.params.id};
  mysqlFactory.request(connection, 'DELETE FROM `collaborateur` WHERE ?', request, function(err,rows){
    if(err) {
      return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
    }
    if(rows.affectedRows !== null && rows.affectedRows == 0){
      return u.formatResponse(res, u.toFailed("NOT_FOUND", "Resource not found", u.HTTP_CODE_404));
    }
    return u.formatResponse(res, u.toSuccess([], u.HTTP_CODE_204));
  });
});

router.get('/:id/tirosuris', function(req, res) {
  var request = { email : req.params.id};
  mysqlFactory.request(connection, 'SELECT `id` FROM `collaborateur` WHERE ?', request, function(err, rows, fields){
    if(err) {
      return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
    }
    if(rows.length === 0){
      return u.formatResponse(res, u.toFailed("NOT_FOUND", "Resource not found", u.HTTP_CODE_404));
    }
    mysqlFactory.request(connection, 'SELECT * FROM `tirosuri` WHERE ? OR ? OR ?', [{id_collab_1 : rows[0].id}, {id_collab_2 : rows[0].id}, {id_collab_3 : rows[0].id}], function(err, rows, fields){
      if(err) {
        return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
      }
      return u.formatResponse(res, u.toSuccess(rows, u.HTTP_CODE_201));
    });
  });
});

router.post('/:id/tirosuris', function(req, res) {
  var body = req.body;
  if(!body.target_suricat_id){
      return u.formatResponse(res, u.toFailed("BAD_REQUEST", "Missing mandatory field(s)", u.HTTP_CODE_400));
  }
  var request = { email : req.params.id};
  mysqlFactory.request(connection, 'SELECT `id` FROM `collaborateur` WHERE ?', request, function(err, rows, fields){
    if(err) {
      return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
    }
    if(rows.length === 0){
      return u.formatResponse(res, u.toFailed("NOT_FOUND", "Resource not found", u.HTTP_CODE_404));
    }
    var tirosuri = {};
    tirosuri.id_collab_1 = rows[0].id;
    //TODO check the existance of id_collab_2 in DB;
    tirosuri.id_collab_2 = body.target_suricat_id;
    tirosuri = tirosuriUtils.setDefaultValues(tirosuri);
    mysqlFactory.request(connection, 'INSERT INTO `tirosuri` SET ?', tirosuri, function(err, rows, fields){
      if(err) {
        return u.formatResponse(res, u.toFailed(err.code, "Error with the database", u.HTTP_CODE_500));
      }
      return u.formatResponse(res, u.toSuccess([], u.HTTP_CODE_201));
    });
  });
});

module.exports = router;
