process.env.NODE_ENV = 'test';

const u = require('../../lib/utils.js');
const config = require("../../config.js");
const proxyquire =  require('proxyquire')
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

const res = {
  status : function status(code) {
    this.statusCode = code;
    return this;
  },
  send : function send(body){
    this.body = body;
    return this;
  },
  setHeader : function setHeader(headerNames, setHeader){
    this.header = setHeader;
    return this;
  }
};

describe('utils.js test', () => {
  describe('getStatusWithoutBody()', () => {
    it('should return an array of two objects [201, 204]', (done) => {
      const status = u.getStatusWithoutBody();
      status.should.have.lengthOf(2);
      status[0].should.eql(201);
      status[1].should.eql(204);
      done();
    });
  });
  describe('toSuccess()', () => {
    it('should return an expected object', (done) => {
      const body = [
        {"foo": "bar", "bar" : "foo"},
        {"foo": "foo", "bar" : "bar"},
      ];
      const success = u.toSuccess(body,u.HTTP_CODE_200);
      success.should.be.a('object');
      success.type.should.eql('success');
      success.status.should.eql(200);
      success.body.should.eql(body);
      done();
    });
  });

  describe('toFailed()', () => {
    it('should return an expected object', (done) => {
      const code = "BAD_REQUEST",
      message = "";
      const failed = u.toFailed(code, message, u.HTTP_CODE_400);
      failed.should.be.a('object');
      failed.type.should.eql('failed');
      failed.status.should.eql(400);
      failed.code.should.eql(code);
      failed.message.should.eql(message);
      done();
    });
  });

  describe('formatResponse()', () => {
    it('should return status 201 without body', (done) => {
      const body = [
        {"foo": "bar", "bar" : "foo"},
        {"foo": "foo", "bar" : "bar"},
      ];
      const elem = u.toSuccess(body, u.HTTP_CODE_201);
      const response = u.formatResponse(res, elem);
      response.should.be.a('object');
      response.statusCode.should.eql(201);
      should.not.exist(response.body);
      done();
    });

    it('should return status 204 without body', (done) => {
      const body = [
        {"foo": "bar", "bar" : "foo"},
        {"foo": "foo", "bar" : "bar"},
      ];
      const elem = u.toSuccess(body, u.HTTP_CODE_204);
      const response = u.formatResponse(res, elem);
      response.should.be.a('object');
      response.statusCode.should.eql(204);
      should.not.exist(response.body);
      done();
    });

    it('should return status 200 with body', (done) => {
      const body = [
        {"foo": "bar", "bar" : "foo"},
        {"foo": "foo", "bar" : "bar"},
      ];
      const elem = u.toSuccess(body, u.HTTP_CODE_200);
      const response = u.formatResponse(res, elem);
      response.should.be.a('object');
      response.statusCode.should.eql(200);
      response.body.meta.status.should.eql('success');
      response.body.data.should.eql(body);
      done();
    });

    it('should return status 500 with body', (done) => {
      const code = "INTERNAL_ERROR";
      const message = "Try the service later...";
      const elem = u.toFailed(code, message, u.HTTP_CODE_500);
      const response = u.formatResponse(res, elem);
      response.should.be.a('object');
      response.statusCode.should.eql(500);
      response.body.meta.status.should.eql("failed");
      response.body.meta.message.code.should.eql(code);
      response.body.meta.message.text.should.eql(message);
      response.body.meta.message.level.should.eql("error");
      should.not.exist(response.body.data);
      done();
    });

    it('should return an exception if the elem.type is not (success, failed)', (done) => {
      const elem = {"type": "fakeType"};
      (function() {
        u.formatResponse(res, elem);
      }).should.throw(Error, 'Invalid message type');
      done();
    });
  });

  describe('HTTP_CODE', () => {
    it('should return expected HTTP_CODE values and the expected count (10)', (done) => {
      const httpCodes = {
        HTTP_CODE_200 : u.HTTP_CODE_200,
        HTTP_CODE_201 : u.HTTP_CODE_201,
        HTTP_CODE_204 : u.HTTP_CODE_204,
        HTTP_CODE_400 : u.HTTP_CODE_400,
        HTTP_CODE_401 : u.HTTP_CODE_401,
        HTTP_CODE_403 : u.HTTP_CODE_403,
        HTTP_CODE_404 : u.HTTP_CODE_404,
        HTTP_CODE_409 : u.HTTP_CODE_409,
        HTTP_CODE_500 : u.HTTP_CODE_500,
        HTTP_CODE_502 : u.HTTP_CODE_502
      };
      const httpCodeSize = Object.keys(httpCodes).length;
      httpCodes.HTTP_CODE_200.should.eql(200);
      httpCodes.HTTP_CODE_201.should.eql(201);
      httpCodes.HTTP_CODE_204.should.eql(204);
      httpCodes.HTTP_CODE_400.should.eql(400);
      httpCodes.HTTP_CODE_401.should.eql(401);
      httpCodes.HTTP_CODE_403.should.eql(403);
      httpCodes.HTTP_CODE_404.should.eql(404);
      httpCodes.HTTP_CODE_409.should.eql(409);
      httpCodes.HTTP_CODE_500.should.eql(500);
      httpCodes.HTTP_CODE_502.should.eql(502);
      httpCodeSize.should.eql(10);
      done();
    });
  });

  describe('checkAuth()', () => {
    it('should return an unaltered response object', (done) => {
      const utils = proxyquire('../../lib/utils', {
        '../config': { authToken: "secret" }
      });
      const req = {token : "secret"};
      const response = utils.checkAuth(req, res, () => {});
      should.not.exist(response);
      done();
    });

    it('should return a status 401 if the token header is absent', (done) => {
      const utils = proxyquire('../../lib/utils', {
        '../config': { authToken: "secret" }
      });
      const req = {};
      const response = utils.checkAuth(req, res, () => {});
      response.should.be.a('object');
      response.statusCode.should.eql(401);
      done();
    });

    it('should return a status 403 if the token header is incorrect', (done) => {
      const utils = proxyquire('../../lib/utils', {
        '../config': { authToken: "secret" }
      });
      const req = {token : "wrong secret"};
      const response = utils.checkAuth(req, res, () => {});
      response.should.be.a('object');
      response.statusCode.should.eql(403);
      done();
    });
  });

});
