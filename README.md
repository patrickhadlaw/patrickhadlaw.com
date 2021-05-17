# Patrick Hadlaw personal resume website

## Prerequisites

* Docker + Docker Compose
* npm - nodejs

## Licensing

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
* To be able to use contact features a mail host will need to be configured with an email account to send contact messages from, this email must be configured in the environment variables as shown in `.env`
* When running server the `.env` environment variable file should be configured properly
* Resume should be placed in `./frontend/dist/assets` directory as RESUME.pdf before building docker image

## Run instructions
```
$ git clone https://github.com/patrickhadlaw/patrickhadlaw.com
$ cd patrickhadlaw.com
$ docker-compose up -d
```
