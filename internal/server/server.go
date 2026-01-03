package server

import (
	"log"
	"net/http"
	"time"
)

type Server struct {
	addr   string
	router http.Handler
}

func NewServer(port string, router http.Handler) *Server {
	return &Server{
		addr:   ":" + port,
		router: router,
	}
}

func (s *Server) Run() error {
	srv := &http.Server{
		Addr:         s.addr,
		Handler:      s.router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("Server starting on %s", s.addr)
	return srv.ListenAndServe()
}
