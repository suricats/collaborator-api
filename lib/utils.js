'use strict';

const config = require("../config.js");

var u = {
  toSuccess: function toSuccess(body, status) {
    return { type: 'success', status: status, body: body };
  },
  toFailed: function toFailed(code, message, status) {
    return { type: 'failed', status: status, code: code, message: message};
  },
  random: function random(array) {
    return array[Math.floor(Math.random() * array.length)];
  },
  formatResponse: function formatResponse(session, elem) {
    let response;
    switch (elem.type) {
      case "success":
        response = {"meta": {"status" : elem.type}, "data" : elem.body};
        break;
      case "failed":
        response = {"meta": {"status" : elem.type, "message" : {"code" : elem.code, "level" : "error", "text" : elem.message} }};
        break;
      default:
        throw new Error('Invalid message type');
    }
    session.setHeader('Content-Type', 'application/json');
    return (!this.getStatusWithoutBody().includes(elem.status)) ? session.status(elem.status).send(response)
     : session.status(elem.status).send();
  },
  checkAuth : function(req, res, next) {
    if(!req.token) {
      return res.status(401).send();
    }
    if(req.token != config.authToken){
      return res.status(403).send();
    }
  	next();
  },
  getStatusWithoutBody: function (){
    return [this.HTTP_CODE_201, this.HTTP_CODE_204];
  },
  HTTP_CODE_200: 200,
  HTTP_CODE_201: 201,
  HTTP_CODE_204: 204,
  HTTP_CODE_400: 400,
  HTTP_CODE_401: 401,
  HTTP_CODE_403: 403,
  HTTP_CODE_404: 404,
  HTTP_CODE_409: 409,
  HTTP_CODE_500: 500,
  HTTP_CODE_502: 502
};

module.exports = u;
