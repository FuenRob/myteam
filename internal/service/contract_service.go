package service

import (
	"context"
	"time"

	"github.com/fuenr/myteam/internal/domain"
	"github.com/fuenr/myteam/internal/port"
	"github.com/google/uuid"
)

type ContractService struct {
	contractRepo port.ContractRepository
	userRepo     port.UserRepository
}

func NewContractService(contractRepo port.ContractRepository, userRepo port.UserRepository) *ContractService {
	return &ContractService{
		contractRepo: contractRepo,
		userRepo:     userRepo,
	}
}

func (s *ContractService) Create(ctx context.Context, userID uuid.UUID, startDate time.Time, endDate *time.Time, contractType domain.ContractType, position string, salary float64) (*domain.Contract, error) {
	// 1. Verify user exists
	if _, err := s.userRepo.GetUserByID(ctx, userID); err != nil {
		return nil, err
	}

	// 2. Create Contract Entity (Validates logic)
	contract, err := domain.NewContract(userID, startDate, endDate, contractType, position, salary)
	if err != nil {
		return nil, domain.ErrInvalidInput // Wrap or return specific error
	}

	// 3. Persist
	if err := s.contractRepo.CreateContract(ctx, contract); err != nil {
		return nil, err
	}
	return contract, nil
}

func (s *ContractService) Get(ctx context.Context, id uuid.UUID) (*domain.Contract, error) {
	return s.contractRepo.GetContractByID(ctx, id)
}

func (s *ContractService) GetByUser(ctx context.Context, userID uuid.UUID) ([]*domain.Contract, error) {
	// Verify user exists? Not strictly necessary for listing (will return empty), but good practice.
	if _, err := s.userRepo.GetUserByID(ctx, userID); err != nil {
		return nil, err
	}
	return s.contractRepo.GetContractsByUserID(ctx, userID)
}

func (s *ContractService) Update(ctx context.Context, id uuid.UUID, startDate time.Time, endDate *time.Time, contractType domain.ContractType, position string, salary float64) (*domain.Contract, error) {
	contract, err := s.contractRepo.GetContractByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Use validation from NewContract or ad-hoc?
	// Let's reuse logic by creating a dummy or just checking manually.
	// Re-validating critical rules:
	if contractType == domain.ContractTypeIndefinite {
		endDate = nil
	} else {
		if endDate == nil {
			return nil, domain.ErrInvalidInput // or specific error "End date required"
		}
		if endDate.Before(startDate) {
			return nil, domain.ErrInvalidInput
		}
	}

	contract.StartDate = startDate
	contract.EndDate = endDate
	contract.Type = contractType
	contract.Position = position
	contract.Salary = salary
	contract.UpdatedAt = time.Now()

	if err := s.contractRepo.UpdateContract(ctx, contract); err != nil {
		return nil, err
	}
	return contract, nil
}

func (s *ContractService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.contractRepo.DeleteContract(ctx, id)
}
