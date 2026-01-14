package service

import (
	"context"
	"time"

	"github.com/fuenr/myteam/internal/domain"
	"github.com/fuenr/myteam/internal/port"
	"github.com/google/uuid"
)

type VacationService struct {
	repo port.VacationRepository
}

func NewVacationService(repo port.VacationRepository) *VacationService {
	return &VacationService{repo: repo}
}

type CreateVacationInput struct {
	UserID    uuid.UUID `json:"user_id"`
	StartDate string    `json:"start_date"` // Format YYYY-MM-DD
	EndDate   string    `json:"end_date"`   // Format YYYY-MM-DD
}

func (s *VacationService) CreateVacation(ctx context.Context, input CreateVacationInput) (*domain.Vacation, error) {
	startDate, err := time.Parse("2006-01-02", input.StartDate)
	if err != nil {
		return nil, err
	}
	endDate, err := time.Parse("2006-01-02", input.EndDate)
	if err != nil {
		return nil, err
	}

	vacation, err := domain.NewVacation(input.UserID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	if err := s.repo.CreateVacation(ctx, vacation); err != nil {
		return nil, err
	}

	return vacation, nil
}

func (s *VacationService) GetVacationsByUserID(ctx context.Context, userID uuid.UUID) ([]*domain.Vacation, error) {
	return s.repo.GetVacationsByUserID(ctx, userID)
}

func (s *VacationService) GetVacationByID(ctx context.Context, id uuid.UUID) (*domain.Vacation, error) {
	return s.repo.GetVacationByID(ctx, id)
}

type UpdateVacationInput struct {
	ID        uuid.UUID              `json:"id"`
	StartDate *string                `json:"start_date,omitempty"`
	EndDate   *string                `json:"end_date,omitempty"`
	Status    *domain.VacationStatus `json:"status,omitempty"`
}

func (s *VacationService) UpdateVacation(ctx context.Context, input UpdateVacationInput) (*domain.Vacation, error) {
	vacation, err := s.repo.GetVacationByID(ctx, input.ID)
	if err != nil {
		return nil, err
	}

	if input.StartDate != nil {
		startDate, err := time.Parse("2006-01-02", *input.StartDate)
		if err != nil {
			return nil, err
		}
		vacation.StartDate = startDate
	}

	if input.EndDate != nil {
		endDate, err := time.Parse("2006-01-02", *input.EndDate)
		if err != nil {
			return nil, err
		}
		vacation.EndDate = endDate
	}

	if vacation.StartDate.After(vacation.EndDate) {
		return nil, domain.ErrInvalidInput // Assuming ErrInvalidInput exists or generic error
	}

	if input.Status != nil {
		vacation.Status = *input.Status
	}

	vacation.UpdatedAt = time.Now()

	if err := s.repo.UpdateVacation(ctx, vacation); err != nil {
		return nil, err
	}

	return vacation, nil
}

func (s *VacationService) DeleteVacation(ctx context.Context, id uuid.UUID) error {
	return s.repo.DeleteVacation(ctx, id)
}
