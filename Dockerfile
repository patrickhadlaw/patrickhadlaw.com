FROM golang:1.16

WORKDIR /patrickhadlaw

COPY ./patrick-hadlaw-server.go ./patrick-hadlaw-server.go
COPY ./go.mod ./go.mod
COPY ./go.sum ./go.sum
COPY ./frontend/dist/ ./com/

RUN go get .
RUN go build patrick-hadlaw-server.go

CMD ["/patrickhadlaw/patrick-hadlaw-server"]
