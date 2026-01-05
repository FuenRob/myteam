package postgres

import (
	"context"
	"database/sql"
	"errors"

	"github.com/fuenr/myteam/internal/domain"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

// --- CompanyRepository ---

func (r *Repository) CreateCompany(ctx context.Context, c *domain.Company) error {
	query := `INSERT INTO companies (id, name, cif, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)`
	_, err := r.db.ExecContext(ctx, query, c.ID, c.Name, c.CIF, c.CreatedAt, c.UpdatedAt)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.ErrDuplicate
		}
		return err
	}
	return nil
}

func (r *Repository) GetCompanyByID(ctx context.Context, id uuid.UUID) (*domain.Company, error) {
	query := `SELECT id, name, cif, created_at, updated_at FROM companies WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)
	var c domain.Company
	if err := row.Scan(&c.ID, &c.Name, &c.CIF, &c.CreatedAt, &c.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}
	return &c, nil
}

func (r *Repository) GetCompanyByCIF(ctx context.Context, cif string) (*domain.Company, error) {
	query := `SELECT id, name, cif, created_at, updated_at FROM companies WHERE cif = $1`
	row := r.db.QueryRowContext(ctx, query, cif)
	var c domain.Company
	if err := row.Scan(&c.ID, &c.Name, &c.CIF, &c.CreatedAt, &c.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}
	return &c, nil
}

func (r *Repository) UpdateCompany(ctx context.Context, c *domain.Company) error {
	query := `UPDATE companies SET name = $1, cif = $2, updated_at = $3 WHERE id = $4`
	res, err := r.db.ExecContext(ctx, query, c.Name, c.CIF, c.UpdatedAt, c.ID)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.ErrDuplicate
		}
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *Repository) DeleteCompany(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM companies WHERE id = $1`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *Repository) Count(ctx context.Context) (int64, error) {
	query := `SELECT COUNT(*) FROM companies`
	var count int64
	if err := r.db.QueryRowContext(ctx, query).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

// --- UserRepository ---

func (r *Repository) CreateUser(ctx context.Context, u *domain.User) error {
	query := `INSERT INTO users (id, company_id, name, email, password_hash, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query, u.ID, u.CompanyID, u.Name, u.Email, u.PasswordHash, u.Role, u.CreatedAt, u.UpdatedAt)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.ErrDuplicate
		}
		// Check foreign key violation for company_id if needed, but standard error is fine.
		return err
	}
	return nil
}

func (r *Repository) BatchCreateUsers(ctx context.Context, users []*domain.User) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO users (id, company_id, name, email, password_hash, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	stmt, err := tx.PrepareContext(ctx, query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, u := range users {
		_, err := stmt.ExecContext(ctx, u.ID, u.CompanyID, u.Name, u.Email, u.PasswordHash, u.Role, u.CreatedAt, u.UpdatedAt)
		if err != nil {
			if isUniqueViolation(err) {
				return domain.ErrDuplicate
			}
			return err
		}
	}

	return tx.Commit()
}

func (r *Repository) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	query := `SELECT id, company_id, name, email, password_hash, role, created_at, updated_at FROM users WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)
	var u domain.User
	if err := row.Scan(&u.ID, &u.CompanyID, &u.Name, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}
	return &u, nil
}

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `SELECT id, company_id, name, email, password_hash, role, created_at, updated_at FROM users WHERE email = $1`
	row := r.db.QueryRowContext(ctx, query, email)
	var u domain.User
	if err := row.Scan(&u.ID, &u.CompanyID, &u.Name, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}
	return &u, nil
}

func (r *Repository) GetUsersByCompanyID(ctx context.Context, companyID uuid.UUID) ([]*domain.User, error) {
	query := `SELECT id, company_id, name, email, password_hash, role, created_at, updated_at FROM users WHERE company_id = $1`
	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*domain.User
	for rows.Next() {
		var u domain.User
		if err := rows.Scan(&u.ID, &u.CompanyID, &u.Name, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, err
		}
		users = append(users, &u)
	}
	return users, rows.Err()
}

func (r *Repository) UpdateUser(ctx context.Context, u *domain.User) error {
	query := `UPDATE users SET name = $1, email = $2, password_hash = $3, role = $4, updated_at = $5 WHERE id = $6`
	res, err := r.db.ExecContext(ctx, query, u.Name, u.Email, u.PasswordHash, u.Role, u.UpdatedAt, u.ID)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.ErrDuplicate
		}
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *Repository) DeleteUser(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return domain.ErrNotFound
	}
	return nil
}

// isUniqueViolation checks if the error is a Postgres unique violation
func isUniqueViolation(err error) bool {
	var pqErr *pq.Error
	if errors.As(err, &pqErr) {
		return pqErr.Code == "23505"
	}
	return false
}
