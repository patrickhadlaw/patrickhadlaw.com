package main

import (
	"bufio"
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

	"golang.org/x/crypto/ssh/terminal"
)

func LogHandler(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s %s\n", r.RemoteAddr, r.Method, r.URL)
		handler.ServeHTTP(w, r)
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

func main() {
	var smtpHost string
	flag.StringVar(&smtpHost, "mail", "patrickhadlaw.com", "mail host address")
	var smtpServer string
	flag.StringVar(&smtpServer, "smtp", "patrickhadlaw.com", "smtp server address")
	var logfile string
	flag.StringVar(&logfile, "log", "runtime.log", "name of log file")
	var port int
	flag.IntVar(&port, "port", 80, "port to run server on")
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
	fmt.Print("Contact-email-account: ")
	contactEmail, _ := reader.ReadString('\n')
	contactEmail = contactEmail[0 : len(contactEmail)-2] // Remove newline

	fmt.Print("Mail-server-password: ")
	bytePassword, err := terminal.ReadPassword(int(syscall.Stdin))
	if err != nil {
		log.Fatal("Invalid password")
	}
	password := string(bytePassword)
	fmt.Printf("\n\n")

	serveMux := http.NewServeMux()
	apiMux := http.NewServeMux()

	serveMux.Handle("/", http.FileServer(http.Dir("./com")))

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
							auth := smtp.PlainAuth("", "contact@"+smtpHost, password, smtpServer)
							msg := []byte("From: " + email + "\r\n" +
								"To: " + contactEmail + "\r\n" +
								"Subject: patrickhadlaw.com Contact message\r\n\r\n" +
								"Name: " + name + "\r\n" +
								"\r\n" + message)

							err = smtp.SendMail(smtpServer+":"+strconv.Itoa(smtpPort), auth, "contact@"+smtpHost, []string{contactEmail}, msg)
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

	server := http.Server{
		Addr:    ":" + strconv.Itoa(port),
		Handler: LogHandler(serveMux),
	}

	log.Println("serving patrickhadlaw.com on port:", port)
	err = server.ListenAndServe()
	if err != nil {
		log.Fatal("Failed to launch http server")
	}
}
