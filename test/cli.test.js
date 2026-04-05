const path = require('path');
const assert = require('assert');
const fs = require('fs');

const RavenDataFile = require(path.join(__dirname, '..'));
var { exec } = require('child_process');

const {
  doneMessage
} = require('@drifted/qa');

const {
  compare, run, ensure, remove, copy
} = require(path.join(__dirname, 'helpers'));

var defaults = {
  secret: 'ffdnZY17Fw+sup2+lhOOt6PW++/RkLTXRaLL3RJsjzE='
}

describe('raven', function() {

  before(async() => {
    var file = path.join(__dirname, 'data', '1984.pdf');
    var encrypted = path.join(__dirname, 'data','1984.pdf.encrypted');

    if (fs.existsSync(encrypted)) {
      await remove(encrypted)
    }

    await copy(file, encrypted); 
  })

  after(async() => {
    var encrypted = path.join(__dirname, 'data','1984.pdf.encrypted');

    if (fs.existsSync(encrypted)) {
      await remove(encrypted)
    }
  })

  describe('human', function() {
    it('secret', function(done) {
      run('secret').then((stdout) => {
        var secret = stdout.replace('secret: ', '');

        assert.equal(secret.length, 45);
        assert.notEqual(secret, undefined);
        
        done();
      }).catch(doneMessage(done))
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
      run('show', '-j').then((stdout) => {
        var json = JSON.parse(stdout);
        
        assert.equal(json.secret.length, 44);
        assert.notEqual(json.secret, undefined);
        
        done();
      }).catch(doneMessage(done));
    })
  })

  describe('files', function() {
    it('conceal/expose', function(done) {
      var secret = RavenDataFile.secret();
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
      var secret = RavenDataFile.secret();
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



    it('conceal/expose a pdf', function(done) {
      var secret = RavenDataFile.secret();
      var original = path.join(__dirname, 'data', '1984.pdf');
      var encrypted = path.join(__dirname, 'data', '1984.pdf.encrypted');

      run('conceal', '-f', encrypted, '-s', secret).then(() => {
        compare(original, encrypted).then((response) => {
          assert.equal(response.equal, false);

          run('expose', '-f', encrypted, '-s', secret).then(() => {
            compare(original, encrypted).then((response) => {
              //console.log(response)
              assert.equal(response.equal, true);
              done();

            }).catch(doneMessage(done));
          }).catch(doneMessage(done));
        }).catch(doneMessage(done));
      }).catch(doneMessage(done));
    })

  })


})
