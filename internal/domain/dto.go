package domain

type CreateUserRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     Role   `json:"role"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type StatItem struct {
	Title string `json:"title"`
	Value int64  `json:"value"`
	Type  string `json:"type"`
}

type DashboardStatsResponse struct {
	DisplayStats []StatItem `json:"displaystats"`
}
