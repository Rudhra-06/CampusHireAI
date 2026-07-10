import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function StudentAnalyticsDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const { data } = await api.get('/analytics/student');
                setAnalytics(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Unable to load student analytics.');
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    }, []);

    if (loading) return <div className="card">Loading analytics…</div>;
    if (error) return <div className="card">{error}</div>;

    return (
        <div style={{ display: 'grid', gap: '16px' }}>
            <div className="page-header">
                <h2>Student Analytics</h2>
                <p>Understand your readiness, strengths, and next best actions.</p>
            </div>

            <div className="cards-grid">
                {[
                    { label: 'Profile Completion', value: `${analytics.summary?.profileCompletion || 0}%` },
                    { label: 'ATS Score', value: `${analytics.summary?.atsScore || 0}` },
                    { label: 'Readiness', value: `${analytics.summary?.readiness || 0}` },
                    { label: 'Applications', value: analytics.summary?.applicationCount || 0 },
                    { label: 'Shortlisted', value: analytics.summary?.shortlistedJobs || 0 },
                    { label: 'Interview Invitations', value: analytics.summary?.interviewInvitations || 0 },
                ].map(item => (
                    <div key={item.label} className="card">
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>{item.label}</p>
                        <h3 style={{ fontSize: '24px', margin: 0 }}>{item.value}</h3>
                    </div>
                ))}
            </div>

            <div className="cards-grid">
                <div className="card">
                    <h4 style={{ marginTop: 0 }}>Strengths</h4>
                    <ul>
                        {(analytics.strengths || []).map(item => <li key={item}>{item}</li>)}
                    </ul>
                </div>
                <div className="card">
                    <h4 style={{ marginTop: 0 }}>Improvement Areas</h4>
                    <ul>
                        {(analytics.weaknesses || []).map(item => <li key={item}>{item}</li>)}
                    </ul>
                </div>
            </div>

            <div className="cards-grid">
                <div className="card">
                    <h4 style={{ marginTop: 0 }}>Recommended Next Steps</h4>
                    <ul>
                        {(analytics.nextSteps || []).map(item => <li key={item}>{item}</li>)}
                    </ul>
                </div>
                <div className="card">
                    <h4 style={{ marginTop: 0 }}>Suggested Skills</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {(analytics.skills || []).map(skill => <span key={skill} className="badge badge-info">{skill}</span>)}
                    </div>
                </div>
            </div>
        </div>
    );
}
