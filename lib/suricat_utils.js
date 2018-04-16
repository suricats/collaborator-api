'use strict';
var moment = require('moment');

var suricat_utils = {
  isValidResource : function (collaborateur){
    return (collaborateur.name && collaborateur.firstname && collaborateur.email);
  },
  setDefaultValues : function (collaborateur, isImport){
    var now = moment().format('YYYY-MM-DD HH:mm:ss');
    collaborateur.creation_date = (isImport === null) ? now : (collaborateur.creation_date) ? (collaborateur.creation_date) : now;
    collaborateur.last_update =  (isImport === null) ? now : (collaborateur.last_update) ? (collaborateur.last_update) : now;
    collaborateur.status = (collaborateur.status) ? collaborateur.status : 'intern';
    collaborateur.birthdate = (collaborateur.birthdate && collaborateur.birthdate != '') ? collaborateur.birthdate : null;
    collaborateur.slack_username = (collaborateur.slack_username && collaborateur.slack_username != '') ? collaborateur.slack_username : null;
    return collaborateur;
  },
  cleanValuesBeforeUpdate : function (collaborateur){
    delete collaborateur.creation_date;
    delete collaborateur.id;
    delete collaborateur.email;
    collaborateur.last_update = moment().format('YYYY-MM-DD HH:mm:ss');
    return collaborateur;
  },
  isValidMission : function (mission){
    return (mission.client_id && mission.status && ['ACTIVE', 'FINISHED', 'PAUSE'].includes(mission.status));
  },
  getRessourceName : function (value){
    var ressourceName = '';
    switch (value) {
      case 'NOM':
        ressourceName = 'name'
        break;
      case 'PRENOM':
        ressourceName = 'firstname'
        break;
      case 'MAIL':
        ressourceName = 'email'
        break;
      case 'DATE_NAISSANCE':
        ressourceName = 'birthdate'
        break;
      case 'STATUS':
        ressourceName = 'status'
        break;
      case 'SLACK_USERNAME':
        ressourceName = 'slack_username'
        break;
      case 'TELEPHONE':
        ressourceName = 'phone'
        break;
      case 'LAST_UPDATE':
        ressourceName = 'last_update'
        break;
      case 'CREATION_DATE':
        ressourceName = 'creation_date'
        break;
      default:
        break;
    }
    return ressourceName;
  },
  constructQuery : function (search = null, status = "IN", index = 0, size = 10, order = 'ASC'){
    order = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';
    status = ['IN', 'OUT'].includes(status.toUpperCase()) ? status.toUpperCase() : 'IN';
    //prefix
    var sql =  'SELECT * FROM `suricat` WHERE ';
    //addition of the status
    sql += (status == "*") ? '(status = "IN" OR status = "OUT")' : '`status` = ?';
    //addition of the search if it's needed
    sql += (search) ? ' AND `email` LIKE  "%' + search +'%"' : '';
    //addition of the ORDER BY
    sql += ' ORDER BY `email` ' + order;
    //addition of the LIMIT
    sql += ' LIMIT ?,?';
    const args = [status, parseInt(index), parseInt(size)];
    return {"query": sql, "args" : args};
  }
}

module.exports = suricat_utils;
