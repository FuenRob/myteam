package server

import (
	"encoding/json"
	"net/http"

	"github.com/fuenr/myteam/internal/domain"
	"github.com/fuenr/myteam/internal/service"
	"github.com/google/uuid"
)

type VacationHandler struct {
	service *service.VacationService
}

func NewVacationHandler(service *service.VacationService) *VacationHandler {
	return &VacationHandler{service: service}
}

func (h *VacationHandler) CreateVacation(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.PathValue("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var input service.CreateVacationInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	input.UserID = userID

	vacation, err := h.service.CreateVacation(r.Context(), input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(vacation)
}

func (h *VacationHandler) GetVacationsByUserID(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.PathValue("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	vacations, err := h.service.GetVacationsByUserID(r.Context(), userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(vacations)
}

func (h *VacationHandler) UpdateVacation(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Invalid vacation ID", http.StatusBadRequest)
		return
	}

	var input service.UpdateVacationInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	input.ID = id

	vacation, err := h.service.UpdateVacation(r.Context(), input)
	if err != nil {
		if err == domain.ErrNotFound {
			http.Error(w, "Vacation not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(vacation)
}

func (h *VacationHandler) DeleteVacation(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Invalid vacation ID", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteVacation(r.Context(), id); err != nil {
		if err == domain.ErrNotFound {
			http.Error(w, "Vacation not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
