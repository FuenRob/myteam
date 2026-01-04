package service

import (
	"context"
	"time"

	"github.com/fuenr/myteam/internal/domain"
	"github.com/fuenr/myteam/internal/port"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	userRepo    port.UserRepository
	companyRepo port.CompanyRepository
}

func NewUserService(userRepo port.UserRepository, companyRepo port.CompanyRepository) *UserService {
	return &UserService{
		userRepo:    userRepo,
		companyRepo: companyRepo,
	}
}

func (s *UserService) Create(ctx context.Context, companyID uuid.UUID, name, email, password string, role domain.Role) (*domain.User, error) {
	// Verify company exists
	if _, err := s.companyRepo.GetCompanyByID(ctx, companyID); err != nil {
		return nil, err
	}

	// Hash password using bcrypt
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	passwordHash := string(hashedBytes)

	user, err := domain.NewUser(companyID, name, email, passwordHash, role)
	if err != nil {
		return nil, err
	}

	if err := s.userRepo.CreateUser(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) BatchCreate(ctx context.Context, companyID uuid.UUID, usersReq []domain.CreateUserRequest) ([]*domain.User, error) {
	if _, err := s.companyRepo.GetCompanyByID(ctx, companyID); err != nil {
		return nil, err
	}

	var users []*domain.User

	for _, req := range usersReq {
		hashedBytes, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}
		passwordHash := string(hashedBytes)

		user, err := domain.NewUser(companyID, req.Name, req.Email, passwordHash, req.Role)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	if err := s.userRepo.BatchCreateUsers(ctx, users); err != nil {
		return nil, err
	}

	return users, nil
}

func (s *UserService) Get(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	return s.userRepo.GetUserByID(ctx, id)
}

func (s *UserService) GetByCompany(ctx context.Context, companyID uuid.UUID) ([]*domain.User, error) {
	return s.userRepo.GetUsersByCompanyID(ctx, companyID)
}

func (s *UserService) Update(ctx context.Context, id uuid.UUID, name, email string, role domain.Role) (*domain.User, error) {
	user, err := s.userRepo.GetUserByID(ctx, id)
	if err != nil {
		return nil, err
	}

	user.Name = name
	user.Email = email
	user.Role = role
	user.UpdatedAt = time.Now()

	if err := s.userRepo.UpdateUser(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.userRepo.DeleteUser(ctx, id)
}
