import {
    Users,
    Building2,
    Activity,
    DollarSign
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

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

interface DashboardProps {
    currentUser: any;
    onLogout: () => void;
}

export default function Dashboard({ currentUser, onLogout }: DashboardProps) {
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

    return (
        <Layout onLogout={onLogout} userEmail={currentUser?.email}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard Overview</h1>
                <p className="text-muted">Welcome back, {currentUser?.name || 'User'}! Here's what's happening today.</p>
            </div>

            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {stats.map((stat, index) => (
                    <KPICard key={index} {...stat} />
                ))}
            </div>
        </Layout>
    );
}
