import { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { apiFetch } from '../utils/api';
import Layout from '../components/Layout';
import VacationModal from '../components/VacationModal';
import type { Vacation } from '../types';

interface VacationsPageProps {
    currentUser: any;
}

export default function VacationsPage({ currentUser }: VacationsPageProps) {
    const [vacations, setVacations] = useState<Vacation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
    const [editingVacation, setEditingVacation] = useState<Vacation | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        setIsAdmin(currentUser?.role === 'ADMIN');
        fetchVacations();
    }, [currentUser]);

    const fetchVacations = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // For now, always fetch current user's vacations. 
            // A separate Admin view for ALL vacations might be needed later, 
            // but for now the user request implies managing "my" vacations or "employee" adding days.
            const res = await apiFetch(`/users/${currentUser.id}/vacations`);
            if (res.ok) {
                const data = await res.json();
                setVacations(data || []);
            }
        } catch (err) {
            console.error("Failed to fetch vacations", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVacation = async (vacationId: string) => {
        if (!window.confirm('Are you sure you want to delete this vacation request?')) return;

        try {
            const res = await apiFetch(`/vacations/${vacationId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete vacation');

            // Optimistic update
            setVacations(vacations.filter(v => v.id !== vacationId));
        } catch (err: any) {
            console.error(err.message);
            // Re-fetch to be safe
            fetchVacations();
        }
    };

    const openCreateVacation = () => {
        setEditingVacation(null);
        setIsVacationModalOpen(true);
    };

    const openEditVacation = (vacation: Vacation) => {
        setEditingVacation(vacation);
        setIsVacationModalOpen(true);
    };

    return (
        <Layout onLogout={() => { }} currentUser={currentUser}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Vacations</h1>
                        <p className="text-muted">Manage your vacation requests and holidays.</p>
                    </div>
                    <button className="btn" style={{ width: 'auto' }} onClick={openCreateVacation}>
                        <Plus size={20} style={{ marginRight: '0.5rem' }} /> Request Vacation
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <Loader2 className="animate-spin text-muted" size={32} />
                    </div>
                ) : (
                    <div className="card">
                        {vacations.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    backgroundColor: 'var(--color-surface-hover)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1.5rem auto', color: 'var(--color-text-muted)'
                                }}>
                                    <Plus size={32} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No vacations found</h3>
                                <p className="text-muted" style={{ marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                                    You haven't requested any vacations yet. Click the button above to get started.
                                </p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>DATES</th>
                                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>DURATION</th>
                                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>STATUS</th>
                                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>REQUESTED ON</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vacations.map(vacation => {
                                            const start = new Date(vacation.start_date);
                                            const end = new Date(vacation.end_date);
                                            const diffTime = Math.abs(end.getTime() - start.getTime());
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

                                            return (
                                                <tr key={vacation.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 500 }}>
                                                            {start.toLocaleDateString()} — {end.toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        {diffDays} days
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '1rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 500,
                                                            backgroundColor: vacation.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : vacation.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                                            color: vacation.status === 'APPROVED' ? '#34d399' : vacation.status === 'REJECTED' ? '#ef4444' : '#eab308'
                                                        }}>
                                                            {vacation.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>
                                                        {new Date(vacation.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => openEditVacation(vacation)}
                                                                disabled={vacation.status !== 'PENDING' && !isAdmin} // Only allow user edit if pending
                                                                style={{ padding: '0.5rem', background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--color-text)', opacity: (vacation.status !== 'PENDING' && !isAdmin) ? 0.5 : 1 }}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteVacation(vacation.id)}
                                                                style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#ef4444' }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                <VacationModal
                    isOpen={isVacationModalOpen}
                    onClose={() => setIsVacationModalOpen(false)}
                    onSuccess={fetchVacations}
                    initialData={editingVacation}
                    title={editingVacation ? 'Edit Vacation' : 'Request Vacation'}
                    userId={currentUser.id}
                    isAdmin={isAdmin}
                />
            </div>
        </Layout>
    );
}
