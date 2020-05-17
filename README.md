# Patrick Hadlaw personal résumé website

## Prerequisites

* Docker + Docker Compose
* npm - nodejs

## Liscensing

### This project is licensed under the provided license - see the [LICENSE](LICENSE) file for details

## Authors

* **Patrick Hadlaw** - [patrickhadlaw](https://github.com/patrickhadlaw)

## Build instructions

### Build instructions
```
$ git clone https://github.com/patrickhadlaw/patrickhadlaw.com
$ cd patrickhadlaw.com/frontend
$ npm install -g @angular/core
$ npm install -g @angular/cli
$ npm install
$ ng build --prod
$ cp -r dist/* ../com/
$ cd ..
$ docker build . -t <image:tag>
$ docker push <image:tag>
```

### Setup
* To be able to use contact features a mail server will need to be hosted
* When running server `--mail` flag should be set to your smtp-host name `--smtp-port` should be set and `--smtp` should be set to your smtp server
* Upon running server you will be prompted for password and email for the target contact email address
* Resume should be placed in project/com/assets dir as RESUME.pdf

## Run instructions
```
$ git clone https://github.com/patrickhadlaw/patrickhadlaw.com
$ cd patrickhadlaw.com
$ docker-compose up -d
```
