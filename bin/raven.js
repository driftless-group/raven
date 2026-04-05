#!/usr/bin/env node

const CarrierPigeon = require('carrier-pigeon');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const RavenDataFile = require(path.join(__dirname, '..'));

var parser = new CarrierPigeon({strict: true});
parser.commands('version', 'usage', 'show', 'secret', 'init', 'generate', 'expose', 'conceal', 'encrypt', 'decrypt');
parser.option('file', {type: 'file'});
parser.option('password', {});
parser.option('secret', {});
parser.option('data', {});
parser.option('type', {default: 'text'});
parser.option('json', {default: false});
parser.option('location', {type: 'file', default: process.cwd()});
parser.option('verbose', {default: false});

var options = parser.parse(process.argv);

var command = options.command;
process.chdir(options.location);
delete options.location;
delete options.command;




if (options.verbose) {
    console.log('command:',command);
    console.log('options:',options);
}



if (command == 'encrypt') {
  var file   = new RavenDataFile(options);

  var data = file.encrypt(options.data);
  if (options.json) {
    console.log(JSON.stringify({
      action: 'encrypt', 
      options: options, 
      data: data
    }, null, 2))
  } else {
    console.log('data:', data);
  }
}



if (command == 'decrypt') {
  var data   = options.data;
  var secret = options.secret;

  delete options.data;
  var file   = new RavenDataFile(options);
  var json = file.decrypt(data);

  try {
    json = JSON.parse(json);
  } catch(error) {
    if (options.verbose) {
      console.log(error);
    }
  }
  if (options.json) {
    console.log(JSON.stringify({
      action: 'decrypt', 
      options: options, 
      data: json
    }, null, 2))
  } else {
    console.log(json);
  }
}



if (command == 'generate') {
  RavenDataFile.generate().then((generated) => {
    if (options.json) {
       
       console.log(JSON.stringify({
         action: 'generate', 
         options: options, 
         location: process.cwd(), 
         success: generated
       }, null, 2))

    } else {
      console.log('file created at', RavenDataFile.secretFile().replace(process.cwd()+path.sep, ''));
    }
  })  
}



if (command == 'init') {
  RavenDataFile.init().then((initialized) => {
    if (options.json) {
      console.log(JSON.stringify({action: 'init', options: options, location: process.cwd(), success: initialized}, null, 2))
    } else {
      if (initialized) {
        console.log('file created at', RavenDataFile.secretFile().replace(process.cwd()+path.sep, ''));
      } else {
        console.log(RavenDataFile.secretFile().replace(process.cwd()+path.sep, ''), 'already exists.');
      }
    }
  })  
}



if (command == 'secret') {
  if (options.json) {
    console.log(JSON.stringify({ secret: RavenDataFile.secret() }, null, 2));
  } else {
    console.log('secret:', RavenDataFile.secret());
  }
}



if (command == 'show') {
  var json = JSON.parse(RavenDataFile.show());
  if (options.json) {
    console.log(JSON.stringify(json, null, 2));
  } else {
    console.log('secret:', json.secret);
  }
}



if (command == 'expose') {
  var file = new RavenDataFile(options);
  file.expose().then(() => {   
    if (options.json) {
      console.log(JSON.stringify({
        file: file.shortPath(), 
        action: 'expose', 
        options: options, 
        secret: file.secret
      }, null, 2))
    } else {
      console.log('');
      console.log(file.shortPath(), 'decrypted'); 
      console.log('secret:', file.secret);
      console.log('');
    }
  })
}



if (command == 'conceal') {
  var file = new RavenDataFile(options);
  file.conceal().then(() => {
    if (options.json) {
      console.log(JSON.stringify({
        file: file.shortPath(), 
        action: 'conceal', 
        options: options, 
        secret: file.secret
      }, null, 2))
    } else {
      console.log('');
      console.log(file.shortPath(), 'encrypted');
      console.log('secret:', file.secret);
      console.log('');
    }
  })
}



if (command == 'usage') {
  console.log(fs.readFileSync(path.join(__dirname, '..', 'usage.txt')).toString());
}



if (command == 'version') {
  var data = fs.readFileSync(path.join(__dirname, '..', 'package.json')).toString();
  var json = JSON.parse(data);
  console.log(json.version)
}


