FROM golang:1.13

WORKDIR /patrickhadlaw

COPY ./patrick-hadlaw-server.go ./patrick-hadlaw-server.go
COPY ./frontend/dist/ ./com/

RUN go get golang.org/x/crypto/acme/autocert
RUN go build patrick-hadlaw-server.go

CMD ["/patrickhadlaw/patrick-hadlaw-server"]
