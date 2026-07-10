import { useState, useEffect } from 'react';
import useInterview from '../../hooks/useInterview';
import InterviewReportCard from './InterviewReportCard';
import api from '../../utils/api';

const STATUS_COLORS = {
  pending:     { bg: '#FEF3C7', color: '#92400E' },
  in_progress: { bg: '#DBEAFE', color: '#1E40AF' },
  completed:   { bg: '#DCFCE7', color: '#166534' },
};

const REC_COLORS = {
  'Strong Hire':      '#166534',
  'Hire':             '#1E40AF',
  'Consider':         '#92400E',
  'Needs Improvement':'#991B1B',
  'Reject':           '#991B1B',
};

export default function GenerateInterviewPanel() {
  const {
    sessions, loading, creating,
    loadRecruiterSessions, createInterview, loadSession, loadReport,
  } = useInterview();

  const [jobs, setJobs]               = useState([]);
  const [applicants, setApplicants]   = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [genError, setGenError]       = useState('');
  const [genSuccess, setGenSuccess]   = useState('');
  const [view, setView]               = useState('list');   // 'list' | 'generate' | 'report'
  const [activeSession, setActiveSession] = useState(null);
  const [activeReport, setActiveReport]   = useState(null);
  const [sortBy, setSortBy]           = useState('date');   // 'date' | 'score'

  useEffect(() => {
    loadRecruiterSessions();
    api.get('/jobs').then(({ data }) => setJobs(data)).catch(() => {});
  }, []);

  const handleJobChange = async (jobId) => {
    setSelectedJob(jobId);
    setApplicants([]);
    if (!jobId) return;
    try {
      const { data } = await api.get(`/jobs/${jobId}/applicants`);
      setApplicants(data);
    } catch {
      setApplicants([]);
    }
  };

  const handleGenerate = async (studentId) => {
    setGenError('');
    setGenSuccess('');
    try {
      await createInterview(studentId, Number(selectedJob));
      setGenSuccess('Interview created successfully! The student will see it in their dashboard.');
      await loadRecruiterSessions();
    } catch (err) {
      setGenError(err.message);
    }
  };

  const handleViewReport = async (sess) => {
    const full = await loadSession(sess.id);
    const rep  = await loadReport(sess.id);
    setActiveSession(full);
    setActiveReport(rep);
    setView('report');
  };

  const sorted = [...sessions].sort((a, b) => {
    if (sortBy === 'score') return (b.overallScore || 0) - (a.overallScore || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (view === 'report') {
    return (
      <div>
        <div className="page-header">
          <h2>Interview Report</h2>
          <p>{activeSession?.student?.name} · {activeSession?.job?.title}</p>
        </div>
        <InterviewReportCard
          session={activeSession}
          report={activeReport}
          onBack={() => { setView('list'); setActiveSession(null); setActiveReport(null); }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Interview Management</h2>
        <p>Generate AI interviews for applicants and review their performance</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button className={`btn ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('list')}>
          📋 All Interviews
          {sessions.length > 0 && (
            <span className="badge badge-primary" style={{ marginLeft: '6px', fontSize: '11px' }}>{sessions.length}</span>
          )}
        </button>
        <button className={`btn ${view === 'generate' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setView('generate'); setGenError(''); setGenSuccess(''); }}>
          ➕ Generate Interview
        </button>
      </div>

      {/* ── GENERATE TAB ── */}
      {view === 'generate' && (
        <div className="card" style={{ maxWidth: '640px' }}>
          <label className="form-label">Select Job *</label>
          <select value={selectedJob} onChange={e => handleJobChange(e.target.value)} style={{ width: '100%', marginBottom: '16px' }}>
            <option value="">— Choose a job —</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>

          {genError  && <div className="alert-error"   style={{ marginBottom: '12px' }}>⚠ {genError}</div>}
          {genSuccess && <div className="alert-success" style={{ marginBottom: '12px' }}>✓ {genSuccess}</div>}

          {selectedJob && applicants.length === 0 && (
            <div className="card empty-state" style={{ padding: '24px' }}>
              <p>No applicants for this job yet.</p>
            </div>
          )}

          {applicants.length > 0 && (
            <>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                Applicants ({applicants.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {applicants.map(app => {
                  const hasSession = sessions.some(s => s.studentId === app.studentId && s.jobId === Number(selectedJob));
                  return (
                    <div key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', borderRadius: '10px', padding: '12px 16px', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '15px', margin: '0 0 2px' }}>{app.student?.name}</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                          {app.student?.branch} · CGPA {app.student?.cgpa} · AI Score: {app.aiScore}%
                        </p>
                      </div>
                      {hasSession ? (
                        <span className="badge badge-success">Interview Created</span>
                      ) : (
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '13px', padding: '8px 16px' }}
                          onClick={() => handleGenerate(app.studentId)}
                          disabled={creating}
                        >
                          {creating ? '⏳ Generating…' : '🎤 Generate Interview'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── LIST TAB ── */}
      {view === 'list' && (
        <>
          {loading && <div className="card empty-state"><p>Loading interviews…</p></div>}

          {!loading && sessions.length === 0 && (
            <div className="card empty-state">
              <p>No interviews created yet. Use "Generate Interview" to get started.</p>
            </div>
          )}

          {sessions.length > 0 && (
            <>
              {/* Sort control */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Sort by:</span>
                <button className={`btn ${sortBy === 'date' ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '13px', padding: '6px 14px' }} onClick={() => setSortBy('date')}>Date</button>
                <button className={`btn ${sortBy === 'score' ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '13px', padding: '6px 14px' }} onClick={() => setSortBy('score')}>Score ↓</button>
              </div>

              <div className="cards-grid">
                {sorted.map(sess => {
                  const sc = STATUS_COLORS[sess.status] || STATUS_COLORS.pending;
                  const rec = sess.report?.recruiterRecommendation;
                  return (
                    <div key={sess.id} className="job-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h4 style={{ marginBottom: '2px' }}>{sess.student?.name}</h4>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                            {sess.job?.title} · {sess.job?.companyName}
                          </p>
                          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            {sess.student?.branch} · CGPA {sess.student?.cgpa}
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <span style={{ background: sc.bg, color: sc.color, borderRadius: '999px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize' }}>
                            {sess.status.replace('_', ' ')}
                          </span>
                          {sess.overallScore != null && (
                            <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                              {sess.overallScore}
                              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>/100</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {rec && (
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: REC_COLORS[rec] || 'var(--text-primary)' }}>
                            Recommendation: {rec}
                          </span>
                        </div>
                      )}

                      {sess.status === 'completed' && (
                        <button className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={() => handleViewReport(sess)}>
                          📊 View Report
                        </button>
                      )}
                      {sess.status !== 'completed' && (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          {sess.status === 'pending' ? 'Waiting for student to start' : 'Interview in progress'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
