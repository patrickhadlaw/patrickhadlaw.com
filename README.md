# Patrick Hadlaw personal résumé website

## Prerequisites

* Golang
* npm - nodejs

## Liscensing

### This project is licensed under the provided license - see the [LICENSE](https://github.com/patrickhadlaw/patrickhadlaw.com/blob/master/LISCENSE) file for details

## Authors

* **Patrick Hadlaw** - [patrickhadlaw](https://github.com/patrickhadlaw)

## Build instructions

### Server setup
```
$ git clone https://github.com/patrickhadlaw/patrickhadlaw.com
$ cd patrickhadlaw.com/frontend
$ npm install -g @angular/core
$ npm install -g @angular/cli
$ npm install
$ ng build --prod
$ cp -r dist/* ../com/
$ cd ..
$ go get golang.org/x/crypto/ssh/terminal
$ go build patrick-hadlaw-server.go
```

### Setup
* To be able to use contact features a mail server will need to be hosted
* The mail server should have an address of noreply@&lt;smtp-host&gt;
* When running server `--mail` flag should be set to your smtp-host name `--smtp-port` should be set and `--smtp` should be set to your smtp server
* Upon running server you will be prompted for password for contact@&lt;smtp-host&gt; as well as the target contact email address
* Resume should be placed in project/com/assets dir as RESUME.pdf

## Run instructions: 

```
$ cd patrickhadlaw.com
$ ./patrick-hadlaw-server [--help] [--mail=<smtp-host>] [--smtp=<smtp-server>] [--smtp-port=<smtp-port>] [--log=<log-file>] [--port=<port>]
```