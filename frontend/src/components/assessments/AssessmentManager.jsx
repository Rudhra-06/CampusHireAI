import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function AssessmentManager() {
    const [assessments, setAssessments] = useState([]);
    const [form, setForm] = useState({ title: '', description: '', durationMinutes: 60, passingScore: 50, attemptsAllowed: 1, status: 'draft' });
    const [loading, setLoading] = useState(false);

    const loadAssessments = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/assessments');
            setAssessments(data);
        } catch {
            setAssessments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAssessments(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/assessments', { ...form, durationMinutes: Number(form.durationMinutes), passingScore: Number(form.passingScore), attemptsAllowed: Number(form.attemptsAllowed) });
            setForm({ title: '', description: '', durationMinutes: 60, passingScore: 50, attemptsAllowed: 1, status: 'draft' });
            await loadAssessments();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create assessment.');
        }
    };

    return (
        <div>
            <div className="page-header">
                <h2>Assessment Management</h2>
                <p>Create and publish coding assessments for your job postings</p>
            </div>
            <div className="card" style={{ marginBottom: '16px' }}>
                <form onSubmit={handleCreate}>
                    <label className="form-label">Assessment Title</label>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                    <label className="form-label">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                    <label className="form-label">Duration (minutes)</label>
                    <input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} required />
                    <label className="form-label">Passing Score</label>
                    <input type="number" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: e.target.value })} required />
                    <label className="form-label">Attempts Allowed</label>
                    <input type="number" value={form.attemptsAllowed} onChange={(e) => setForm({ ...form, attemptsAllowed: e.target.value })} required />
                    <label className="form-label">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="closed">Closed</option>
                    </select>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>Create Assessment</button>
                </form>
            </div>
            <div className="card">
                <h3>Existing Assessments</h3>
                {loading ? <p>Loading...</p> : assessments.length === 0 ? <p>No assessments yet.</p> : assessments.map(item => (
                    <div key={item.id} style={{ borderTop: '1px solid #e5e7eb', padding: '10px 0' }}>
                        <strong>{item.title}</strong>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.description}</div>
                        <div style={{ marginTop: '6px' }}>
                            <span className="badge badge-info">{item.status}</span>
                            <span className="badge badge-info" style={{ marginLeft: '6px' }}>Duration: {item.durationMinutes}m</span>
                            <span className="badge badge-info" style={{ marginLeft: '6px' }}>Passing: {item.passingScore}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
