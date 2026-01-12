import { useState, useEffect } from 'react';
import { X, Calendar, Euro, Briefcase, Loader2, Save } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface ContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void>;
    initialData?: any;
    title: string;
    userId: string;
}

export default function ContractModal({ isOpen, onClose, onSuccess, initialData, title, userId }: ContractModalProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState('Contrato indefinido');
    const [position, setPosition] = useState('');
    const [salary, setSalary] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && initialData) {
            setStartDate(initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '');
            setEndDate(initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '');
            setType(initialData.type || 'Contrato indefinido');
            setPosition(initialData.position || '');
            setSalary(initialData.salary?.toString() || '');
        } else if (isOpen) {
            // Reset for new contract
            setStartDate(new Date().toISOString().split('T')[0]);
            setEndDate('');
            setType('Contrato indefinido');
            setPosition('');
            setSalary('');
        }
        setError('');
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let url = `/users/${userId}/contracts`;
            let method = 'POST';

            console.log('ContractModal submit:', { initialData, userId });

            if (initialData && initialData.id) {
                url = `/contracts/${initialData.id}`;
                method = 'PUT';
            }

            console.log(`Fetching: ${method} ${url}`);

            const res = await apiFetch(url, {
                method,
                body: JSON.stringify({
                    start_date: startDate,
                    end_date: endDate || null,
                    type,
                    position,
                    salary: parseFloat(salary),
                })
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
            setError(err.message || 'Failed to save contract');
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
                <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Enter the contract details below.</p>

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
                    <div className="input-group">
                        <label className="input-label">Contract Type</label>
                        <div style={{ position: 'relative' }}>
                            <Briefcase size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <select
                                className="input-field"
                                style={{ paddingLeft: '3rem', appearance: 'none' }}
                                value={type}
                                onChange={e => setType(e.target.value)}
                                required
                            >
                                <option value="Contrato indefinido">Contrato indefinido</option>
                                <option value="Contrato temporal">Contrato temporal</option>
                                <option value="Contrato formativo">Contrato formativo</option>
                                <option value="Contrato fijo-discontinuo">Contrato fijo-discontinuo</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Position</label>
                        <div style={{ position: 'relative' }}>
                            <Briefcase size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input
                                className="input-field"
                                style={{ paddingLeft: '3rem' }}
                                placeholder="e.g. Senior Developer"
                                value={position}
                                onChange={e => setPosition(e.target.value)}
                                required
                            />
                        </div>
                    </div>

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
                            <label className="input-label">End Date <span className="text-muted">(Optional)</span></label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="date"
                                    className="input-field"
                                    style={{ paddingLeft: '3rem' }}
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Annual Salary (€)</label>
                        <div style={{ position: 'relative' }}>
                            <Euro size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input
                                type="number"
                                step="0.01"
                                className="input-field"
                                style={{ paddingLeft: '3rem' }}
                                placeholder="0.00"
                                value={salary}
                                onChange={e => setSalary(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn-secondary" style={{ width: 'auto' }}>Cancel</button>
                        <button type="submit" className="btn" style={{ width: 'auto' }} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} style={{ marginRight: '8px' }} />}
                            Save Contract
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
