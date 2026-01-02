package domain

import (
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleAdmin    Role = "ADMIN"
	RoleEmployee Role = "EMPLOYEE"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	CompanyID    uuid.UUID `json:"company_id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Role         Role      `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func NewUser(companyID uuid.UUID, name, email, passwordHash string, role Role) (*User, error) {
	if name == "" || email == "" || passwordHash == "" {
		return nil, ErrInvalidInput
	}
	if role != RoleAdmin && role != RoleEmployee {
		return nil, ErrInvalidInput
	}
	return &User{
		ID:           uuid.New(),
		CompanyID:    companyID,
		Name:         name,
		Email:        email,
		PasswordHash: passwordHash,
		Role:         role,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}, nil
}
