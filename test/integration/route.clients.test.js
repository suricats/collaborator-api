process.env.NODE_ENV = 'test';

const sinon = require('sinon');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

var server;
const u = require('../../lib/utils');
const helperDB = require('./_helper');

describe('routes : clients', () => {

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

  describe('GET /v1/clients', () => {
    it('should return all clients', (done) => {
      chai.request(server)
      .get('/v1/clients')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(2);
        res.body.data[0].should.include.keys(
          'client_id', 'name', 'sector_id', 'siren', 'description'
        );
        done();
      });
    });
  });

  describe('GET /v1/clients/:id', () => {

    it('should respond with a single client', (done) => {
      chai.request(server)
      .get('/v1/clients')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(2);
        res.body.data[0].should.include.keys(
          'client_id', 'name', 'sector_id', 'siren', 'description'
        );
        chai.request(server)
        .get(`/v1/clients/${res.body.data[0].client_id}`)
        .end((err1, res1) => {
          should.not.exist(err1);
          res1.status.should.equal(200);
          res1.type.should.equal('application/json');
          res1.body.meta.status.should.eql('success');
          res1.body.data.should.include.keys(
            'client_id', 'name', 'sector_id', 'siren', 'description'
          );
          done();
        });
      });
    });

    it('should throw an error if the client does not exist', (done) => {
      chai.request(server)
      .get('/v1/clients/99999999999')
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

  describe('POST /v1/clients', () => {

    beforeEach(() => {
      return helperDB.cleanDB()
      .then(() => {
        return helperDB.populateDB();
      });
    });
    
    it('should return the client that was added', (done) => {
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
        .post('/v1/clients')
        .send({
          name: 'Fake client',
          sector_id: `${res.body.data[0].sector_id}`,
          siren: '',
          description: ''
        })
        .end((err1, res1) => {
          should.not.exist(err1);
          res1.status.should.equal(201);
          res1.type.should.equal('application/json');
          res1.body.should.equal('');
          done();
        });
      });
    });

    it('should return error 409 if the client already existing', (done) => {
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
        .post('/v1/clients')
        .send({
          name: 'Walmart',
          sector_id: `${res.body.data[0].sector_id}`,
          siren: '',
          description: ''
        })
        .end((err1, res1) => {
          should.not.exist(err1);
          res1.status.should.equal(409);
          res1.type.should.equal('application/json');
          res1.body.meta.status.should.eql('failed');
          res1.body.meta.message.should.include.keys(
            'code', 'level', 'text'
          );
          res1.body.meta.message.code.should.eql('CONFLICT');
          res1.body.meta.message.level.should.eql('error');
          done();
        });
      });
    });

    it('should return error 400 if missing mandatory fields', (done) => {
      chai.request(server)
      .post('/v1/clients')
      .send({
        name: 'Fake client',
        siren: 'test',
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

    it('should return error 404 if the sector_id does not exist', (done) => {
      chai.request(server)
      .post('/v1/clients')
      .send({
        name: 'Fake client',
        sector_id: 99999999999,
        siren: 'test',
        description: 'test'
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
        done();
      });
    });

  });

  describe('PUT /v1/clients/:id', () => {
    beforeEach(() => {
      return helperDB.cleanDB()
      .then(() => {
        return helperDB.populateDB();
      });
    });

    it('should update a single client', (done) => {
      chai.request(server)
      .get('/v1/clients')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(2);
        res.body.data[0].should.include.keys(
          'client_id', 'name', 'sector_id', 'siren', 'description'
        );
        chai.request(server)
        .put(`/v1/clients/${res.body.data[0].client_id}`)
        .send({
          name: 'Walmart',
          sector_id: `${res.body.data[0].sector_id}`,
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

    it('should throw error 404 if the sector_id does not exist', (done) => {
      chai.request(server)
      .get('/v1/clients')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(2);
        res.body.data[0].should.include.keys(
          'client_id', 'name', 'sector_id', 'siren', 'description'
        );
        chai.request(server)
        .put(`/v1/clients/${res.body.data[0].client_id}`)
        .send({
          name: 'Walmart',
          sector_id: 99999999999,
          description: 'update the description'
        })
        .end((err1, res1) => {
          should.not.exist(err);
          res1.status.should.equal(404);
          res1.type.should.equal('application/json');
          res1.body.meta.status.should.eql('failed');
          res1.body.meta.message.should.include.keys(
            'code', 'level', 'text'
          );
          res1.body.meta.message.code.should.eql('NOT_FOUND');
          res1.body.meta.message.level.should.eql('error');
          done();
        });
      });
    });

    it('should throw an error if there is missing field(s)', (done) => {
      chai.request(server)
      .get('/v1/clients')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(2);
        res.body.data[0].should.include.keys(
          'client_id', 'name', 'sector_id', 'siren', 'description'
        );
        chai.request(server)
        .put(`/v1/clients/${res.body.data[0].client_id}`)
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

    it('should throw an error if the client does not exist', (done) => {
      chai.request(server)
      .put('/v1/clients/99999999999')
      .send({
        name: 'Fake client',
        sector_id: 99999999999,
        siren: '',
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
