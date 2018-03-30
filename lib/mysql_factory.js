'use strict';
var mysql = require('mysql');
var logInfo = require('debug')('app:mysql');

const mysql_factory = {
  config : null,
  connection : function (dbHost, dbUser, dbPassword, dbName, dbPort){
    if(!this.config) {
       this.config = {
          host     : dbHost,
          user     : dbUser,
          password : dbPassword,
          database : dbName,
          port     : dbPort
      };
    }
    return mysql.createConnection(this.config);
  },
  request : function (connection, sqlRequest, params, callback){
    logInfo(`connection.threadId=${connection.threadId}, connection.state=${connection.state}`);
    if((sqlRequest.match(/[?]/g) || []).length > 0){
      return connection.query(sqlRequest, params, function(err, rows, fields){
        callback(err, rows, fields);
      });
    }
    return connection.query(sqlRequest, function(err, rows, fields){
      callback(err, rows, fields);
    });
  }
}

module.exports = mysql_factory;
