package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type VacationStatus string

const (
	VacationStatusPending  VacationStatus = "PENDING"
	VacationStatusApproved VacationStatus = "APPROVED"
	VacationStatusRejected VacationStatus = "REJECTED"
)

type Vacation struct {
	ID        uuid.UUID      `json:"id"`
	UserID    uuid.UUID      `json:"user_id"`
	StartDate time.Time      `json:"start_date"`
	EndDate   time.Time      `json:"end_date"`
	Status    VacationStatus `json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

func NewVacation(userID uuid.UUID, startDate, endDate time.Time) (*Vacation, error) {
	if startDate.After(endDate) {
		return nil, errors.New("start date cannot be after end date")
	}
	// Basic validation: ensure dates are not in the past?
	// Maybe let the service handle complex rules.

	return &Vacation{
		ID:        uuid.New(),
		UserID:    userID,
		StartDate: startDate,
		EndDate:   endDate,
		Status:    VacationStatusPending,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}, nil
}
