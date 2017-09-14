'use strict';
// MODULES IMPORT
var config = require('../config.js');
var multer  = require('multer');
var maxFileSize = (config.maxFileSize) ? config.maxFileSize : 10000; // The size is in bytes
var fileUploadPath = (config.fileUploadPath) ? config.fileUploadPath : '/tmp/uploads/';
var upload = multer({ dest: fileUploadPath, limits: { fileSize: maxFileSize } });
var csv = require("fast-csv");
var fs = require('fs');
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
  mysqlFactory.request(connection, 'SELECT * FROM `collaborateur`', null, function(err, rows, fields){
    if(err) {
      console.log('err', err);
      return res.status(500).send({"status" : "Error", "code" : 500, "text" : err.code});
    }
    res.json(rows);
  });
});

router.get('/:id', function(req, res) {
  var request = { email : req.params.id};
  mysqlFactory.request(connection, 'SELECT * FROM `collaborateur` WHERE ?', request, function(err, rows, fields){
    if(err) {
      console.log('err', err);
      return res.status(500).send({"status" : "Error", "code" : 500, "text" : err.code});
    }
    if(rows.length === 0){
      res.status(404).send({});
      return;
    }
    res.json(rows[0]);
  });
});

router.post('/', function(req, res) {
  var body = req.body;
  if(!collabUtils.isValidCollaborateur(body)){
    return res.status(500).send({"status" : "Error", "text" : "missing mandatory fields"});
  }
  body = collabUtils.setCollaborateurDefaultValues(body);
  mysqlFactory.request(connection, 'INSERT INTO `collaborateur` SET ?', body, function(err, rows, fields){
    if(err) {
      console.log('err', err);
      return res.status(500).send({"status" : "Error", "text" : "missing mandatory fields"});
    }
    body.id = rows.insertId;
    res.json(body);
  });
});

router.post('/import', function(req, res) {
  upload.single('annuaire')(req, res, function (err) {
  if (err) {
    console.info('err', err);
    return res.status(500).send({"status" : "Error", "code" : 500, "text" : err.code});
  }

  mysqlFactory.request(connection, 'DELETE FROM `collaborateur`', null, function(err, rows){
    if(err) {
      res.status(500).send({"status" : "Error", "code" : 500, "text" : err.code});
      return;
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
         var ressourceName = collabUtils.getCollaborateurRessourceName(element);
         if(ressourceName !== ''){
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
       if(collabUtils.isValidCollaborateur(collaborateur)){
          if(!sleepMode){
            collaborateur = collabUtils.setCollaborateurDefaultValues(collaborateur, true);
            mysqlFactory.request(connection, 'INSERT INTO collaborateur SET ?', collaborateur, function(err,rows){
              if(err){
                sleepMode = true;
                errorMessage = err.code;
              }
            });
          }
       }else{
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
      return (sleepMode) ? res.status(500).send({"status" : "Error", "code" : 500, "text" : errorMessage })
       : res.json({"status" : "Success"});
   });
  });
})
});

router.put('/:id', function(req, res) {
  var request = { email : req.params.id};
  var body = req.body;
  body.lastUpdate = moment().format();

  mysqlFactory.request(connection, 'UPDATE `collaborateur` SET ? WHERE ?', [body,request], function(err,rows){
    if(err) {
      console.log('err', err);
      return res.status(500).send({"status" : "Error", "code" : 500, "text" : err.code});
    }

    if(rows.affectedRows !== null && rows.affectedRows == 0){
      return res.status(404).send({});
    }
    res.json({"status" : "Success"});
  });
});

router.delete('/:id', function(req, res) {
  var request = { email : req.params.id};

  mysqlFactory.request(connection, 'DELETE FROM `collaborateur` WHERE ?', request, function(err,rows){
    if(err) {
      console.log('err', err);
      return res.status(500).send({"status" : "Error", "code" : 500, "text" : err.code});
    }

    if(rows.affectedRows !== null && rows.affectedRows == 0){
      return res.status(404).send({});
    }
    res.json({"status" : "Success"});
  });
});

module.exports = router;
