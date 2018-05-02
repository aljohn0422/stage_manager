package main

import (
	"log"
	"net"
	"net/http"

	"github.com/googollee/go-socket.io"
)

func getIP() string {
	addrs, err := net.InterfaceAddrs()
	ip := ""
	if err != nil {
		log.Panic(err)
	}
	for _, address := range addrs {
		if ipnet, ok := address.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				ip = ipnet.IP.String()
			}
		}
	}
	return ip
}

func main() {
	connections := 0
	data := "[]"
	options := "[]"
	ip := getIP()
	server, err := socketio.NewServer(nil)
	if err != nil {
		log.Fatal(err)
	}
	server.On("connection", func(io socketio.Socket) {
		connections++
		log.Printf("Connections: %v\n", connections)
		io.Join("room")
		io.Emit("load", data)
		io.Emit("load_options", options)
		io.Emit("ip", ip+":5000")
		io.On("client_send", func(msg string) {
			log.Println(msg)
			data = msg
			io.BroadcastTo("room", "server_send", msg)
		})
		io.On("option_send", func(msg string) {
			log.Println(msg)
			options = msg
			io.BroadcastTo("room", "server_send_option", msg)
		})
		io.On("disconnection", func() {
			connections--
			log.Println("disconnect")
		})
	})
	server.On("error", func(io socketio.Socket, err error) {
		log.Println("error:", err)
	})

	http.Handle("/socket.io/", server)
	http.Handle("/", http.FileServer(http.Dir("./asset")))
	log.Printf("Open the link in browser: %s:5000\n", ip)
	log.Fatal(http.ListenAndServe(":5000", nil))
}
