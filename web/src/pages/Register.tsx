import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Users, ArrowRight, Loader2, CheckCircle2, Plus, Trash2 } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1: Company Data
    const [companyName, setCompanyName] = useState('');
    const [cif, setCif] = useState('');
    const [createdCompanyId, setCreatedCompanyId] = useState<string | null>(null);

    // Step 2: Admin Data
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    // Step 3: Employees Data
    const [employees, setEmployees] = useState([{ name: '', email: '', password: '', role: 'EMPLOYEE' }]);

    const handleCreateCompany = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: companyName, cif })
            });
            if (!res.ok) throw new Error('Failed to create company');
            const data = await res.json();
            setCreatedCompanyId(data.id);
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async () => {
        if (!createdCompanyId) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_id: createdCompanyId,
                    name: adminName,
                    email: adminEmail,
                    password: adminPassword,
                    role: 'ADMIN'
                })
            });
            if (!res.ok) throw new Error('Failed to create admin');
            setStep(3);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBatchCreateEmployees = async () => {
        if (!createdCompanyId) return;
        setLoading(true);
        setError('');
        try {
            // Filter out empty rows
            const validEmployees = employees.filter(e => e.name && e.email && e.password);

            if (validEmployees.length > 0) {
                const res = await fetch(`/companies/${createdCompanyId}/users/batch`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(validEmployees)
                });
                if (!res.ok) throw new Error('Failed to create employees');
            }

            navigate('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addEmployeeRow = () => {
        setEmployees([...employees, { name: '', email: '', password: '', role: 'EMPLOYEE' }]);
    };

    const removeEmployeeRow = (index: number) => {
        const newEmployees = [...employees];
        newEmployees.splice(index, 1);
        setEmployees(newEmployees);
    };

    const updateEmployee = (index: number, field: string, value: string) => {
        const newEmployees = [...employees];
        (newEmployees[index] as any)[field] = value;
        setEmployees(newEmployees);
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100vw',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 50% 0%, #18181b 0%, #000000 100%)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Setup your Team</h1>
                    <p className="text-muted">Follow these steps to get started</p>
                </div>

                {/* Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
                    {[
                        { num: 1, label: 'Company', icon: Building2 },
                        { num: 2, label: 'Admin', icon: User },
                        { num: 3, label: 'Team', icon: Users }
                    ].map((s) => (
                        <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: step >= s.num ? 1 : 0.4 }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                backgroundColor: step >= s.num ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: step >= s.num ? '#fff' : 'var(--color-text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: step === s.num ? '2px solid rgba(255,255,255,0.2)' : 'none'
                            }}>
                                {step > s.num ? <CheckCircle2 size={20} /> : <s.icon size={20} />}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{s.label}</span>
                        </div>
                    ))}
                    {/* Progress Line Background (simplified) */}
                </div>

                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {/* Step Content */}
                <div style={{ minHeight: '300px' }}>
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Company Details</h3>
                            <div className="input-group">
                                <label className="input-label">Company Name</label>
                                <input className="input-field" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Inc." />
                            </div>
                            <div className="input-group">
                                <label className="input-label">CIF / Tax ID</label>
                                <input className="input-field" value={cif} onChange={e => setCif(e.target.value)} placeholder="B-12345678" />
                            </div>
                            <button className="btn mt-4" onClick={handleCreateCompany} disabled={loading || !companyName || !cif}>
                                {loading ? <Loader2 className="animate-spin" /> : <>Next Step <ArrowRight size={18} /></>}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Administrator Account</h3>
                            <div className="input-group">
                                <label className="input-label">Full Name</label>
                                <input className="input-field" value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="Admin Name" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Email</label>
                                <input className="input-field" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@company.com" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Password</label>
                                <input className="input-field" type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="••••••••" />
                            </div>
                            <button className="btn mt-4" onClick={handleCreateAdmin} disabled={loading || !adminName || !adminEmail || !adminPassword}>
                                {loading ? <Loader2 className="animate-spin" /> : <>Next Step <ArrowRight size={18} /></>}
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Add Team Members</h3>
                                <button onClick={addEmployeeRow} style={{ background: 'var(--color-surface)', border: 'none', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
                                    <Plus size={16} /> Add Row
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1rem' }}>
                                {employees.map((emp, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'start' }}>
                                        <input className="input-field" placeholder="Name" value={emp.name} onChange={e => updateEmployee(idx, 'name', e.target.value)} />
                                        <input className="input-field" placeholder="Email" value={emp.email} onChange={e => updateEmployee(idx, 'email', e.target.value)} />
                                        <input className="input-field" placeholder="Pass" type="password" value={emp.password} onChange={e => updateEmployee(idx, 'password', e.target.value)} />
                                        {employees.length > 1 && (
                                            <button onClick={() => removeEmployeeRow(idx)} style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: 'var(--radius-md)' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button className="btn" style={{ marginTop: 'auto' }} onClick={handleBatchCreateEmployees} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : <>Finish Setup <ArrowRight size={18} /></>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
