'use strict';
// MODULES IMPORT
var config = require('../config.js');
var moment = require('moment');
var tirosuriUtils = require('../lib/tirosuri_utils.js');
var Database = require('../lib/database.js');

//Database connection
var dbConfig = {
  host     : config.dbHost,
  user     : config.dbUser,
  password : config.dbPassword,
  database : config.dbName,
  port     : config.dbPort
};

var database = new Database(dbConfig);

var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
  let suricats, suricats_id = [];
  database.query( 'SELECT `id`, `email` FROM `collaborateur`' ).then( rows => {
    suricats = rows;
    let promises = rows.map(function (row) {
       suricats_id.push(row.id);
       return database.query('SELECT * FROM `tirosuri` WHERE ? OR ? OR ?', [{id_collab_1 : row.id}, {id_collab_2 : row.id}, {id_collab_3 : row.id}]);
    });
    return Promise.all(promises);
  }).then(tirosuris => {
    for (var i = 0, len = suricats.length; i < len; i++) {
      suricats[i].suricats_met_in_the_past = tirosuriUtils.getSuricatsId(tirosuris[i], suricats[i].id);
    }

    //TODO faire l'algo d'attribution des couples tirosuri
    let new_tirosuri = [], retry = 10, try_count = 0, match = false;
    while (try_count < retry && !match){
      new_tirosuri = [];
      for (var i = 0, len = suricats.length; i < len; i++) {
        if(getFlatNewTirosuri(new_tirosuri).includes(suricats[i].id)){
          continue;
        }
        let ids_to_exclude = suricats[i].suricats_met_in_the_past.concat(getFlatNewTirosuri(new_tirosuri));
        ids_to_exclude.push(suricats[i].id);
        var ids_to_include = suricats_id.filter(function(suricat_id){
            return !ids_to_exclude.includes(suricat_id);
        });
        if(ids_to_include.length > 0){
          var random_key = Math.floor(Math.random() * ids_to_include.length);
          new_tirosuri.push([suricats[i].id, ids_to_include[random_key]]);
        }else if(!suricats_id.length % 2 === 0 && new_tirosuri.length > 0){
          var random_key = Math.floor(Math.random() * new_tirosuri.length);
          var random_item = new_tirosuri[random_key];
          random_item.push(suricats[i].id);
          new_tirosuri[random_key] = random_item;
        }else{
          console.log("**** WARNING AUCUN TIROSURI SELECTIONNE POUR " + suricats[i].email + " ****");
        }
      }
      var max_entries = (suricats_id.length % 2 === 0) ? suricats_id.length/2 : (suricats_id.length - 1)/2;
      if(new_tirosuri.length === max_entries){
          match = true;
      }
      ++try_count;
    }
    if(!match){
      return res.status(500).send({"status" : "Error", "code" : "NO_MATCH", "text" : ""});
    }
    let requests = [], now = moment().format();
    new_tirosuri.forEach(function (tirosuri) {
      requests.push([tirosuri[0], tirosuri[1], (tirosuri.length > 2) ? tirosuri[2] : null, now]);
    });
    // console.info('**** suricats ****', suricats);
    // console.info('**** suricats_id ****', suricats_id);
    // console.info('**** new_tirosuri ****', new_tirosuri);
    database.query('INSERT INTO `tirosuri` (id_collab_1,id_collab_2,id_collab_3,date) VALUES ?', [requests]).then(function (response, err) {
      if(err) {
        return res.status(500).send({"status" : "Error", "code" : 500, "text" : err.code});
      }
      return res.json({"status" : "Success"});
    });
  })
});

function getFlatNewTirosuri(new_tirosuri){
  return new_tirosuri.reduce(function(a, b) {return a.concat(b);}, []);
}

module.exports = router;
