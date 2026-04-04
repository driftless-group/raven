const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const ivLength = 16;

class JSONDataFile {
  constructor(options={}) {
    Object.assign(this, options)

    //console.log(this);

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

    if (this.secret == undefined && JSONDataFile.hasFile()) {
      this.populateFromFile();
    } 
    
    if (this.secret == undefined) {
      this.secret = crypto.randomBytes(32).toString('base64');
    }

    //console.log(this);
  }
  
  populateFromFile() {
    var data = fs.readFileSync(JSONDataFile.secretFile()).toString();
    var json = JSON.parse(data);
    this.secret = json.secret;
  }

  shortPath() {
    return this.file.replace(process.cwd()+"/", "")
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

  encrypt(text) {
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.secret, 'base64'), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Return IV, Auth Tag, and Encrypted data together (often as a single string)
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(encryptedData) {
    const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.secret, 'base64'),
      Buffer.from(ivHex, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }


  read() {
    var self = this;

    return new Promise(async(resolve) => {
      fs.readFile(self.file, 'utf8', async (err, data) => {
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
          reject({success, error});
        } else {
          var success = true;
          resolve({success});
        }
      });    
    })
  }

  conceal() {
    var self = this;
    return new Promise(async(resolve) => {
      self.read().then((data) => {
        self.data = self.encrypt(data);

        self.save().then((response) => {
          resolve(response);
        })
      }) 
    })
  }

  expose() {
    var self = this;
    return new Promise(async(resolve) => {
      self.read().then((data) => {
        self.data = self.decrypt(data);
        
        self.save().then((response) => {
          resolve(response);
        })
      })
    })
  }

}


module.exports = JSONDataFile;



