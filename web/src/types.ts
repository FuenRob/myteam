export interface Vacation {
    id: string;
    user_id: string;
    start_date: string;
    end_date: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
    updated_at: string;
}
