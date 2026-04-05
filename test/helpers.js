const path = require('path');
const assert = require('assert');
var { exec } = require('child_process');
var { mkdir } = require('fs');
const fs = require('fs');
const crypto = require('crypto');



function run(...specifics) {
  var parts = [process.execPath, path.join(__dirname, '..', 'bin', 'raven.js')].concat(specifics);
  return new Promise((resolve, reject) => {
    exec(parts.join(' '), (err, stdout, stdin) => {
      if (err) { 
        reject(err) 
      } else {
        resolve(stdout);
      }
    })
  })
}

module.exports.run = run;


function ensure(pathname) {
  return new Promise((resolve) => {
    if (fs.existsSync(pathname)) {
      resolve();
    } else {
      fs.mkdir(pathname, { recursive: true }, (err, stdout, stdin) => {
        resolve();
      })
    }
  })
}
module.exports.ensure = ensure;


function remove(pathname) {
  return new Promise((resolve) => {
    if (fs.existsSync(pathname)) {
      fs.rm(pathname, { recursive: true, force: true }, (err, stdout, stdin) => {
        resolve();
      })
    } else {
      resolve();
    }
  })
}
module.exports.remove = remove;



function copy(original, newfile) {
  return new Promise((resolve, reject) => {
    fs.copyFile(original, newfile, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();

    });
  })
}
module.exports.copy = copy;




function compare(file1, file2) {
  var response = {equal: false};

  return new Promise((resolve, reject) => {
    if (fs.statSync(file1).size !== fs.statSync(file2).size) {
      response.equal = false;
      response.reason = 'size';
      return resolve(response)
    } else {
      const hash1 = crypto.createHash('sha256').update(fs.readFileSync(file1)).digest('hex');
      const hash2 = crypto.createHash('sha256').update(fs.readFileSync(file2)).digest('hex');
      
      if (hash1 !== hash2) {
        response.reason = 'hash';
        response.equal = false;
        resolve(response);
      } else {
        response.equal = true;
        resolve(response);
      }
    }
  })
}
module.exports.compare = compare;




