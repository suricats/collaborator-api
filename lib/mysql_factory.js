'use strict';
var mysql = require('mysql');

var mysql_factory = {
  connection : function (dbHost, dbUser, dbPassword, dbName, dbPort){
    return mysql.createConnection({
      host     : dbHost,
      user     : dbUser,
      password : dbPassword,
      database : dbName,
      port     : dbPort
    });
  },
  request : function (connection, sqlRequest, params, callback){
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
