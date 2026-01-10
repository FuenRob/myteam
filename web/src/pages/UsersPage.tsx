import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, MoreVertical, Mail, Calendar } from 'lucide-react';
import CreateUserModal from '../components/CreateUserModal';
import { apiFetch } from '../utils/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface UsersPageProps {
    currentUser: any;
}

export default function UsersPage({ currentUser }: UsersPageProps) {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = useCallback(() => {
        if (currentUser?.company_id) {
            setLoading(true);
            apiFetch(`/companies/${currentUser.company_id}/users`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setUsers(data);
                    }
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [currentUser]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const res = await apiFetch(`/users/${userId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error("Failed to delete user", error);
        }
        setActiveMenu(null);
    };

    return (
        <div style={{ paddingBottom: '4rem' }} onClick={() => setActiveMenu(null)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Users</h1>
                    <p className="text-muted">Manage your team members and their account permissions here.</p>
                </div>
                {currentUser?.role === 'ADMIN' && (
                    <button className="btn" style={{ width: 'auto' }} onClick={() => setIsModalOpen(true)}>
                        <UserPlus size={18} style={{ marginRight: '8px' }} />
                        Add User
                    </button>
                )}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                        <tr>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Name</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Role</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Joined</th>
                            <th style={{ padding: '1rem 1.5rem', width: '48px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }} className="text-muted">Loading users...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }} className="text-muted">No users found.</td></tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                                            onClick={() => navigate(`/user/detail/${user.id}`)}
                                        >
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, color: 'var(--color-text)' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Mail size={12} /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            backgroundColor: user.role === 'ADMIN' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: user.role === 'ADMIN' ? '#60a5fa' : '#34d399'
                                        }}>
                                            {user.role === 'ADMIN' ? 'Admin' : 'User'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={14} />
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', position: 'relative' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === user.id ? null : user.id);
                                            }}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', padding: '0.25rem', cursor: 'pointer' }}
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {activeMenu === user.id && (
                                            <div style={{
                                                position: 'absolute',
                                                right: '1.5rem',
                                                top: '3rem',
                                                backgroundColor: 'var(--color-surface)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: 'var(--radius-md)',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                                                zIndex: 10,
                                                minWidth: '150px',
                                                overflow: 'hidden'
                                            }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/user/detail/${user.id}`); }}
                                                    style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                                                    className="hover:bg-white/5"
                                                >
                                                    View Details
                                                </button>
                                                {currentUser?.role === 'ADMIN' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id); }}
                                                        style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                                                        className="hover:bg-white/5"
                                                    >
                                                        Delete User
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchUsers}
                companyId={currentUser?.company_id}
            />
        </div>
    );
}
