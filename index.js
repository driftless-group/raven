const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { fileTypeFromBuffer } = require('file-type');
const ivLength = 16;
const { Readable, pipeline, buffer } = require('stream');
const Bufferable = require(path.join(__dirname, 'bufferable'));
const { isUtf8, isAscii } = require('node:buffer');

class RavenDataFile {


  constructor(options={}) {
    Object.assign(this, options)

    if (this.data != undefined && typeof this.data == 'string') {
      try {
        this.data = JSON.parse(this.data);
      } catch(error) {
        //console.log(error)
      }
    }

    if (this.algorithm == undefined) {
      this.algorithm = 'aes-256-gcm';
    }

    if (this.password != undefined && this.secret == undefined) {
      this.secret = RavenDataFile.hashPassword(this.password);
    }

    if (this.secret == undefined && RavenDataFile.hasFile()) {
      this.populateSecretFromFile();
    } 
    
    if (this.secret == undefined) {
      this.secret = crypto.randomBytes(32).toString('base64');
    }

  }


  static eval(options={}) {
    var iterations = 0;

    if (options.iterations != undefined) {
      iterations = options.iterations;
      delete options.iterations;
    }

    return new Promise(async(resolve) => {
      var file = new RavenDataFile(options);
      var times = 0;

      await file.read();
     
      while(times < iterations) {
        try {
          file.data = file.decrypt(file.data)
        } catch(error) {
          //console.log(error);
        }

        times = times + 1;
      }

      try {
        file.data = JSON.parse(file.data.toString());
      } catch(error) {
        console.log(error);
      }

      resolve(file.data)
    })
  }
  

  static toEnv(options={}) {
    var self = this;
    
    return new Promise((resolve) => {
      self.eval(options).then((json) => {
        Object.assign(process.env, json);
        resolve()
      })
    })   
  }


  static show() {
    return fs.readFileSync(this.secretFile()).toString();
  }


  static secretFile() {
    return path.join(process.cwd(), 'config', 'secret.json');
  }


  static hasFile() {
    var exists = fs.existsSync(this.secretFile());
    return exists;
  }


  static generate() {
    var self = this;
    return new Promise((resolve) => {
      var secret = self.secret();

      fs.writeFile(self.secretFile(), JSON.stringify({secret}, null, 2), () => {
        resolve(true);
      })
    })
  }


  static init() {
    var self = this;
    return new Promise((resolve) => {
      fs.mkdir(path.join(process.cwd(), 'config'), { recursive: true }, (err) => {
        if (err) throw err;

        if (self.hasFile() == false) {
          self.generate().then(() => {
            resolve(true);
          })
        } else {
          resolve(false)
        }
      });
    })
  }
 

  static secret() {
    return crypto.randomBytes(32).toString('base64');
  } 

  static hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex').slice(0, 43)+"=";
  }

  populateSecretFromFile() {
    var data = fs.readFileSync(RavenDataFile.secretFile()).toString();
    var json = JSON.parse(data);
    this.secret = json.secret;
  }


  shortPath() {
    return this.file.replace(process.cwd()+"/", "")
  }

  cipher(options={}) {
    //console.log(options);
    return crypto.createCipheriv(options.algorithm, 
      Buffer.from(options.secret, 'base64'), 
      options.iv);
  }

  decipher(options={}) {
    return crypto.createDecipheriv(options.algorithm, 
      Buffer.from(options.secret, 'base64'), 
      Buffer.from(options.iv, 'hex'));
  }

  encrypt(buffer) {
    const iv = crypto.randomBytes(ivLength);
    const cipher = this.cipher({iv: iv, secret: this.secret, algorithm: this.algorithm});  

    var encrypted = cipher.update(buffer, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Return IV, Auth Tag, and Encrypted data together (often as a single string)
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }


  decrypt(encryptedData) {
    const [ivHex, authTagHex, encryptedText] = encryptedData.toString().split(':');
    const decipher = this.decipher({iv: ivHex, secret: this.secret, algorithm: this.algorithm});

    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    
    var decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }


  read() {
    var self = this;

    return new Promise(async(resolve, reject) => {
      if (fs.existsSync(self.file) == false) {
        return reject(new Error('file doesnt exist.'))
      }
      
      fs.readFile(self.file, {}, async (err, data) => {
        self.data = data;      
        
        resolve(data);
      });
    })
  }


  save() {
    var self = this;
    return new Promise(async(resolve) => {
      fs.writeFile(self.file, self.data, error => {
        var success = true;

        if (error) {
          success = false;
          reject({success, error});
        } else {
          resolve({success});
        }
      });    
    })
  }


  conceal() {
    var self = this;
    return new Promise(async(resolve) => {
      const iv = crypto.randomBytes(ivLength);
      const cipher = self.cipher({iv: iv, secret: self.secret, algorithm: self.algorithm});

     self.read().then(async (buffer) => {
        var readable = Readable.from(buffer)
        const output = new Bufferable();
        readable.pipe(cipher).pipe(output);

        output.on('finish', async() => {
          const authTag = cipher.getAuthTag().toString('hex');    
          var encrypted = output.buffer;


          fs.truncate(self.file, 0, () => {
            const stream = fs.createWriteStream(self.file, { flags: 'a' });
            stream.write(`${iv.toString('hex')}:${authTag}:`);
            stream.write(encrypted.toString('base64'));
            stream.end(); 

            stream.on('finish', () => {
              resolve({success: true});
            });
          })
        });
     }) 
    })
  }


  expose() {
    var self = this;
    return new Promise(async(resolve) => {
      self.read().then((buffer) => {
        const [ivHex, authTagHex, encryptedText] = buffer.toString().split(':');
      
        var readable = Readable.from(Buffer.from(encryptedText, 'base64'))
        const output = new Bufferable();
        const decipher = self.decipher({iv:ivHex, secret: self.secret, algorithm: self.algorithm});
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

        readable.pipe(decipher).pipe(output);

        output.on('finish', () => {
          self.data = output.buffer;

          self.save().then(() => {
            resolve({success: true});
          })
        });
      })
    })
  }


}


module.exports = RavenDataFile;



