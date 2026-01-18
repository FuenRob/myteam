import React, { useState, useEffect } from 'react';
import { X, Calendar, Loader2, Save, CheckCircle, XCircle } from 'lucide-react';
import { apiFetch } from '../utils/api';
import type { Vacation } from '../types';

interface VacationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void>;
    initialData?: Vacation | null;
    title: string;
    userId: string;
    isAdmin: boolean;
}

export default function VacationModal({ isOpen, onClose, onSuccess, initialData, title, userId, isAdmin }: VacationModalProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && initialData) {
            setStartDate(initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '');
            setEndDate(initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '');
            setStatus(initialData.status || 'PENDING');
        } else if (isOpen) {
            setStartDate(new Date().toISOString().split('T')[0]);
            setEndDate('');
            setStatus('PENDING');
        }
        setError('');
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let url = `/users/${userId}/vacations`;
            let method = 'POST';
            const body: any = {
                start_date: startDate,
                end_date: endDate,
            };

            if (initialData && initialData.id) {
                url = `/vacations/${initialData.id}`;
                method = 'PUT';
                if (isAdmin) {
                    body.status = status;
                }
                // Also allow updating dates if needed?
                body.start_date = startDate;
                body.end_date = endDate;
            }

            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const text = await res.text();
                let errorMessage = `Request failed: ${res.status} ${res.statusText}`;
                try {
                    const data = JSON.parse(text);
                    if (data && data.error) errorMessage = data.error;
                } catch (e) {
                    console.warn("Server responded with non-JSON error:", text);
                }
                throw new Error(errorMessage);
            }

            await onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save vacation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative', padding: '2rem' }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h2>
                <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Enter the vacation details below.</p>

                {error && (
                    <div style={{
                        padding: '0.75rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">Start Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="date"
                                    className="input-field"
                                    style={{ paddingLeft: '3rem' }}
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">End Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="date"
                                    className="input-field"
                                    style={{ paddingLeft: '3rem' }}
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {isAdmin && initialData && (
                        <div className="input-group">
                            <label className="input-label">Status</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="radio" name="status" value="PENDING" checked={status === 'PENDING'} onChange={() => setStatus('PENDING')} />
                                    <Loader2 size={16} /> Pending
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: status === 'APPROVED' ? 'var(--color-success)' : 'inherit' }}>
                                    <input type="radio" name="status" value="APPROVED" checked={status === 'APPROVED'} onChange={() => setStatus('APPROVED')} />
                                    <CheckCircle size={16} /> Approved
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: status === 'REJECTED' ? 'var(--color-danger)' : 'inherit' }}>
                                    <input type="radio" name="status" value="REJECTED" checked={status === 'REJECTED'} onChange={() => setStatus('REJECTED')} />
                                    <XCircle size={16} /> Rejected
                                </label>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn-secondary" style={{ width: 'auto' }}>Cancel</button>
                        <button type="submit" className="btn" style={{ width: 'auto' }} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} style={{ marginRight: '8px' }} />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
