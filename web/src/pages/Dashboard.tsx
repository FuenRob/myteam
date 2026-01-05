import {
    LayoutDashboard,
    Users,
    Building2,
    Settings,
    LogOut,
    Bell,
    Search,
    TrendingUp,
    Activity,
    DollarSign
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Placeholder for KPI Card Component
const KPICard = ({ title, value, change, icon: Icon, trend }: { title: string, value: string, change: string, icon: any, trend: 'up' | 'down' | 'neutral' }) => (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{title}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{value}</h3>
            </div>
            <div style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--color-primary)'
            }}>
                <Icon size={20} />
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <span style={{
                color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500
            }}>
                {trend === 'up' ? '↑' : '↓'} {change}
            </span>
            <span className="text-muted">vs last month</span>
        </div>
    </div>
);

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
    const [activeTab, setActiveTab] = useState('overview');

    interface StatData {
        title: string;
        value: string;
        change: string;
        icon: any;
        trend: 'up' | 'down' | 'neutral';
    }

    const [stats, setStats] = useState<StatData[]>([
        { title: "Total Users", value: "0", change: "0%", icon: Users, trend: 'neutral' },
        { title: "Active Companies", value: "0", change: "0%", icon: Building2, trend: 'neutral' },
        { title: "Revenue", value: "$45,231", change: "0.8%", icon: DollarSign, trend: 'down' },
        { title: "Server Usage", value: "24%", change: "5.0%", icon: Activity, trend: 'neutral' },
    ]);

    useEffect(() => {
        fetch('/dashboard/stats')
            .then(res => res.json())
            .then(data => {
                if (data && data.displaystats) {
                    setStats(prevStats => prevStats.map(stat => {
                        if (stat.title === "Total Users") {
                            const apiStat = data.displaystats.find((s: any) => s.type === "users");
                            if (apiStat) return { ...stat, value: apiStat.value.toString(), trend: 'up', change: '+1' };
                        }
                        if (stat.title === "Active Companies") {
                            const apiStat = data.displaystats.find((s: any) => s.type === "companies");
                            if (apiStat) return { ...stat, value: apiStat.value.toString(), trend: 'up', change: '+1' };
                        }
                        return stat;
                    }));
                }
            })
            .catch(err => console.error("Failed to fetch stats:", err));
    }, []);

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'companies', label: 'Companies', icon: Building2 },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                borderRight: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem'
            }}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)', borderRadius: '8px' }}></div>
                    <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>MyTeam</span>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: activeTab === item.id ? 'var(--color-surface-hover)' : 'transparent',
                                color: activeTab === item.id ? 'var(--color-text)' : 'var(--color-text-muted)',
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

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <header style={{
                    height: '70px',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 2rem'
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Admin User</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>admin@myteam.com</p>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                AU
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard Overview</h1>
                        <p className="text-muted">Welcome back! Here's what's happening today.</p>
                    </div>

                    {/* KPI Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        {stats.map((stat, index) => (
                            <KPICard key={index} {...stat} />
                        ))}
                    </div>

                    {/* Placeholder for future charts/tables */}
                    <div className="card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' }}>
                        <div className="text-center text-muted">
                            <TrendingUp size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>Advanced Analytics & Charts Coming Soon</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
