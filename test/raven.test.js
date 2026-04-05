const path = require('path');
const assert = require('assert');
process.env.NODE_ENV = 'test';

const JSONDataFile = require(path.join(__dirname, '..'));

var defaults = {
  secret: 'ffdnZY17Fw+sup2+lhOOt6PW++/RkLTXRaLL3RJsjzE='
}

const {
  doneMessage
} = require('@drifted/qa');

const {
  run, ensure, remove
} = require(path.join(__dirname, 'helpers'));



process.chdir(path.join(__dirname, 'workspace'));

console.log(__dirname);

//console.log(process.env)

describe('raven', function() {
  

  it('eval', function(done) {

    // this seems to work.  i should write a test to make sure that it works
    JSONDataFile.eval({
      secret: defaults.secret,
      iterations: 2, 
      file: path.join(__dirname, 'workspace', 'example.json.encrypted')
    }).then((json) => {
      done()
    }).catch(doneMessage(done))

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
