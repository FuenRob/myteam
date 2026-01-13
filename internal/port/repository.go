package port

import (
	"context"

	"github.com/fuenr/myteam/internal/domain"
	"github.com/google/uuid"
)

type CompanyRepository interface {
	CreateCompany(ctx context.Context, company *domain.Company) error
	GetCompanyByID(ctx context.Context, id uuid.UUID) (*domain.Company, error)
	GetCompanyByCIF(ctx context.Context, cif string) (*domain.Company, error)
	UpdateCompany(ctx context.Context, company *domain.Company) error
	DeleteCompany(ctx context.Context, id uuid.UUID) error
	CountCompanies(ctx context.Context) (int64, error)
}

type UserRepository interface {
	CreateUser(ctx context.Context, user *domain.User) error
	BatchCreateUsers(ctx context.Context, users []*domain.User) error
	GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
	GetUserByEmail(ctx context.Context, email string) (*domain.User, error)
	GetUsersByCompanyID(ctx context.Context, companyID uuid.UUID) ([]*domain.User, error)
	UpdateUser(ctx context.Context, user *domain.User) error
	DeleteUser(ctx context.Context, id uuid.UUID) error
	CountUsers(ctx context.Context) (int64, error)
}

type ContractRepository interface {
	CreateContract(ctx context.Context, contract *domain.Contract) error
	GetContractByID(ctx context.Context, id uuid.UUID) (*domain.Contract, error)
	GetContractsByUserID(ctx context.Context, userID uuid.UUID) ([]*domain.Contract, error)
	UpdateContract(ctx context.Context, contract *domain.Contract) error
	DeleteContract(ctx context.Context, id uuid.UUID) error
	CountContracts(ctx context.Context) (int64, error)
	SumSalaries(ctx context.Context) (float64, error)
}
