import { useState, useEffect, useCallback } from 'react';

export default function InterviewQuestionCard({ session, submitting, error, onSaveProgress, onSubmit, onBack }) {
  const questions = session?.questions || [];
  const total = questions.length;

  // Initialize answers from existing saved data
  const [answers, setAnswers] = useState(() => {
    const map = {};
    questions.forEach(q => { map[q.id] = q.answer?.answerText || ''; });
    return map;
  });
  const [current, setCurrent] = useState(0);
  const [saved, setSaved] = useState(false);

  // Re-sync if session changes
  useEffect(() => {
    const map = {};
    questions.forEach(q => { map[q.id] = q.answer?.answerText || ''; });
    setAnswers(map);
  }, [session?.id]);

  const currentQ = questions[current];
  const answered = Object.values(answers).filter(v => v.trim()).length;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  const handleChange = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
    setSaved(false);
  };

  const buildAnswerArray = useCallback(() =>
    questions.map(q => ({ questionId: q.id, answerText: answers[q.id] || '' })),
    [questions, answers]
  );

  const handleSave = async () => {
    await onSaveProgress(session.id, buildAnswerArray());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSubmit = () => {
    const unanswered = questions.filter(q => !answers[q.id]?.trim()).length;
    if (unanswered > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }
    onSubmit(session.id, buildAnswerArray());
  };

  if (total === 0) return (
    <div className="card empty-state"><p>No questions found for this session.</p></div>
  );

  const typeColors = {
    technical:      { bg: 'rgba(99,102,241,0.1)', color: '#4F46E5' },
    behavioral:     { bg: '#FEE2E2', color: '#991B1B' },
    situational:    { bg: '#FEF3C7', color: '#92400E' },
    problem_solving:{ bg: '#DCFCE7', color: '#166534' },
  };
  const tc = typeColors[currentQ?.questionType] || typeColors.technical;

  return (
    <div style={{ maxWidth: '760px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px' }}>
            {session?.job?.title}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            {session?.job?.companyName}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={onBack} style={{ fontSize: '13px' }}>
          ← Exit
        </button>
      </div>

      {/* Progress bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
          <span>Question {current + 1} of {total}</span>
          <span>{answered}/{total} answered · {progress}%</span>
        </div>
        <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6366F1, #22C55E)', borderRadius: '999px', transition: 'width 0.4s ease' }} />
        </div>
        {/* Question dots */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrent(i)}
              style={{
                width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: 700,
                background: i === current ? '#6366F1' : answers[q.id]?.trim() ? '#22C55E' : '#E5E7EB',
                color: i === current || answers[q.id]?.trim() ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <span style={{ background: tc.bg, color: tc.color, borderRadius: '999px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize' }}>
            {currentQ?.questionType?.replace('_', ' ')}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Q{current + 1}</span>
        </div>

        <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.6', marginBottom: '18px' }}>
          {currentQ?.questionText}
        </p>

        <label className="form-label">Your Answer</label>
        <textarea
          value={answers[currentQ?.id] || ''}
          onChange={e => handleChange(currentQ.id, e.target.value)}
          placeholder="Type your answer here..."
          rows={7}
          style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '0' }}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="alert-error" style={{ marginBottom: '14px' }}>⚠ {error}</div>
      )}

      {/* Navigation & actions */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          className="btn btn-ghost"
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
        >
          ← Previous
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => setCurrent(c => Math.min(total - 1, c + 1))}
          disabled={current === total - 1}
        >
          Next →
        </button>
        <button className="btn btn-ghost" onClick={handleSave} style={{ marginLeft: 'auto' }}>
          {saved ? '✓ Saved' : '💾 Save Progress'}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting}
          style={{ padding: '11px 24px' }}
        >
          {submitting ? '⏳ Evaluating…' : '✅ Submit Interview'}
        </button>
      </div>
    </div>
  );
}
