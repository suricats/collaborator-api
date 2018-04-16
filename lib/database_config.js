'use strict';

const config = require("../config.js");
var database_config;

switch (process.env.NODE_ENV) {
  case 'test':
    database_config = {
      host     : 'localhost',
      user     : 'suricatUser',
      password : '1234',
      database : 'suricats_db_test',
      port     : 3306
    };
    break;
  case 'development':
    database_config = {
      host     : (config.dbHost) ? config.dbHost : 'localhost',
      user     : (config.dbUser) ? config.dbUser : 'suricatUser',
      password : (config.dbPassword) ? config.dbPassword : '1234',
      database : (config.dbName) ? config.dbName : 'suricats_db_dev',
      port     : (config.dbPort) ? config.dbPort : 3306
    };
    break;
  default:
    database_config = {
      host     : config.dbHost,
      user     : config.dbUser,
      password : config.dbPassword,
      database : config.dbName,
      port     : config.dbPort
    };
}

module.exports = database_config;
