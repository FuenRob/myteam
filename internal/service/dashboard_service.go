package service

import (
	"context"

	"github.com/fuenr/myteam/internal/domain"
	"github.com/fuenr/myteam/internal/port"
)

type DashboardService struct {
	companyRepo  port.CompanyRepository
	userRepo     port.UserRepository
	contractRepo port.ContractRepository
}

func NewDashboardService(companyRepo port.CompanyRepository, userRepo port.UserRepository, contractRepo port.ContractRepository) *DashboardService {
	return &DashboardService{
		companyRepo:  companyRepo,
		userRepo:     userRepo,
		contractRepo: contractRepo,
	}
}

func (s *DashboardService) GetStats(ctx context.Context) (*domain.DashboardStatsResponse, error) {
	userCount, err := s.userRepo.CountUsers(ctx)
	if err != nil {
		return nil, err
	}

	companyCount, err := s.companyRepo.CountCompanies(ctx)
	if err != nil {
		return nil, err
	}

	totalSalaries, err := s.contractRepo.SumSalaries(ctx)
	if err != nil {
		return nil, err
	}

	return &domain.DashboardStatsResponse{
		DisplayStats: []domain.StatItem{
			{Title: "Total Users", Value: userCount, Type: "users"},
			{Title: "Active Companies", Value: companyCount, Type: "companies"},
			{Title: "Annual Payroll", Value: int64(totalSalaries), Type: "salaries"},
		},
	}, nil
}
