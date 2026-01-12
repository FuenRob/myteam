package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type ContractType string

const (
	ContractTypeIndefinite         ContractType = "Contrato indefinido"
	ContractTypeTemporary          ContractType = "Contrato temporal"
	ContractTypeTraining           ContractType = "Contrato formativo"
	ContractTypeFixedDiscontinuous ContractType = "Contrato fijo-discontinuo"
)

var (
	ErrContractNotFound = errors.New("contract not found")
	ErrInvalidContract  = errors.New("invalid contract data")
)

type Contract struct {
	ID        uuid.UUID    `json:"id"`
	UserID    uuid.UUID    `json:"user_id"`
	StartDate time.Time    `json:"start_date"`
	EndDate   *time.Time   `json:"end_date,omitempty"` // Pointer to allow null
	Type      ContractType `json:"type"`
	Position  string       `json:"position"`
	Salary    float64      `json:"salary"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
}

func NewContract(userID uuid.UUID, startDate time.Time, endDate *time.Time, contractType ContractType, position string, salary float64) (*Contract, error) {
	if position == "" {
		return nil, errors.New("position is required")
	}
	if salary < 0 {
		return nil, errors.New("salary cannot be negative")
	}

	// Logic: If Indefinite, EndDate must be null (or we force it to null)
	if contractType == ContractTypeIndefinite {
		endDate = nil
	} else {
		// Logic: Others must have EndDate? The prompt said:
		// "Contrato indefinido: No tiene fecha fin"
		// "Contrato temporal: Tiene fecha fin" (implies required)
		// Let's enforce it if strictly required, or let service handle it.
		// For now, I'll leave it loose here or strictly enforce if the requirement implies strictness.
		// "Tiene fecha fin" sounds strict.
		if endDate == nil {
			return nil, errors.New("end date is required for this contract type")
		}
		if endDate.Before(startDate) {
			return nil, errors.New("end date cannot be before start date")
		}
	}

	return &Contract{
		ID:        uuid.New(),
		UserID:    userID,
		StartDate: startDate,
		EndDate:   endDate,
		Type:      contractType,
		Position:  position,
		Salary:    salary,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}, nil
}
