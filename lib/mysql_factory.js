'use strict';

var mysql_factory = {
  connection : function (){},
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
