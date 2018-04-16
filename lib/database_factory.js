'use strict';

const logInfo = require('debug')('app:info');
const mysql = require( 'mysql' );
class Database {
    constructor( config ) {
        this.connection = mysql.createConnection( config );
    }
    query( sql, args = '') {
      logInfo(`connection.threadId=${this.connection.threadId}, connection.state=${this.connection.state}`);
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
}
module.exports = Database;
