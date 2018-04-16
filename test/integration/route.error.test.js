process.env.NODE_ENV = 'test';

const sinon = require('sinon');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

var server;
const u = require('../../lib/utils');

describe('routes : non-existing routes ', () => {

  before(() => {
    this.checkAuth = sinon.stub(u, 'checkAuth').callsFake(function(req, res, next) {
        return next();
    });
    server = require('../../app');
    return Promise.resolve(true);
  });

  afterEach(() => {
    this.checkAuth.restore();
  });

  it('should return an error 404', (done) => {
    chai.request(server)
    .get('/v1/wrong-uri')
    .end((err, res) => {
      should.not.exist(err);
      res.status.should.equal(404);
      res.type.should.equal('application/json');
      res.body.meta.status.should.eql('failed');
      res.body.meta.message.should.include.keys(
        'code', 'level', 'text'
      );
      res.body.meta.message.code.should.eql('NOT_FOUND');
      res.body.meta.message.level.should.eql('error');
      should.not.exist(res.body.data);
      done();
    });
  });

});
