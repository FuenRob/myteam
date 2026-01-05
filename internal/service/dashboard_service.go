package service

import (
	"context"

	"github.com/fuenr/myteam/internal/domain"
	"github.com/fuenr/myteam/internal/port"
)

type DashboardService struct {
	companyRepo port.CompanyRepository
	userRepo    port.UserRepository
}

func NewDashboardService(companyRepo port.CompanyRepository, userRepo port.UserRepository) *DashboardService {
	return &DashboardService{
		companyRepo: companyRepo,
		userRepo:    userRepo,
	}
}

func (s *DashboardService) GetStats(ctx context.Context) (*domain.DashboardStatsResponse, error) {
	userCount, err := s.userRepo.Count(ctx)
	if err != nil {
		return nil, err
	}

	companyCount, err := s.companyRepo.Count(ctx)
	if err != nil {
		return nil, err
	}

	return &domain.DashboardStatsResponse{
		DisplayStats: []domain.StatItem{
			{Title: "Total Users", Value: userCount, Type: "users"},
			{Title: "Active Companies", Value: companyCount, Type: "companies"},
		},
	}, nil
}
