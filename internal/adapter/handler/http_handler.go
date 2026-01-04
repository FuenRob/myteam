package handler

import (
	"encoding/json"
	"net/http"

	"github.com/fuenr/myteam/internal/domain"
	"github.com/fuenr/myteam/internal/service"
	"github.com/google/uuid"
)

type Handler struct {
	companyService *service.CompanyService
	userService    *service.UserService
}

func NewHandler(companyService *service.CompanyService, userService *service.UserService) *Handler {
	return &Handler{
		companyService: companyService,
		userService:    userService,
	}
}

// --- Helper Methods ---

func (h *Handler) respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	response, err := json.Marshal(payload)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(response)
}

func (h *Handler) respondError(w http.ResponseWriter, err error) {
	statusCode := http.StatusInternalServerError
	switch err {
	case domain.ErrNotFound:
		statusCode = http.StatusNotFound
	case domain.ErrDuplicate:
		statusCode = http.StatusConflict
	case domain.ErrInvalidInput, domain.ErrInvalidCredentials:
		statusCode = http.StatusBadRequest
	}
	h.respondJSON(w, statusCode, map[string]string{"error": err.Error()})
}

// --- Company Handlers ---

func (h *Handler) CreateCompany(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name string `json:"name"`
		CIF  string `json:"cif"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondError(w, domain.ErrInvalidInput)
		return
	}

	company, err := h.companyService.Create(r.Context(), req.Name, req.CIF)
	if err != nil {
		h.respondError(w, err)
		return
	}
	h.respondJSON(w, http.StatusCreated, company)
}

func (h *Handler) GetCompany(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id") // Go 1.22+ feature
	id, err := uuid.Parse(idStr)
	if err != nil {
		h.respondError(w, domain.ErrInvalidInput)
		return
	}

	company, err := h.companyService.Get(r.Context(), id)
	if err != nil {
		h.respondError(w, err)
		return
	}
	h.respondJSON(w, http.StatusOK, company)
}

// --- User Handlers ---

func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		CompanyID uuid.UUID   `json:"company_id"`
		Name      string      `json:"name"`
		Email     string      `json:"email"`
		Password  string      `json:"password"`
		Role      domain.Role `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondError(w, domain.ErrInvalidInput)
		return
	}

	user, err := h.userService.Create(r.Context(), req.CompanyID, req.Name, req.Email, req.Password, req.Role)
	if err != nil {
		h.respondError(w, err)
		return
	}
	h.respondJSON(w, http.StatusCreated, user)
}

func (h *Handler) BatchCreateUsers(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("companyID")
	companyID, err := uuid.Parse(idStr)
	if err != nil {
		h.respondError(w, domain.ErrInvalidInput)
		return
	}

	var req []domain.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondError(w, domain.ErrInvalidInput)
		return
	}

	// Basic validation (e.g. max batch size) could go here

	users, err := h.userService.BatchCreate(r.Context(), companyID, req)
	if err != nil {
		h.respondError(w, err)
		return
	}
	h.respondJSON(w, http.StatusCreated, users)
}

func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		h.respondError(w, domain.ErrInvalidInput)
		return
	}

	user, err := h.userService.Get(r.Context(), id)
	if err != nil {
		h.respondError(w, err)
		return
	}
	h.respondJSON(w, http.StatusOK, user)
}

func (h *Handler) GetUsersByCompany(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("companyID")
	id, err := uuid.Parse(idStr)
	if err != nil {
		h.respondError(w, domain.ErrInvalidInput)
		return
	}

	users, err := h.userService.GetByCompany(r.Context(), id)
	if err != nil {
		h.respondError(w, err)
		return
	}
	h.respondJSON(w, http.StatusOK, users)
}
