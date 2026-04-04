
# jsondatafile

---

```bash
   npm install -g @drifted/jsondatafile 
```

```bash
  > raven usage

  > raven secret 
  secret: fVu1houhxJS0QeIGSURG0Mzm1C8o3QedhRETu8/ZVM4=

  > raven encrypt -s 'fVu1houhxJS0QeIGSURG0Mzm1C8o3QedhRETu8/ZVM4=' -d '{"test": true}'
  data: 75e1eb5497506fb3c19212546f6bbd64:4aa059c75da768a5cffbd739d47ccb77:4221fa37367a53ea00d033148cae
  
  > raven decrypt -s 'fVu1houhxJS0QeIGSURG0Mzm1C8o3QedhRETu8/ZVM4=' -d '75e1eb5497506fb3c19212546f6bbd64:4aa059c75da768a5cffbd739d47ccb77:4221fa37367a53ea00d033148cae'
  { test: true }

  > raven conceal -f theraven.txt

  theraven.txt encrypted
  secret: /n6hOiIoIg/qaQFQVMyyqNUB0pDAZmPyLblU/nKz4vg=

  > raven expose -f theraven.txt -s "/n6hOiIoIg/qaQFQVMyyqNUB0pDAZmPyLblU/nKz4vg="

  theraven.txt decrypted
  secret: /n6hOiIoIg/qaQFQVMyyqNUB0pDAZmPyLblU/nKz4vg=

  > raven init 
  file created at config/secret.json  # create default secret

  > raven init
  config/secret.json already exists.  # won't overwrite existing

  > raven generate
  file created at config/secret.json  # force new file to be created

  > raven show
  {
    "secret": "O9JorHTlz2Wk+oaGq1XpLZzYxwblzlYd3+No7l8eupQ="
  }

  > raven conceal -f theraven.txt

  theraven.txt encrypted
  secret: O9JorHTlz2Wk+oaGq1XpLZzYxwblzlYd3+No7l8eupQ=

  > raven expose -f theraven.txt

  theraven.txt decrypted
  secret: O9JorHTlz2Wk+oaGq1XpLZzYxwblzlYd3+No7l8eupQ=

```
