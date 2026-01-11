import { useState } from 'react';
import type { ReactNode } from 'react';
import {
    LayoutDashboard,
    Users,
    Building2,
    Settings,
    LogOut,
    Bell,
    Search,
    User
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
    children: ReactNode;
    onLogout: () => void;
    currentUser: any;
}

export default function Layout({ children, onLogout, currentUser }: LayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'users', label: 'Users', icon: Users, path: '/users' },
        { id: 'companies', label: 'Companies', icon: Building2, path: '/companies' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                borderRight: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem',
                position: 'fixed',
                height: '100vh',
                backgroundColor: 'var(--color-bg)',
                zIndex: 10
            }}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)', borderRadius: '8px' }}></div>
                    <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>MyTeam</span>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: location.pathname === item.path ? 'var(--color-surface-hover)' : 'transparent',
                                color: location.pathname === item.path ? 'var(--color-text)' : 'var(--color-text-muted)',
                                border: 'none',
                                width: '100%',
                                justifyContent: 'flex-start',
                                fontSize: '0.95rem',
                                fontWeight: 500,
                            }}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <button
                    onClick={onLogout}
                    className="text-muted"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        background: 'none',
                        border: 'none',
                        marginTop: 'auto',
                        justifyContent: 'flex-start'
                    }}
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </aside>

            {/* Main Content Wrapper */}
            <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <header style={{
                    height: '70px',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 2rem',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'var(--color-bg)',
                    zIndex: 5
                }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search..."
                            style={{
                                width: '100%',
                                padding: '0.5rem 1rem 0.5rem 2.5rem',
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text)'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <button style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', padding: 0 }}>
                            <Bell size={20} />
                        </button>

                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                            >
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>{currentUser?.name || 'User'}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>{currentUser?.email || 'email@example.com'}</p>
                                </div>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 600 }}>
                                    {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
                                </div>
                            </div>

                            {isDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    marginTop: '0.5rem',
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                                    zIndex: 20,
                                    minWidth: '200px',
                                    overflow: 'hidden'
                                }}>
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            navigate(`/user/detail/${currentUser.id}`);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem 1rem',
                                            width: '100%',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-text)',
                                            textAlign: 'left',
                                            cursor: 'pointer'
                                        }}
                                        className="hover:bg-white/5"
                                    >
                                        <User size={16} />
                                        Edit Profile
                                    </button>
                                    <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.25rem 0' }}></div>
                                    <button
                                        onClick={onLogout}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem 1rem',
                                            width: '100%',
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            textAlign: 'left',
                                            cursor: 'pointer'
                                        }}
                                        className="hover:bg-white/5"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ padding: '2rem', flex: 1, overflowY: 'auto' }} onClick={() => setIsDropdownOpen(false)}>
                    {children}
                </main>
            </div>
        </div>
    );
}
