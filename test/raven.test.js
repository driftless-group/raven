const path = require('path');
const assert = require('assert');

const JSONDataFile = require(path.join(__dirname, '..'));

var defaults = {
  secret: 'ffdnZY17Fw+sup2+lhOOt6PW++/RkLTXRaLL3RJsjzE='
}

process.chdir(path.join(__dirname, 'workspace'));

describe('raven', function() {
  

  it('read', function(done) {
    
    done();
  })

  it('write', function(done) {
    done();
  })

  it('encrypt/decrypt', function(done) {
    var jdf = new JSONDataFile({secret: defaults.secret, data: {test: true}});
    var result = jdf.encrypt(JSON.stringify(jdf.data));
    result = JSON.parse(jdf.decrypt(result));
    assert.equal(result.test, true);
    
    done();
  })




})
