process.env.NODE_ENV = 'test';

const database = require('../../lib/database.js');
const config = require('../../config.js');
const moment = require('moment');

const helper = {
  cleanDB : async function cleanDB(){
    let tables = ['mission', 'client', 'sector', 'suricat'];
    let promises = tables.map(function (table) {
      return database.query('DELETE FROM ' + table);
    });
    return Promise.all(promises);
  },
  populateDB : async function populateDB(){
    var now = moment().format('YYYY-MM-DD HH:mm:ss');
    var referential = {
      "suricat" : {
        'John': {},
        'Marcel' : {},
        'Julie' : {}
      },
      "sector" : {
        'Retail': {},
        'Banque' : {}
      },
      "client" : {
        'Walmart': {},
        'ING' : {}
      }
    };
    let suricats = [
      ['John', 'Doe', '0610352554', 'john.doe@suricats-consulting.com', 'IN', now, now, '1900-01-01', 'intern'],
      ['Marcel', 'Henry', '0687637609', 'marcel.henry@suricats-consulting.com', 'OUT', now, now, null, 'service_provider'],
      ['Julie', 'Duras', '0686735547', 'julie.duras@suricats-consulting.com', 'IN', now, now, null, 'trainee']
    ];
    let query = 'INSERT INTO `suricat` (firstname, name, phone, email, status, last_update, creation_date, birthdate, profile) VALUES ?';
    return database.query(query, [suricats]).then(function (response) {
      referential.suricat['John'].id = response.insertId;
      referential.suricat['Marcel'].id = response.insertId + 1;
      referential.suricat['Julie'].id = response.insertId + 2;
      let sectors = [
        ['Retail'],
        ['Banque']
      ];
      query = 'INSERT INTO `sector` (name) VALUES ?';
      return database.query(query, [sectors]);
    }).then(function (response){
      referential.sector['Retail'].id = response.insertId;
      referential.sector['Banque'].id = response.insertId + 1;
      query = 'INSERT INTO `client` (name, sector_id) VALUES ?';
      let clients = [
        ['Walmart', referential.sector['Retail'].id],
        ['ING', referential.sector['Banque'].id]
      ];
      return database.query(query, [clients]);
    })
    .then(function (response){
      referential.client['Walmart'].id = response.insertId;
      referential.client['ING'].id = response.insertId + 1;
      let missions = [
        [referential.suricat['John'].id, referential.client['Walmart'].id, now, 'ACTIVE'],
        [referential.suricat['Julie'].id, referential.client['ING'].id, now, 'INACTIVE']
      ];
      query = 'INSERT INTO `mission` (suricat_id, client_id, start_date, status) VALUES ?';
      return database.query(query, [missions]);
    })
    .catch(function(err){
      return Promise.reject(err);
    });
  }
};
module.exports = helper;
