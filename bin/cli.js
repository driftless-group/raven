#!/usr/bin/env node

var CarrierPigeon = require('carrier-pigeon');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
const JSONDataFile = require(path.join(__dirname, '..'));


var parser = new CarrierPigeon({strict: true});
parser.commands('usage', 'show', 'secret', 'init', 'generate', 'expose', 'conceal', 'encrypt', 'decrypt');
parser.option('file', {type: 'file'});
parser.option('secret', {});
parser.option('data', {});
parser.option('json', {default: false});
parser.option('location', {type: 'file', default: process.cwd()});
parser.option('verbose', {default: false});

var options = parser.parse(process.argv);

var command = options.command;
delete options.command;

process.chdir(options.location);
delete options.location;


if (options.verbose) {
  console.log('command:',command);
  console.log('options:',options);
}



if (command == 'encrypt') {
  var file   = new JSONDataFile(options);

  var data = file.encrypt(options.data);
  console.log('data:', data);
}



if (command == 'decrypt') {
  var data   = options.data;
  var secret = options.secret;

  delete options.data;
  var file   = new JSONDataFile(options);
  var json = file.decrypt(data);

  try {
    json = JSON.parse(json);
  } catch(error) {
    if (options.verbose) {
      console.log(error);
    }
  }

  console.log(json)
}



if (command == 'generate') {
  JSONDataFile.generate().then((generated) => {
    console.log('file created at', JSONDataFile.secretFile().replace(process.cwd()+path.sep, ''));
  })  
}



if (command == 'init') {
  JSONDataFile.init().then((initialized) => {
    if (initialized) {
      console.log('file created at', JSONDataFile.secretFile().replace(process.cwd()+path.sep, ''));
    } else {
      console.log(JSONDataFile.secretFile().replace(process.cwd()+path.sep, ''), 'already exists.');
    }
  })  
}



if (command == 'secret') {
  console.log('secret:', JSONDataFile.secret());
}



if (command == 'show') {
  console.log(JSONDataFile.show());
}

if (command == 'expose') {
  var file = new JSONDataFile(options);
  //console.log(file);
  file.expose().then(() => {   
    console.log('');
    console.log(file.shortPath(), 'decrypted'); 
    console.log('secret:', file.secret);
    console.log('');
  })
}


if (command == 'conceal') {
  var file = new JSONDataFile(options);
  //console.log(file);
  file.conceal().then(() => {
    console.log('');
    console.log(file.shortPath(), 'encrypted');
    console.log('secret:', file.secret);
    console.log('');
  })
}


if (command == 'usage') {
  console.log(fs.readFileSync(path.join(__dirname, '..', 'usage.txt')).toString());
}
