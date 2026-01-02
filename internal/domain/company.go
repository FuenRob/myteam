package domain

import (
	"time"

	"github.com/google/uuid"
)

type Company struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	CIF       string    `json:"cif"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func NewCompany(name, cif string) (*Company, error) {
	if name == "" || cif == "" {
		return nil, ErrInvalidInput
	}
	return &Company{
		ID:        uuid.New(),
		Name:      name,
		CIF:       cif,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}, nil
}
