process.env.NODE_ENV = 'test';

const sinon = require('sinon');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

var server;
const u = require('../../lib/utils');
const helperDB = require('./_helper');

describe('routes : suricats', () => {

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

  describe('GET /v1/suricats', () => {
    it('should return all suricats', (done) => {
      chai.request(server)
      .get('/v1/suricats')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(3);
        res.body.data[0].should.include.keys(
          'suricat_id', 'name', 'firstname', 'phone', 'last_update', 'email', 'birthdate', 'status', 'profile', 'start_date', 'end_date', 'creation_date', 'slack_username'
        );
        done();
      });
    });
  });

  describe('GET /v1/suricats + SEARCH', () => {
    it('should return only JOHN with search feature', (done) => {
      chai.request(server)
      .get('/v1/suricats')
      .query({search: 'john'})
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(1);
        res.body.data[0].should.include.keys(
          'suricat_id', 'name', 'firstname', 'phone', 'last_update', 'email', 'birthdate', 'status', 'profile', 'start_date', 'end_date', 'creation_date', 'slack_username'
        );
        done();
      });
    });

    it('should return none suricat if the search is not John, Marcel or Julie', (done) => {
      chai.request(server)
      .get('/v1/suricats')
      .query({search: 'mike'})
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(0);
        done();
      });
    });

    it('should return two suricats (John and Julie) if the search is "J"', (done) => {
      chai.request(server)
      .get('/v1/suricats')
      .query({search: 'j'})
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(2);
        res.body.data[0].should.include.keys(
          'suricat_id', 'name', 'firstname', 'phone', 'last_update', 'email', 'birthdate', 'status', 'profile', 'start_date', 'end_date', 'creation_date', 'slack_username'
        );
        done();
      });
    });

    it('should return all suricats if the search value is empty', (done) => {
      chai.request(server)
      .get('/v1/suricats')
      .query({search: ''})
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(3);
        res.body.data[0].should.include.keys(
          'suricat_id', 'name', 'firstname', 'phone', 'last_update', 'email', 'birthdate', 'status', 'profile', 'start_date', 'end_date', 'creation_date', 'slack_username'
        );
        done();
      });
    });
  });


  describe('GET /v1/suricats/:username', () => {

    it('should respond with a single suricat', (done) => {
      chai.request(server)
      .get('/v1/suricats')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(3);
        res.body.data[0].should.include.keys(
          'suricat_id', 'name', 'firstname', 'phone', 'last_update', 'email', 'birthdate', 'status', 'profile', 'start_date', 'end_date', 'creation_date', 'slack_username'
        );
        chai.request(server)
        .get(`/v1/suricats/${res.body.data[0].email}`)
        .end((err1, res1) => {
          should.not.exist(err1);
          res1.status.should.equal(200);
          res1.type.should.equal('application/json');
          res1.body.meta.status.should.eql('success');
          res1.body.data.should.include.keys(
            'suricat_id', 'name', 'firstname', 'phone', 'last_update', 'email', 'birthdate', 'status', 'profile', 'start_date', 'end_date', 'creation_date', 'slack_username'
          );
          done();
        });
      });
    });

    it('should throw an error if the suricat does not exist', (done) => {
      chai.request(server)
      .get('/v1/suricats/99999999999')
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


  describe('POST /v1/suricats', () => {

    it('should return the suricat that was added', (done) => {
      chai.request(server)
      .post('/v1/suricats')
      .send({
        name: 'Sikidi',
        firstname: 'Loïc',
        email: 'loic.sikidi@suricats-consulting.com'
      })
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(201);
        res.type.should.equal('application/json');
        res.body.should.equal('');
        done();
      });
    });

    it('should return error 409 if the suricat already existing', (done) => {
      chai.request(server)
      .post('/v1/suricats')
      .send({
        name: 'John',
        firstname: 'Doe',
        email: 'john.doe@suricats-consulting.com'
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
      .post('/v1/suricats')
      .send({
        name: 'Sikidi',
        firstname: 'Loïc'
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

  describe('PUT /v1/suricats/:username', () => {
    beforeEach(() => {
      return helperDB.cleanDB()
      .then(() => {
        return helperDB.populateDB();
      });
    });

    it('should update a single suricat', (done) => {
      chai.request(server)
      .get('/v1/suricats')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(3);
        res.body.data[0].should.include.keys(
          'suricat_id', 'name', 'firstname', 'phone', 'last_update', 'email', 'birthdate', 'status', 'profile', 'start_date', 'end_date', 'creation_date', 'slack_username'
        );
        chai.request(server)
        .put(`/v1/suricats/${res.body.data[0].email}`)
        .send({
          name: 'John',
          firstname: 'Doe',
          email: 'john.doe@suricats-consulting.com',
          phone: '06 11 12 14 18'
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
      .get('/v1/suricats')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(3);
        res.body.data[0].should.include.keys(
          'suricat_id', 'name', 'firstname', 'phone', 'last_update', 'email', 'birthdate', 'status', 'profile', 'start_date', 'end_date', 'creation_date', 'slack_username'
        );
        chai.request(server)
        .put(`/v1/suricats/${res.body.data[0].email}`)
        .send({
          name: 'John',
          firstname: 'Doe',
          phone: '06 11 12 14 18'
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

    it('should throw an error if the suricat does not exist', (done) => {
      chai.request(server)
      .put('/v1/suricats/99999999999')
      .send({
        name: 'John',
        firstname: 'Doe',
        email: 'john.doe@suricats-consulting.com',
        phone: '06 11 12 14 18'
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

  describe('GET /v1/suricats/:username/missions', () => {
    it('should return one mission from John', (done) => {
      chai.request(server)
      .get('/v1/suricats')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(3);
        res.body.data[0].should.include.keys(
          'suricat_id', 'name', 'firstname', 'phone', 'last_update', 'email', 'birthdate', 'status', 'profile', 'start_date', 'end_date', 'creation_date', 'slack_username'
        );
        chai.request(server)
        .get(`/v1/suricats/${res.body.data[0].email}/missions`)
        .end((err1, res1) => {
          should.not.exist(err1);
          res1.status.should.equal(200);
          res1.type.should.equal('application/json');
          res1.body.meta.status.should.eql('success');
          res1.body.data.length.should.eql(1);
          res1.body.data[0].should.include.keys(
            'client_name', 'client_id', 'start_date', 'end_date', 'status', 'description'
          );
          done();
        });
      });
    });
  });

  describe('POST /v1/suricats/:id/missions', () => {
    beforeEach(() => {
      return helperDB.cleanDB()
      .then(() => {
        return helperDB.populateDB();
      });
    });

    it('should return the mission that was added', (done) => {
      var payload = {};
      chai.request(server)
      .get('/v1/suricats')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(3);
        res.body.data[0].should.include.keys(
          'suricat_id', 'name', 'firstname', 'phone', 'last_update', 'email', 'birthdate', 'status', 'profile', 'start_date', 'end_date', 'creation_date', 'slack_username'
        );
        payload.email = res.body.data[0].email;
        chai.request(server)
        .get(`/v1/clients`)
        .end((err, res) => {
          should.not.exist(err);
          res.status.should.equal(200);
          res.type.should.equal('application/json');
          res.body.meta.status.should.eql('success');
          res.body.data.length.should.eql(2);
          res.body.data[0].should.include.keys(
            'client_id', 'name', 'sector_id', 'siren', 'description'
          );
          payload.client_id = res.body.data[1].client_id;
          chai.request(server)
          .post(`/v1/suricats/${payload.email}/missions`)
          .send({
            client_id: payload.client_id,
            status: 'ACTIVE',
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
    });

    it('should return error 409 if the mission already existing for John', (done) => {
      var payload = {};
      chai.request(server)
      .get('/v1/suricats')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(3);
        res.body.data[0].should.include.keys(
          'suricat_id', 'name', 'firstname', 'phone', 'last_update', 'email', 'birthdate', 'status', 'profile', 'start_date', 'end_date', 'creation_date', 'slack_username'
        );
        payload.email = res.body.data[0].email;
        chai.request(server)
        .get(`/v1/clients`)
        .end((err, res) => {
          should.not.exist(err);
          res.status.should.equal(200);
          res.type.should.equal('application/json');
          res.body.meta.status.should.eql('success');
          res.body.data.length.should.eql(2);
          res.body.data[0].should.include.keys(
            'client_id', 'name', 'sector_id', 'siren', 'description'
          );
          payload.client_id = res.body.data[0].client_id;
          payload.name = res.body.data[0].name;
          chai.request(server)
          .post(`/v1/suricats/${payload.email}/missions`)
          .send({
            client_id: payload.client_id,
            status: 'ACTIVE',
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
    });

    it('should return error 400 if missing mandatory field(s)', (done) => {
      var payload = {};
      chai.request(server)
      .get('/v1/suricats')
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.meta.status.should.eql('success');
        res.body.data.length.should.eql(3);
        res.body.data[0].should.include.keys(
          'suricat_id', 'name', 'firstname', 'phone', 'last_update', 'email', 'birthdate', 'status', 'profile', 'start_date', 'end_date', 'creation_date', 'slack_username'
        );
        payload.email = res.body.data[0].email;
        chai.request(server)
        .post(`/v1/suricats/${payload.email}/missions`)
        .send({
          status: 'ACTIVE'
        })
        .end((err1, res1) => {
          should.not.exist(err1);
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

  });

});
