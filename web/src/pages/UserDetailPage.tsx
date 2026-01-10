import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Mail, Calendar, Shield, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../utils/api';
import Layout from '../components/Layout';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
    // company_id is not always returned or needed here unless we fetch company details
}

export default function UserDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Edit Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = currentUser?.role === 'ADMIN';

    useEffect(() => {
        if (id) {
            setLoading(true);
            apiFetch(`/users/${id}`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch user');
                    return res.json();
                })
                .then(data => {
                    setUser(data);
                    setName(data.name);
                    setEmail(data.email);
                    setRole(data.role);
                })
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await apiFetch(`/users/${user.id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, email, role })
            });

            if (!res.ok) throw new Error('Failed to update user');

            const updatedUser = await res.json();
            setUser(updatedUser);
            setSuccess('User updated successfully');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!user || !window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        setSaving(true);
        try {
            const res = await apiFetch(`/users/${user.id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete user');

            navigate('/dashboard'); // Go back to dashboard or users list
        } catch (err: any) {
            setError(err.message);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout onLogout={() => { }} userEmail={currentUser?.email}>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
                    <Loader2 className="animate-spin text-muted" size={32} />
                </div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout onLogout={() => { }} userEmail={currentUser?.email}>
                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>User not found</h2>
                    <button className="btn mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout onLogout={() => { }} userEmail={currentUser?.email}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <button
                    onClick={() => navigate('/dashboard')} // Ideally go back to Users list
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer' }}
                >
                    <ArrowLeft size={18} /> Back to Users
                </button>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600 }}>
                                {user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user.name}</h1>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>User ID: {user.id}</p>
                            </div>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={handleDelete}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                            >
                                <Trash2 size={18} /> Delete User
                            </button>
                        )}
                    </div>

                    {error && (
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Shield size={18} /> {success}
                        </div>
                    )}

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label className="input-label">Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    className="input-field"
                                    style={{ paddingLeft: '3rem' }}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    disabled={!isAdmin}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    className="input-field"
                                    style={{ paddingLeft: '3rem' }}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={!isAdmin}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Role</label>
                            <div style={{ position: 'relative' }}>
                                <Shield size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <select
                                    className="input-field"
                                    style={{ paddingLeft: '3rem', appearance: 'none' }}
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    disabled={!isAdmin}
                                >
                                    <option value="EMPLOYEE">User (Employee)</option>
                                    <option value="ADMIN">Administrator</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Joined On</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    className="input-field"
                                    style={{ paddingLeft: '3rem', opacity: 0.7 }}
                                    value={new Date(user.created_at).toLocaleDateString() + ' ' + new Date(user.created_at).toLocaleTimeString()}
                                    disabled
                                />
                            </div>
                        </div>

                        {isAdmin && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button className="btn" style={{ width: 'auto' }} onClick={handleSave} disabled={saving}>
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} style={{ marginRight: '8px' }} />}
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
