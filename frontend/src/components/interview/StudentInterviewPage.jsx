import { useState, useEffect } from 'react';
import useInterview from '../../hooks/useInterview';
import InterviewQuestionCard from './InterviewQuestionCard';
import InterviewReportCard from './InterviewReportCard';

const STATUS_COLORS = {
  pending:     { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  in_progress: { bg: '#DBEAFE', color: '#1E40AF', label: 'In Progress' },
  completed:   { bg: '#DCFCE7', color: '#166534', label: 'Completed' },
};

export default function StudentInterviewPage() {
  const {
    sessions, session, report,
    loading, submitting, error, clearError,
    loadStudentSessions, loadSession, loadReport,
    saveProgress, submitInterview,
  } = useInterview();

  const [view, setView] = useState('list');   // 'list' | 'interview' | 'report'

  useEffect(() => {
    loadStudentSessions();
  }, []);

  const handleStart = async (sess) => {
    clearError();
    await loadSession(sess.id);
    setView('interview');
  };

  const handleViewReport = async (sess) => {
    clearError();
    await loadSession(sess.id);
    await loadReport(sess.id);
    setView('report');
  };

  const handleSubmit = async (sessionId, answers) => {
    await submitInterview(sessionId, answers);
    setView('report');
  };

  const handleBack = () => {
    clearError();
    loadStudentSessions();
    setView('list');
  };

  const pending   = sessions.filter(s => s.status !== 'completed');
  const completed = sessions.filter(s => s.status === 'completed');

  /* ── Interview-taking view ── */
  if (view === 'interview' && session) {
    return (
      <div>
        <div className="page-header">
          <h2>🎤 Interview</h2>
          <p>Answer each question thoughtfully. You can save progress and return later.</p>
        </div>
        <InterviewQuestionCard
          session={session}
          submitting={submitting}
          error={error}
          onSaveProgress={saveProgress}
          onSubmit={handleSubmit}
          onBack={handleBack}
        />
      </div>
    );
  }

  /* ── Report view ── */
  if (view === 'report' && session) {
    return (
      <div>
        <div className="page-header">
          <h2>Interview Report</h2>
          <p>Your AI-evaluated performance report</p>
        </div>
        <InterviewReportCard session={session} report={report} onBack={handleBack} />
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div>
      <div className="page-header">
        <h2>🎤 Interview</h2>
        <p>AI-simulated first-round interviews assigned by recruiters</p>
      </div>

      {loading && <div className="card empty-state"><p>Loading interviews…</p></div>}

      {!loading && sessions.length === 0 && (
        <div className="card empty-state">
          <p style={{ fontSize: '22px', marginBottom: '8px' }}>📭</p>
          <p style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '6px' }}>No Interviews Yet</p>
          <p>Recruiters will assign interviews after reviewing your application.</p>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
            Pending ({pending.length})
          </div>
          <div className="cards-grid" style={{ marginBottom: '28px' }}>
            {pending.map(sess => {
              const sc = STATUS_COLORS[sess.status];
              return (
                <div key={sess.id} className="job-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h4 style={{ marginBottom: '2px' }}>{sess.job?.title}</h4>
                      <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '15px', margin: 0 }}>{sess.job?.companyName}</p>
                    </div>
                    <span style={{ background: sc.bg, color: sc.color, borderRadius: '999px', padding: '4px 12px', fontSize: '12px', fontWeight: 700 }}>
                      {sc.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Assigned by {sess.recruiter?.name} · {sess.recruiter?.companyName}
                  </p>
                  <button className="btn btn-primary" onClick={() => handleStart(sess)}>
                    {sess.status === 'in_progress' ? '▶ Continue Interview' : '🎤 Start Interview'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
            Completed ({completed.length})
          </div>
          <div className="cards-grid">
            {completed.map(sess => (
              <div key={sess.id} className="job-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ marginBottom: '2px' }}>{sess.job?.title}</h4>
                    <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '15px', margin: 0 }}>{sess.job?.companyName}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ background: '#DCFCE7', color: '#166534', borderRadius: '999px', padding: '4px 12px', fontSize: '12px', fontWeight: 700 }}>
                      Completed
                    </span>
                    {sess.overallScore != null && (
                      <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                        {sess.overallScore}
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>/100</span>
                      </span>
                    )}
                  </div>
                </div>

                {sess.report?.recruiterRecommendation && (
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Recommendation: <strong style={{ color: 'var(--text-primary)' }}>{sess.report.recruiterRecommendation}</strong>
                    </span>
                  </div>
                )}

                {sess.report?.interviewSummary && (
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '14px' }}>
                    {sess.report.interviewSummary.slice(0, 140)}…
                  </p>
                )}

                <button className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={() => handleViewReport(sess)}>
                  📊 View Full Report
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
