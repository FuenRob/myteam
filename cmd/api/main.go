package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/fuenr/myteam/internal/adapter/handler"
	"github.com/fuenr/myteam/internal/adapter/storage/postgres"
	"github.com/fuenr/myteam/internal/service"
)

func main() {
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")

	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", dbUser, dbPass, dbHost, dbPort, dbName)

	if dbUser == "" {
		connStr = "postgres://postgres:postgres@localhost:5432/myteam?sslmode=disable"
	}

	log.Printf("Connecting to DB: %s", connStr)

	db, err := postgres.NewDB("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer db.Close()

	repo := postgres.NewRepository(db)

	companyService := service.NewCompanyService(repo)
	userService := service.NewUserService(repo, repo)

	h := handler.NewHandler(companyService, userService)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /companies", h.CreateCompany)
	mux.HandleFunc("GET /companies/{id}", h.GetCompany)

	mux.HandleFunc("POST /users", h.CreateUser)
	mux.HandleFunc("GET /users/{id}", h.GetUser)
	mux.HandleFunc("GET /companies/{companyID}/users", h.GetUsersByCompany)

	port := ":8080"
	log.Printf("Server starting on %s", port)
	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
