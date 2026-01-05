package main

import (
	"log"
	"net/http"

	"github.com/fuenr/myteam/internal/adapter/handler"
	"github.com/fuenr/myteam/internal/adapter/storage/postgres"
	"github.com/fuenr/myteam/internal/config"
	"github.com/fuenr/myteam/internal/server"
	"github.com/fuenr/myteam/internal/service"
)

func main() {
	// 1. Configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	log.Printf("Connecting to DB: %s", cfg.DBConnectionURL())

	// 2. Infrastructure (DB)
	db, err := postgres.NewDB("postgres", cfg.DBConnectionURL())
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer db.Close()

	// 3. Application Layers
	repo := postgres.NewRepository(db)
	companyService := service.NewCompanyService(repo)
	userService := service.NewUserService(repo, repo)
	dashboardService := service.NewDashboardService(repo, repo)
	h := handler.NewHandler(companyService, userService, dashboardService)

	// 4. Router
	mux := http.NewServeMux()
	mux.HandleFunc("POST /companies", h.CreateCompany)
	mux.HandleFunc("GET /companies/{id}", h.GetCompany)

	mux.HandleFunc("GET /dashboard/stats", h.GetDashboardStats)

	mux.HandleFunc("POST /login", h.Login)

	mux.HandleFunc("POST /users", h.CreateUser)
	mux.HandleFunc("GET /users/{id}", h.GetUser)
	mux.HandleFunc("POST /companies/{companyID}/users/batch", h.BatchCreateUsers)
	mux.HandleFunc("GET /companies/{companyID}/users", h.GetUsersByCompany)

	// 5. Server
	srv := server.NewServer(cfg.ServerPort, mux)
	if err := srv.Run(); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
