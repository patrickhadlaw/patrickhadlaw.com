FROM golang:1.18 as build

WORKDIR /patrickhadlaw

COPY ./patrick-hadlaw-server.go ./patrick-hadlaw-server.go
COPY ./go.mod ./go.mod
COPY ./go.sum ./go.sum

RUN go get .
RUN go build patrick-hadlaw-server.go

FROM ubuntu:20.04

WORKDIR /patrickhadlaw

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get -y install ca-certificates libssl-dev

COPY --from=build /patrickhadlaw/patrick-hadlaw-server .
COPY ./frontend/dist/ ./com/

CMD ["/patrickhadlaw/patrick-hadlaw-server"]
