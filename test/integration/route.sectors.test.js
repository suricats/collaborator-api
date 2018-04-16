process.env.NODE_ENV = 'test';

const sinon = require('sinon');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

var server;
const u = require('../../lib/utils');
const helperDB = require('./_helper');

describe('routes : sectors', () => {

  before(() => {
    this.checkAuth = sinon.stub(u, 'checkAuth').callsFake(function(req, res, next) {
        return next();
    });
    server = require('../../app');
    return helperDB.cleanDB()
    .then(() => {
      return helperDB.populateDB();
    });
  });

  afterEach(() => {
    this.checkAuth.restore();
  });

  describe('GET /v1/sectors', () => {
    it('should return all sectors', (done) => {
      chai.request(server)
      .get('/v1/sectors')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(2);
        res.body.data[0].should.include.keys(
          'sector_id', 'name', 'description'
        );
        done();
      });
    });
  });

  describe('GET /v1/sectors/:id', () => {
    it('should respond with a single sector', (done) => {
      chai.request(server)
      .get('/v1/sectors')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(2);
        res.body.data[0].should.include.keys(
          'sector_id', 'name', 'description'
        );
        chai.request(server)
        .get(`/v1/sectors/${res.body.data[0].sector_id}`)
        .end((err1, res1) => {
          should.not.exist(err1);
          res1.status.should.equal(200);
          res1.type.should.equal('application/json');
          res1.body.meta.status.should.eql('success');
          res1.body.data.should.include.keys(
            'sector_id', 'name', 'description'
          );
          done();
        });
      });
    });

    it('should throw an error if the sector does not exist', (done) => {
      chai.request(server)
      .get('/v1/sectors/99999999999')
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

  describe('POST /v1/sectors', () => {
    it('should return the sector that was added', (done) => {
      chai.request(server)
      .post('/v1/sectors')
      .send({
        name: 'Santé',
        description: ''
      })
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(201);
        res.type.should.equal('application/json');
        res.body.should.equal('');
        done();
      });
    });

    it('should return error 409 if sector already existing', (done) => {
      chai.request(server)
      .post('/v1/sectors')
      .send({
        name: 'Retail',
        description: ''
      })
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(409);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('failed');
        res.body.meta.message.should.include.keys(
          'code', 'level', 'text'
        );
        res.body.meta.message.code.should.eql('CONFLICT');
        res.body.meta.message.level.should.eql('error');
        done();
      });
    });

    it('should return error 400 if missing mandatory fields', (done) => {
      chai.request(server)
      .post('/v1/sectors')
      .send({
        description: 'test'
      })
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(400);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('failed');
        res.body.meta.message.should.include.keys(
          'code', 'level', 'text'
        );
        res.body.meta.message.code.should.eql('BAD_REQUEST');
        res.body.meta.message.level.should.eql('error');
        done();
      });
    });

  });

  describe('PUT /v1/sectors/:id', () => {
    beforeEach(() => {
      return helperDB.cleanDB()
      .then(() => {
        return helperDB.populateDB();
      });
    });

    it('should update a single sector', (done) => {
      chai.request(server)
      .get('/v1/sectors')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(2);
        res.body.data[0].should.include.keys(
          'sector_id', 'name', 'description'
        );
        chai.request(server)
        .put(`/v1/sectors/${res.body.data[0].sector_id}`)
        .send({
          name: 'Retail',
          description: 'update the description'
        })
        .end((err1, res1) => {
          should.not.exist(err1);
          res1.status.should.equal(200);
          res1.type.should.equal('application/json');
          res1.body.meta.status.should.eql('success');
          should.not.exist(res1.body.data);
          done();
        });
      });
    });

    it('should throw an error if there is missing field(s)', (done) => {
      chai.request(server)
      .get('/v1/sectors')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(2);
        res.body.data[0].should.include.keys(
          'sector_id', 'name', 'description'
        );
        chai.request(server)
        .put(`/v1/sectors/${res.body.data[0].sector_id}`)
        .send({
          description: 'update the description'
        })
        .end((err1, res1) => {
          should.not.exist(err);
          res1.status.should.equal(400);
          res1.type.should.equal('application/json');
          res1.body.meta.status.should.eql('failed');
          res1.body.meta.message.should.include.keys(
            'code', 'level', 'text'
          );
          res1.body.meta.message.code.should.eql('BAD_REQUEST');
          res1.body.meta.message.level.should.eql('error');
          done();
        });
      });
    });

    it('should throw an error if the sector does not exist', (done) => {
      chai.request(server)
      .put('/v1/sectors/99999999999')
      .send({
        name: 'Fake sector',
        description: ''
      })
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

});
