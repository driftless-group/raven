const { Writable } = require('node:stream');

class Bufferable extends Writable {
  constructor() {
    super();
    this.chunks = [];
  }
  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    callback();
  }
  get buffer() {
    return Buffer.concat(this.chunks);
  }
}


module.exports = Bufferable;
