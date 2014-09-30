var dgate = require('../')
  , spawn = require('child_process').spawn
  , request = require('request')
  , assert = require('assert')

describe('tests', function () {
  var servers, port;
  before(function (done) {
    var proc = spawn('node', [__dirname + '/fixtures/app.js']);
    proc.stdout.once('data', function (data) {
      servers = JSON.parse(data);
      done();
    });
    process.once('exit', function () {
      proc.kill();
    });
  });
  it('server 1', function (done) {
    var options = {
      vhosts: []
    };
    Object.keys(servers).forEach(function (letter) {
      options.vhosts.push({
        host: letter.toLowerCase() + '.app.dev',
        path: '**',
        target: 'http://localhost:' + servers[letter],
        options: {}
      });
    });
    server = dgate.server(options);
    server.listen(0, function () {
      port = server.address().port;
      done();
    });
  });
  it('request 1', function (done) {
    request('http://localhost:' + port + '/', function (err, resp, body) {
      assert.ifError(err);
      assert.equal(404, resp.statusCode);
      server.close();
      done();
    });
  });
  it('server 2', function (done) {
    var options = {
      vhosts: []
    };
    Object.keys(servers).forEach(function (letter) {
      options.vhosts.push({
        host: letter.toLowerCase() + '.app.dev',
        default: letter === 'B',
        path: '**',
        target: 'http://localhost:' + servers[letter],
        options: {}
      });
    });
    server = dgate.server(options);
    server.listen(0, function () {
      port = server.address().port;
      done();
    });
  });
  it('request 2', function (done) {
    request('http://localhost:' + port + '/', function (err, resp, body) {
      assert.ifError(err);
      assert.equal(200, resp.statusCode);
      assert.equal(body, 'B');
      done();
    });
  });
  it('request 3', function (done) {
    request({uri: 'http://localhost:' + port + '/', headers: {'Host': 'a.app.dev'}}, function (err, resp, body) {
      assert.ifError(err);
      assert.equal(200, resp.statusCode);
      assert.equal(body, 'A');
      done();
    });
  });
  it('request 4', function (done) {
    request({uri: 'http://localhost:' + port + '/', headers: {'Host': 'b.app.dev'}}, function (err, resp, body) {
      assert.ifError(err);
      assert.equal(200, resp.statusCode);
      assert.equal(body, 'B');
      done();
    });
  });
  it('request 5', function (done) {
    request({uri: 'http://localhost:' + port + '/', headers: {'Host': 'c.app.dev'}}, function (err, resp, body) {
      assert.ifError(err);
      assert.equal(200, resp.statusCode);
      assert.equal(body, 'C');
      done();
    });
  });
});
