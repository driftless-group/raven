#!/usr/bin/env node

const path = require('path');
const CarrierPigeon = require('carrier-pigeon');
const repl = require('node:repl');

var RavenDataFile = require(path.join(__dirname, '..'));


var parser = new CarrierPigeon({strict: false});
parser.option('env', { default: (process.env.NODE_ENV ? process.env.NODE_ENV : "development"), env: "NODE_ENV" })
parser.option('verbose', { default: false, env: "VERBOSE" })

var options = parser.parse(process.argv);
//require('@drifted/qa/db');



const r = repl.start('> ');
Object.defineProperty(r.context, 'RavenDataFile', {
  configurable: false,
  enumerable: true,
  value: RavenDataFile
});


