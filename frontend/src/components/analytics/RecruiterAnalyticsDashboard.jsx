import { useEffect, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import api from '../../utils/api';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626'];

export default function RecruiterAnalyticsDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const { data } = await api.get('/analytics/recruiter');
                setAnalytics(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Unable to load recruiter analytics.');
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    }, []);

    const skillEntries = useMemo(() => Object.entries(analytics?.skills || {}).slice(0, 8), [analytics]);
    const branchEntries = useMemo(() => Object.entries(analytics?.branches || {}), [analytics]);

    if (loading) return <div className="card">Loading analytics…</div>;
    if (error) return <div className="card">{error}</div>;

    return (
        <div style={{ display: 'grid', gap: '16px' }}>
            <div className="page-header">
                <h2>Recruiter Analytics</h2>
                <p>Track hiring momentum, funnel health, and candidate quality from one view.</p>
            </div>

            <div className="cards-grid">
                {[
                    { label: 'Jobs Posted', value: analytics.summary?.totalJobs || 0 },
                    { label: 'Active Jobs', value: analytics.summary?.activeJobs || 0 },
                    { label: 'Applications', value: analytics.summary?.applicationsReceived || 0 },
                    { label: 'Selected', value: analytics.summary?.selectedCandidates || 0 },
                    { label: 'Assessment Pass', value: `${analytics.summary?.assessmentPassRate || 0}%` },
                    { label: 'Avg Resume Score', value: `${analytics.summary?.averageResumeScore || 0}%` },
                ].map(item => (
                    <div key={item.label} className="card">
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>{item.label}</p>
                        <h3 style={{ fontSize: '24px', margin: 0 }}>{item.value}</h3>
                    </div>
                ))}
            </div>

            <div className="cards-grid">
                <div className="card" style={{ minHeight: '300px' }}>
                    <h4 style={{ marginTop: 0 }}>Application Funnel</h4>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={analytics.funnel || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card" style={{ minHeight: '300px' }}>
                    <h4 style={{ marginTop: 0 }}>Status Breakdown</h4>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie data={analytics.statusBreakdown || []} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                                {(analytics.statusBreakdown || []).map((entry, index) => (
                                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="cards-grid">
                <div className="card">
                    <h4 style={{ marginTop: 0 }}>Top Skills in Demand</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {skillEntries.map(([skill, count]) => (
                            <span key={skill} className="badge badge-info">{skill} · {count}</span>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h4 style={{ marginTop: 0 }}>Candidate Branches</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {branchEntries.map(([branch, count]) => (
                            <span key={branch} className="badge badge-success">{branch} · {count}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
