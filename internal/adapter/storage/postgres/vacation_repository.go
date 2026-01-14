package postgres

import (
	"context"
	"database/sql"

	"github.com/fuenr/myteam/internal/domain"
	"github.com/google/uuid"
)

// --- VacationRepository ---

func (r *Repository) CreateVacation(ctx context.Context, v *domain.Vacation) error {
	query := `INSERT INTO vacations (id, user_id, start_date, end_date, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, v.ID, v.UserID, v.StartDate, v.EndDate, v.Status, v.CreatedAt, v.UpdatedAt)
	return err
}

func (r *Repository) GetVacationByID(ctx context.Context, id uuid.UUID) (*domain.Vacation, error) {
	query := `SELECT id, user_id, start_date, end_date, status, created_at, updated_at FROM vacations WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)
	var v domain.Vacation
	if err := row.Scan(&v.ID, &v.UserID, &v.StartDate, &v.EndDate, &v.Status, &v.CreatedAt, &v.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}
	return &v, nil
}

func (r *Repository) GetVacationsByUserID(ctx context.Context, userID uuid.UUID) ([]*domain.Vacation, error) {
	query := `SELECT id, user_id, start_date, end_date, status, created_at, updated_at FROM vacations WHERE user_id = $1`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var vacations []*domain.Vacation
	for rows.Next() {
		var v domain.Vacation
		if err := rows.Scan(&v.ID, &v.UserID, &v.StartDate, &v.EndDate, &v.Status, &v.CreatedAt, &v.UpdatedAt); err != nil {
			return nil, err
		}
		vacations = append(vacations, &v)
	}
	return vacations, rows.Err()
}

func (r *Repository) UpdateVacation(ctx context.Context, v *domain.Vacation) error {
	query := `UPDATE vacations SET start_date = $1, end_date = $2, status = $3, updated_at = $4 WHERE id = $5`
	res, err := r.db.ExecContext(ctx, query, v.StartDate, v.EndDate, v.Status, v.UpdatedAt, v.ID)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *Repository) DeleteVacation(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM vacations WHERE id = $1`
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
