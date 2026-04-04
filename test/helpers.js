const path = require('path');
const assert = require('assert');
var { exec } = require('child_process');
var { mkdir } = require('fs');
const fs = require('fs');


function run(...specifics) {
  var parts = [process.execPath, path.join(__dirname, '..', 'bin', 'cli.js')].concat(specifics);
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
