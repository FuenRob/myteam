package service

import (
	"context"
	"time"

	"github.com/fuenr/myteam/internal/domain"
	"github.com/fuenr/myteam/internal/port"
	"github.com/google/uuid"
)

type CompanyService struct {
	repo port.CompanyRepository
}

func NewCompanyService(repo port.CompanyRepository) *CompanyService {
	return &CompanyService{repo: repo}
}

func (s *CompanyService) Create(ctx context.Context, name, cif string) (*domain.Company, error) {
	company, err := domain.NewCompany(name, cif)
	if err != nil {
		return nil, err
	}
	if err := s.repo.CreateCompany(ctx, company); err != nil {
		return nil, err
	}
	return company, nil
}

func (s *CompanyService) Get(ctx context.Context, id uuid.UUID) (*domain.Company, error) {
	return s.repo.GetCompanyByID(ctx, id)
}

func (s *CompanyService) Update(ctx context.Context, id uuid.UUID, name, cif string) (*domain.Company, error) {
	company, err := s.repo.GetCompanyByID(ctx, id)
	if err != nil {
		return nil, err
	}

	company.Name = name
	company.CIF = cif
	company.UpdatedAt = time.Now()

	if err := s.repo.UpdateCompany(ctx, company); err != nil {
		return nil, err
	}
	return company, nil
}

func (s *CompanyService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.DeleteCompany(ctx, id)
}
