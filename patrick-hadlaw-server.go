package main

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"strconv"
	"time"

	"golang.org/x/crypto/acme/autocert"
	"golang.org/x/time/rate"
)

// LoggingResponseWriter is a response writer that logs requests
type LoggingResponseWriter struct {
	http.ResponseWriter
	status int
}

// NewLoggingResponseWriter creates a new LoggingResponseWriter
func NewLoggingResponseWriter(w http.ResponseWriter) *LoggingResponseWriter {
	return &LoggingResponseWriter{w, http.StatusOK}
}

// WriteHeader writes the response header given a status code
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

func lookupIntEnv(name string) (int, bool) {
	val, exists := os.LookupEnv(name)
	if exists {
		result, err := strconv.Atoi(val)
		return result, err == nil
	}
	return 0, false
}

// ContactMeRequest defines the request body for a contact me request
type ContactMeRequest struct {
	Name    string
	Email   string
	Message string
}

// AngularRoutes stores the frontend routes to ignore
var AngularRoutes = [...]string{
	"/about-me",
	"/skills",
	"/experience",
}

// LogFile stores the filename to log to
const LogFile = "runtime.log"

func main() {
	domain, exists := os.LookupEnv("DOMAIN")
	if !exists {
		log.Fatalln("environment variable 'DOMAIN' not set")
	}
	port, exists := lookupIntEnv("APP_PORT")
	if !exists {
		log.Fatalln("environment variable 'APP_PORT' not set")
	}
	smtpHost, exists := os.LookupEnv("SMTP_HOST")
	if !exists {
		log.Fatalln("environment variable 'SMTP_HOST' not set")
	}
	smtpPort, exists := lookupIntEnv("SMTP_PORT")
	if !exists {
		log.Fatalln("environment variable 'SMTP_PORT' not set")
	}
	contactEmail, exists := os.LookupEnv("CONTACT_ME")
	if !exists {
		log.Fatalln("environment variable 'CONTACT_ME' not set")
	}
	mailUser, exists := os.LookupEnv("MAIL_SERVER_USER")
	if !exists {
		log.Fatalln("environment variable 'MAIL_SERVER_USER' not set")
	}
	mailPassword, exists := os.LookupEnv("MAIL_SERVER_PASSWORD")
	if !exists {
		log.Fatalln("environment variable 'MAIL_SERVER_PASSWORD' not set")
	}

	file, err := os.OpenFile(LogFile, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("error opening log-file: %v", err)
	}

	multiWriter := io.MultiWriter(os.Stdout, file)
	log.SetOutput(multiWriter)

	serveMux := http.NewServeMux()
	apiMux := http.NewServeMux()

	fileServer := http.FileServer(http.Dir("./com"))

	serveMux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		for _, route := range AngularRoutes {
			if r.URL.Path == route {
				r.URL.Path = "/index.html"
				break
			}
		}
		fileServer.ServeHTTP(w, r)
	})

	serveMux.Handle("/api/", http.StripPrefix("/api", apiMux))

	var limiter = rate.NewLimiter(1, 1)

	apiMux.HandleFunc("/message/send", func(w http.ResponseWriter, r *http.Request) {
		if limiter.Allow() {
			var contactMeRequest ContactMeRequest
			decoder := json.NewDecoder(r.Body)
			err := decoder.Decode(&contactMeRequest)
			if err != nil {
				w.WriteHeader(http.StatusBadRequest)
			} else {
				auth := smtp.PlainAuth("", mailUser, mailPassword, smtpHost)
				msg := []byte("From: " + "contact@" + domain + "\r\n" +
					"To: " + contactEmail + "\r\n" +
					"Subject: Contact message\r\n\r\n" +
					"Contact message from patrickhadlaw.com\r\n" +
					"Name: " + contactMeRequest.Name + "\r\n" +
					"Email: " + contactMeRequest.Email + "\r\n" +
					"\r\nMessage: " + contactMeRequest.Message)
				err = smtp.SendMail(
					fmt.Sprintf("%s:%d", smtpHost, smtpPort),
					auth,
					contactEmail,
					[]string{contactEmail},
					msg)
				if err != nil {
					log.Printf("ERROR: failed to send mail: %s", err.Error())
					w.WriteHeader(http.StatusInternalServerError)
				} else {
					log.Printf("Sent message from: %s with email: %s", contactMeRequest.Name, contactMeRequest.Email)
				}
			}
		} else {
			w.WriteHeader(http.StatusTooManyRequests)
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
		Addr:      fmt.Sprintf(":%d", port),
		Handler:   loggingMux(serveMux),
		TLSConfig: &tls.Config{GetCertificate: manager.GetCertificate},
	}

	log.Println("serving patrickhadlaw.com on port:", port)
	err = server.ListenAndServeTLS("", "")
	if err != nil {
		log.Fatal("Failed to launch https server")
	}
}
