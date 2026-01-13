package main

import (
	"log"
	"net/http"

	"github.com/fuenr/myteam/internal/adapter/handler"
	"github.com/fuenr/myteam/internal/adapter/middleware"
	"github.com/fuenr/myteam/internal/adapter/storage/postgres"
	"github.com/fuenr/myteam/internal/config"
	"github.com/fuenr/myteam/internal/domain"
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
	dashboardService := service.NewDashboardService(repo, repo, repo)
	contractService := service.NewContractService(repo, repo)
	h := handler.NewHandler(companyService, userService, dashboardService, contractService)

	// 4. Router
	mux := http.NewServeMux()

	// Public Routes
	mux.HandleFunc("POST /login", h.Login)
	mux.HandleFunc("POST /companies", h.CreateCompany) // Assuming creating company is public for now (registration)

	// Batch Create (Allow creating multiple users without auth for now as per requirement)
	// "Además en el proceso de registro se crean usuarios de manera masiva, en ese caso sí está bien que se creen sin necesidad de comprobar la sesión"
	mux.HandleFunc("POST /companies/{companyID}/users/batch", h.BatchCreateUsers)

	// Create User (Public for registration/onboarding flow)
	mux.HandleFunc("POST /users", h.CreateUser)
	mux.HandleFunc("GET /companies/{companyID}/users", h.GetUsersByCompany)

	// Protected Routes
	// Helper to wrap handlers with Auth Middleware
	protected := middleware.AuthMiddleware
	adminOnly := func(next http.HandlerFunc) http.Handler {
		return protected(middleware.RequireRole(domain.RoleAdmin, next))
	}
	selfOrAdmin := func(next http.HandlerFunc) http.Handler {
		return protected(middleware.RequireSelfOrAdmin(next))
	}

	mux.Handle("GET /companies/{id}", protected(http.HandlerFunc(h.GetCompany)))

	// Dashboard Stats
	mux.Handle("GET /dashboard/stats", protected(http.HandlerFunc(h.GetDashboardStats)))

	// User Management
	// POST /users is now public (moved up)

	// Get and Update User (Self or Admin)
	mux.Handle("GET /users/{id}", protected(http.HandlerFunc(h.GetUser))) // Reading is usually allowed for authenticated users, or restrict to company?
	// For now, let's keep GET simple (Auth only) or RequireSelfOrAdmin if we want strict privacy.
	// User request focused on "Create or Edit". Let's restrict Edit.

	mux.Handle("PUT /users/{id}", selfOrAdmin(h.UpdateUser))
	mux.Handle("DELETE /users/{id}", adminOnly(h.DeleteUser))

	// Contract Management (Admin Only)
	mux.Handle("POST /users/{userID}/contracts", adminOnly(h.CreateContract))
	mux.Handle("GET /users/{userID}/contracts", adminOnly(h.GetContractsByUser))
	mux.Handle("PUT /contracts/{id}", adminOnly(h.UpdateContract))
	mux.Handle("DELETE /contracts/{id}", adminOnly(h.DeleteContract))

	// 5. Server
	srv := server.NewServer(cfg.ServerPort, mux)
	if err := srv.Run(); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
