const path = require('path');
const assert = require('assert');
const fs = require('fs');

const JSONDataFile = require(path.join(__dirname, '..'));
var { exec } = require('child_process');

const {
  doneMessage
} = require('@drifted/qa');

const {
  run, ensure, remove
} = require(path.join(__dirname, 'helpers'));

var defaults = {
  secret: 'ffdnZY17Fw+sup2+lhOOt6PW++/RkLTXRaLL3RJsjzE='
}

describe('jsondatafile:cli', function() {

  describe('human', function() {
    it('secret', function(done) {
      run('secret').then((stdout) => {
        var secret = stdout.replace('secret: ', '');

        assert.equal(secret.length, 45);
        assert.notEqual(secret, undefined);
        
        done();
      }).catch(console.log)
    })
    
    it('init', function(done) {
      var homeConfig = path.join(__dirname, 'workspace', 'config')
      remove(homeConfig).then(() => {
        run('init').then((stdout) => {
          var json = JSON.parse(fs.readFileSync(path.join(homeConfig, 'secret.json')).toString());

          //console.log(json);
          assert.equal(json.secret.length, 44);
          assert.notEqual(json.secret, undefined);

          done();
        }).catch(doneMessage(done));
      }).catch(doneMessage(done));
    })

    it('generate', function(done) {
      var homeConfig = path.join(__dirname, 'workspace', 'config')
      remove(homeConfig).then(() => {
        run('init').then((stdout) => {
          var initial = JSON.parse(fs.readFileSync(path.join(homeConfig, 'secret.json')).toString());
          assert.equal(initial.secret.length, 44);
          assert.notEqual(initial.secret, undefined);

          run('generate').then(() => {
            var regenerated = JSON.parse(fs.readFileSync(path.join(homeConfig, 'secret.json')).toString());
            assert.notEqual(initial.secret, regenerated.secret);
            assert.equal(regenerated.secret.length, 44);
            assert.notEqual(regenerated.secret, undefined);

            done();
          });
        }).catch(doneMessage(done));
      }).catch(doneMessage(done));
    })
  })

  describe('json', function() {
    it('show', function(done) {
      run('show').then((stdout) => {
        var json = JSON.parse(stdout);
        
        assert.equal(json.secret.length, 44);
        assert.notEqual(json.secret, undefined);
        
        done();
      }).catch(doneMessage(done));
    })
  })

  describe('files', function() {
    it('conceal/expose', function(done) {
      var secret = JSONDataFile.secret();
      var file = path.join(__dirname, 'theraven.txt');
      var initial = fs.readFileSync(file).toString();
      run('conceal', '-f', file, '-s', secret).then(() => {
        var encrypted = fs.readFileSync(file).toString();
        run('expose', '-f', file, '-s', secret).then(() => {
          var final = fs.readFileSync(file).toString();
          
          assert.equal(initial, final);
          assert.notEqual(initial, encrypted);
          assert.notEqual(encrypted, final);
          
          done();
        }).catch(doneMessage(done));
      }).catch(doneMessage(done));
    })

    it('repeatedly concealing/exposing', function(done) {
      var secret = JSONDataFile.secret();
      var file = path.join(__dirname, 'theraven.txt');
      var initial = fs.readFileSync(file).toString();
      run('conceal', '-f', file, '-s', secret).then(() => {
        run('conceal', '-f', file, '-s', secret).then(() => {
          run('conceal', '-f', file, '-s', secret).then(() => {
            var encrypted = fs.readFileSync(file).toString();
            run('expose', '-f', file, '-s', secret).then(() => {
              run('expose', '-f', file, '-s', secret).then(() => {
                run('expose', '-f', file, '-s', secret).then(() => {
                  var final = fs.readFileSync(file).toString();

                  assert.equal(initial, final);
                  assert.notEqual(initial, encrypted);
                  assert.notEqual(encrypted, final);

                  done();
                }).catch(doneMessage(done));
              }).catch(doneMessage(done));
            }).catch(doneMessage(done));
          }).catch(doneMessage(done));
        }).catch(doneMessage(done));
      }).catch(doneMessage(done));
    })
  })

})
