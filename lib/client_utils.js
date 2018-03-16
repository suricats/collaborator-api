'use strict';

var client_utils = {
  isValidResource : function (client){
    return (client.name && client.sector_id);
  }
}

module.exports = client_utils;
