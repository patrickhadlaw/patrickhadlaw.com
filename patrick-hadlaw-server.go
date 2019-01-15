package main

import (
	"bufio"
	"crypto/tls"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"strconv"
	"syscall"
	"time"

	"golang.org/x/crypto/acme/autocert"
	"golang.org/x/crypto/ssh/terminal"
)

type LoggingResponseWriter struct {
	http.ResponseWriter
	status int
}

func NewLoggingResponseWriter(w http.ResponseWriter) *LoggingResponseWriter {
	return &LoggingResponseWriter{w, http.StatusOK}
}

func (writer *LoggingResponseWriter) WriteHeader(code int) {
	writer.status = code
	writer.ResponseWriter.WriteHeader(code)
}

func loggingMux(mux *http.ServeMux) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		log.Printf("--> %s %s %s\n", r.RemoteAddr, r.Method, r.URL)

		writer := NewLoggingResponseWriter(w)

		mux.ServeHTTP(writer, r)

		log.Printf("<-- %d - %s %s %s %s", writer.status, http.StatusText(writer.status), r.RemoteAddr, r.Method, r.URL)
	})
}

// Dict is a generic dictionary
type Dict map[string]interface{}

// Exists checks if key exists in dictionary
func (dict Dict) Exists(key string) bool {
	_, ok := dict[key]
	return ok
}

// ToDict converts json to dictionary
func ToDict(str string) (Dict, error) {
	var dict Dict
	err := json.Unmarshal([]byte(str), &dict)
	if err != nil {
		return nil, err
	}
	return dict, nil
}

// RequestToJSON turns request body into dictionary
func RequestToJSON(request *http.Request) (Dict, error) {
	decoder := json.NewDecoder(request.Body)
	var dict Dict
	err := decoder.Decode(&dict)
	if err != nil {
		return nil, err
	}
	return dict, nil
}

var ANGULAR_ROUTES = [...]string{
	"/about-me",
	"/skills",
	"/experience",
}

func main() {
	var smtpHost string
	flag.StringVar(&smtpHost, "mail", "patrickhadlaw.com", "mail host address")
	var smtpServer string
	flag.StringVar(&smtpServer, "smtp", "patrickhadlaw.com", "smtp server address")
	var contactEmail string
	flag.StringVar(&contactEmail, "contact", "patrickhadlaw@gmail.com", "smtp server address")
	var logfile string
	flag.StringVar(&logfile, "log", "runtime.log", "name of log file")
	var port int
	flag.IntVar(&port, "port", 443, "port to run server on")
	var smtpPort int
	flag.IntVar(&smtpPort, "smtp-port", 587, "port for smtp requests")

	flag.Parse()

	file, err := os.OpenFile(logfile, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("error opening log-file: %v", err)
	}

	multiWriter := io.MultiWriter(os.Stdout, file)

	log.SetOutput(multiWriter)

	reader := bufio.NewReader(os.Stdin)
	fmt.Print("Mail-server-user: ")
	mailUser, _ := reader.ReadString('\n')
	mailUser = mailUser[0 : len(mailUser)-2] // Remove newline

	fmt.Print("\nMail-server-password: ")
	bytePassword, err := terminal.ReadPassword(int(syscall.Stdin))
	if err != nil {
		log.Fatal("Invalid password")
	}
	password := string(bytePassword)
	fmt.Printf("\n\n")

	serveMux := http.NewServeMux()
	apiMux := http.NewServeMux()

	fileServer := http.FileServer(http.Dir("./com"))

	serveMux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		for _, route := range ANGULAR_ROUTES {
			if r.URL.Path == route {
				r.URL.Path = "/index.html"
				break
			}
		}
		fileServer.ServeHTTP(w, r)
	})

	serveMux.Handle("/api/", http.StripPrefix("/api", apiMux))

	apiMux.HandleFunc("/message/send", func(w http.ResponseWriter, r *http.Request) {
		js, err := RequestToJSON(r)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
		} else {
			if js.Exists("name") && js.Exists("email") && js.Exists("message") {
				if name, ok := js["name"].(string); ok {
					if email, ok := js["email"].(string); ok {
						if message, ok := js["message"].(string); ok {
							auth := smtp.PlainAuth("", mailUser, password, smtpServer)
							msg := []byte("From: " + "contact@" + smtpHost + "\r\n" +
								"To: " + contactEmail + "\r\n" +
								"Subject: Contact message\r\n\r\n" +
								"Contact message from patrickhadlaw.com\r\n" +
								"Name: " + name + "\r\n" +
								"Email: " + email + "\r\n" +
								"\r\nMessage: " + message)

							err = smtp.SendMail(smtpServer+":"+strconv.Itoa(smtpPort), auth, contactEmail, []string{contactEmail}, msg)
							if err != nil {
								log.Printf("ERROR: failed to send mail: %s", err.Error())
								w.WriteHeader(http.StatusInternalServerError)
							} else {
								log.Printf("Sent message from: %s with email: %s", name, email)
							}
						} else {
							w.WriteHeader(http.StatusBadRequest)
						}
					} else {
						w.WriteHeader(http.StatusBadRequest)
					}
				} else {
					w.WriteHeader(http.StatusBadRequest)
				}
			} else {
				w.WriteHeader(http.StatusBadRequest)
			}
		}
	})

	var manager *autocert.Manager

	manager = &autocert.Manager{
		Prompt:     autocert.AcceptTOS,
		HostPolicy: autocert.HostWhitelist("patrickhadlaw.com"),
		Cache:      autocert.DirCache("."),
	}

	autocertServer := http.Server{
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
		IdleTimeout:  120 * time.Second,
		Handler:      manager.HTTPHandler(nil),
	}

	go func() {
		err = autocertServer.ListenAndServe()
		if err != nil {
			log.Fatal("Failed to launch autocert http server")
		}
	}()

	server := http.Server{
		Addr:      ":" + strconv.Itoa(port),
		Handler:   loggingMux(serveMux),
		TLSConfig: &tls.Config{GetCertificate: manager.GetCertificate},
	}

	log.Println("serving patrickhadlaw.com on port:", port)
	err = server.ListenAndServeTLS("", "")
	if err != nil {
		log.Fatal("Failed to launch https server")
	}
}
