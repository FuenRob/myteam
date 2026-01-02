package domain

import "errors"

var (
	ErrNotFound      = errors.New("not found")
	ErrDuplicate     = errors.New("already exists")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrInternal      = errors.New("internal error")
	ErrInvalidInput  = errors.New("invalid input")
)
