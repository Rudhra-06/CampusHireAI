import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const REC_COLORS = {
  'Strong Hire':      { bg: '#DCFCE7', color: '#166534' },
  'Hire':             { bg: '#DBEAFE', color: '#1E40AF' },
  'Consider':         { bg: '#FEF3C7', color: '#92400E' },
  'Needs Improvement':{ bg: '#FEE2E2', color: '#991B1B' },
  'Reject':           { bg: '#FEE2E2', color: '#991B1B' },
};

function ScoreBar({ label, score, color = '#6366F1' }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
        <span>{label}</span>
        <span style={{ color: 'var(--text-primary)' }}>{score}/100</span>
      </div>
      <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: '999px', transition: 'width 0.7s ease' }} />
      </div>
    </div>
  );
}

function TagList({ items, variant = 'info' }) {
  const colors = {
    success: { bg: '#DCFCE7', color: '#166534' },
    danger:  { bg: '#FEE2E2', color: '#991B1B' },
    warning: { bg: '#FEF3C7', color: '#92400E' },
    info:    { bg: 'rgba(99,102,241,0.1)', color: '#4F46E5' },
  };
  const c = colors[variant] || colors.info;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {(items || []).map((item, i) => (
        <span key={i} style={{ background: c.bg, color: c.color, borderRadius: '999px', padding: '4px 12px', fontSize: '12px', fontWeight: 600 }}>
          {item}
        </span>
      ))}
    </div>
  );
}

export default function InterviewReportCard({ session, report, onBack }) {
  const printRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Interview Report — ${session?.student?.name || 'Candidate'}`,
    pageStyle: '@page { size: A4; margin: 18mm; }',
  });

  if (!report) return (
    <div className="card empty-state">
      <p>Report not available yet.</p>
      {onBack && <button className="btn btn-ghost" style={{ marginTop: '12px' }} onClick={onBack}>← Back</button>}
    </div>
  );

  const rec = report.recruiterRecommendation;
  const recStyle = REC_COLORS[rec] || REC_COLORS['Consider'];

  const scoreColors = {
    technical:      '#6366F1',
    communication:  '#22C55E',
    problemSolving: '#F59E0B',
    behavioral:     '#EC4899',
    confidence:     '#14B8A6',
  };

  return (
    <div>
      {/* Header actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        {onBack && (
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        )}
        <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
          <button className="btn btn-success" onClick={handlePrint}>📄 Download Report</button>
        </div>
      </div>

      <div ref={printRef}>
        {/* Overall score card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EEF2FF 100%)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '52px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1, letterSpacing: '-2px' }}>
                {report.overallScore}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overall Score
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  {session?.student?.name || 'Candidate'}
                </h4>
                <span style={{ background: recStyle.bg, color: recStyle.color, borderRadius: '999px', padding: '4px 14px', fontSize: '13px', fontWeight: 700 }}>
                  {rec}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                {session?.job?.title} · {session?.job?.companyName}
              </p>
              {session?.student?.branch && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  {session.student.branch} · CGPA {session.student.cgpa}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Score bars */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Skill Scores
          </div>
          <ScoreBar label="Technical"       score={report.technicalScore}      color={scoreColors.technical} />
          <ScoreBar label="Communication"   score={report.communicationScore}  color={scoreColors.communication} />
          <ScoreBar label="Problem Solving" score={report.problemSolvingScore} color={scoreColors.problemSolving} />
          <ScoreBar label="Behavioral"      score={report.behavioralScore}     color={scoreColors.behavioral} />
          <ScoreBar label="Confidence"      score={report.confidenceScore}     color={scoreColors.confidence} />
        </div>

        {/* Strengths & Weaknesses */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="card" style={{ borderLeft: '4px solid #22C55E', marginBottom: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              ✓ Strengths
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {(report.strengths || []).map((s, i) => (
                <li key={i} style={{ fontSize: '13.5px', color: 'var(--text-secondary)', paddingLeft: '14px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#22C55E', fontWeight: 700 }}>›</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #EF4444', marginBottom: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              ✗ Weaknesses
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {(report.weaknesses || []).map((w, i) => (
                <li key={i} style={{ fontSize: '13.5px', color: 'var(--text-secondary)', paddingLeft: '14px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#EF4444', fontWeight: 700 }}>›</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Missing skills & suggestions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Missing Skills
            </div>
            <TagList items={report.missingSkills} variant="danger" />
          </div>
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Suggested Certifications
            </div>
            <TagList items={report.suggestedCertifications} variant="info" />
          </div>
        </div>

        {/* Learning topics */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            Suggested Learning Topics
          </div>
          <TagList items={report.suggestedTopics} variant="warning" />
        </div>

        {/* Interview summary */}
        <div className="card" style={{ borderLeft: '4px solid var(--primary)', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            Interview Summary
          </div>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>
            {report.interviewSummary}
          </p>
        </div>

        {/* Per-question answers & feedback */}
        {session?.questions?.length > 0 && (
          <div className="card">
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '16px' }}>
              Question-by-Question Breakdown
            </div>
            {session.questions.map((q, i) => (
              <div key={q.id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: i < session.questions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '10px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, flex: 1 }}>
                    Q{i + 1}. {q.questionText}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <span style={{ background: 'rgba(99,102,241,0.1)', color: '#4F46E5', borderRadius: '999px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' }}>
                      {q.questionType?.replace('_', ' ')}
                    </span>
                    {q.answer?.aiScore != null && (
                      <span style={{ background: '#DCFCE7', color: '#166534', borderRadius: '999px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}>
                        {q.answer.aiScore}/10
                      </span>
                    )}
                  </div>
                </div>
                {q.answer?.answerText && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg)', borderRadius: '8px', padding: '10px 12px', margin: '6px 0', lineHeight: '1.6' }}>
                    {q.answer.answerText}
                  </p>
                )}
                {q.answer?.aiFeedback && (
                  <p style={{ fontSize: '13px', color: '#4F46E5', margin: '4px 0 0', lineHeight: '1.5' }}>
                    💡 {q.answer.aiFeedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
