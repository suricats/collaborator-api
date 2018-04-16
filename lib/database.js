'use strict';
const dbConfig = require( './database_config' );
const logInfo = require('debug')('app:info');
const logError = require('debug')('app:error');
const databaseFactory = require( './database_factory' );

const database = new databaseFactory(dbConfig);
database.connection.connect(function(err){
if(!err) {
    logInfo("Database is connected ... nn");
} else {
    logInfo("Error connecting database ... nn");
}
});
module.exports = database;
