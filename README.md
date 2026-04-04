
# jsondatafile

---

```bash
   npm install -g @drifted/jsondatafile 
```

```bash
  > jsondatafile usage

  > jsondatafile secret 
  secret: fVu1houhxJS0QeIGSURG0Mzm1C8o3QedhRETu8/ZVM4=

  > jsondatafile encrypt -s 'fVu1houhxJS0QeIGSURG0Mzm1C8o3QedhRETu8/ZVM4=' -d '{"test": true}'
  data: 75e1eb5497506fb3c19212546f6bbd64:4aa059c75da768a5cffbd739d47ccb77:4221fa37367a53ea00d033148cae
  
  > jsondatafile decrypt -s 'fVu1houhxJS0QeIGSURG0Mzm1C8o3QedhRETu8/ZVM4=' -d '75e1eb5497506fb3c19212546f6bbd64:4aa059c75da768a5cffbd739d47ccb77:4221fa37367a53ea00d033148cae'
  { test: true }

  > jsondatafile conceal -f theraven.txt

  test/theraven.txt encrypted
  secret: /n6hOiIoIg/qaQFQVMyyqNUB0pDAZmPyLblU/nKz4vg=

  > jsondatafile expose -f theraven.txt -s "/n6hOiIoIg/qaQFQVMyyqNUB0pDAZmPyLblU/nKz4vg="

  test/theraven.txt decrypted
  secret: /n6hOiIoIg/qaQFQVMyyqNUB0pDAZmPyLblU/nKz4vg=

  > jsondatafile init 
  file created at config/secret.json  // create default secret

  > jsondatafile init
  config/secret.json already exists. // won't overwrite existing

  > jsondatafile generate
  file created at config/secret.json // force new file to be created


```
