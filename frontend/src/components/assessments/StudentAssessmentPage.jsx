import { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';

export default function StudentAssessmentPage() {
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [submissionId, setSubmissionId] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadSubmissions = async () => {
        try {
            const { data } = await api.get('/assessments/student');
            setSubmissions(data);
        } catch {
            setSubmissions([]);
        }
    };

    useEffect(() => { loadSubmissions(); }, []);

    const startAssessment = async (assessmentId) => {
        setLoading(true);
        try {
            const { data } = await api.post(`/assessments/${assessmentId}/start`);
            setSelectedAssessment(data.submission);
            setSubmissionId(data.submission.id);
            setQuestions(data.questions || []);
            setAnswers({});
        } catch (err) {
            alert(err.response?.data?.message || 'Unable to start assessment.');
        } finally {
            setLoading(false);
        }
    };

    const submitAssessment = async () => {
        try {
            await api.post(`/assessments/${submissionId}/submit`, { answers, codeSubmissions: [] });
            await loadSubmissions();
            setSelectedAssessment(null);
            setQuestions([]);
            setAnswers({});
            setSubmissionId(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Submission failed.');
        }
    };

    const upcoming = useMemo(() => submissions.filter(item => item.status === 'in_progress' || !item.status), [submissions]);
    const completed = useMemo(() => submissions.filter(item => item.status === 'graded' || item.status === 'submitted'), [submissions]);

    return (
        <div>
            <div className="page-header">
                <h2>Assessments</h2>
                <p>Take assigned coding assessments and review your results</p>
            </div>
            {loading && <div className="card">Loading assessment...</div>}
            {!selectedAssessment && (
                <div>
                    <div className="card" style={{ marginBottom: '16px' }}>
                        <h3>Upcoming Assessments</h3>
                        {submissions.length === 0 ? <p>No assessments available yet.</p> : submissions.map(item => (
                            <div key={item.id} style={{ borderTop: '1px solid #e5e7eb', padding: '10px 0' }}>
                                <strong>{item.assessment?.title || 'Assessment'}</strong>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{item.assessment?.description || ''}</div>
                                <button className="btn btn-primary" style={{ marginTop: '8px' }} onClick={() => startAssessment(item.assessment?.id)}>Start</button>
                            </div>
                        ))}
                    </div>
                    <div className="card">
                        <h3>Completed Assessments</h3>
                        {completed.length === 0 ? <p>No completed assessments yet.</p> : completed.map(item => (
                            <div key={item.id} style={{ borderTop: '1px solid #e5e7eb', padding: '10px 0' }}>
                                <strong>{item.assessment?.title || 'Assessment'}</strong>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Score: {item.score || 0}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {selectedAssessment && (
                <div className="card">
                    <h3>Assessment in Progress</h3>
                    {questions.map(question => (
                        <div key={question.id} style={{ borderTop: '1px solid #e5e7eb', padding: '12px 0' }}>
                            <strong>{question.prompt}</strong>
                            <div style={{ marginTop: '8px' }}>
                                <textarea
                                    value={answers[question.id] || ''}
                                    onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                                    placeholder="Type your answer here"
                                    style={{ width: '100%', minHeight: '100px' }}
                                />
                            </div>
                        </div>
                    ))}
                    <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={submitAssessment}>Submit Assessment</button>
                </div>
            )}
        </div>
    );
}
