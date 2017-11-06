'use strict';
var moment = require('moment');

var tirosuri_utils = {
  isValidResource : function (tirosuri){
    return (tirosuri.id_collab_1 && tirosuri.id_collab_2);
  },
  setDefaultValues : function (tirosuri){
    var now = moment().format();
    tirosuri.date = now;
    return tirosuri;
  },
  getSuricatsId : function (tirosuris, suricat_id){
    var ids = [];
    if(tirosuris.length > 0){
      tirosuris.forEach(function (tirosuri) {
        if(tirosuri.id_collab_1 !== suricat_id){
          ids.push(tirosuri.id_collab_1);
        }
        if(tirosuri.id_collab_2 !== suricat_id){
          ids.push(tirosuri.id_collab_2);
        }
        if(tirosuri.id_collab_3 !== null && tirosuri.id_collab_3  !== suricat_id){
          ids.push(tirosuri.id_collab_3);
        }
      });
    }
    return ids;
  }
}
module.exports = tirosuri_utils;
