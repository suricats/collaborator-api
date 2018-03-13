'use strict';
var moment = require('moment');

var collab_utils = {
  isValidResource : function (collaborateur){
    return (collaborateur.name && collaborateur.firstname && collaborateur.email);
  },
  setDefaultValues : function (collaborateur, isImport){
    var now = moment().format();
    collaborateur.creationDate = (isImport === null) ? now : (collaborateur.creationDate) ? (collaborateur.creationDate) : now;
    collaborateur.lastUpdate =  (isImport === null) ? now : (collaborateur.lastUpdate) ? (collaborateur.lastUpdate) : now;
    collaborateur.status = (collaborateur.status) ? collaborateur.status : 'IN';
    return collaborateur;
  },
  cleanValuesBeforeUpdate : function (collaborateur){
    delete collaborateur.creationDate;
    delete collaborateur.id;
    delete collaborateur.email;
    collaborateur.lastUpdate = moment().format();
    return collaborateur;
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
        ressourceName = 'birthDate'
        break;
      case 'STATUS':
        ressourceName = 'status'
        break;
      case 'SLACK_USERNAME':
        ressourceName = 'slackLogin'
        break;
      case 'TELEPHONE':
        ressourceName = 'phone'
        break;
      case 'LAST_UPDATE':
        ressourceName = 'lastUpdate'
        break;
      case 'CREATION_DATE':
        ressourceName = 'creationDate'
        break;
      default:
        break;
    }
    return ressourceName;
  }
}

module.exports = collab_utils;
