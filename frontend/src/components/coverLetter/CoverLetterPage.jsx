import { useState, useRef } from 'react';
import useCoverLetter from '../../hooks/useCoverLetter';

const TONES = [
  { value: 'professional',  label: '💼 Professional' },
  { value: 'friendly',      label: '😊 Friendly' },
  { value: 'formal',        label: '🎩 Formal' },
  { value: 'confident',     label: '💪 Confident' },
  { value: 'enthusiastic',  label: '🚀 Enthusiastic' },
  { value: 'minimal',       label: '✂️ Minimal' },
  { value: 'creative',      label: '🎨 Creative' },
];

const LENGTHS = [
  { value: 'short',    label: 'Short',    desc: '~200 words' },
  { value: 'medium',   label: 'Medium',   desc: '~300 words' },
  { value: 'detailed', label: 'Detailed', desc: '~450 words' },
];

export default function CoverLetterPage() {
  const {
    jobs, history, current, generating, loadingHistory,
    progress, error,
    generate, loadLetter, deleteLetter, clearCurrent, clearError,
  } = useCoverLetter();

  const [jobId,  setJobId]  = useState('');
  const [tone,   setTone]   = useState('professional');
  const [length, setLength] = useState('medium');
  const [showCustom, setShowCustom] = useState(false);
  const [customization, setCustomization] = useState({
    additionalNotes: '', achievementsToHighlight: '', personalMotivation: '', skillsToEmphasize: '',
  });
  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  const handleGenerate = () => {
    if (!jobId) return;
    clearError();
    generate(Number(jobId), tone, length, customization);
  };

  const handleCopy = () => {
    if (!current?.letterText) return;
    navigator.clipboard.writeText(current.letterText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadTxt = () => {
    if (!current?.letterText) return;
    const blob = new Blob([current.letterText], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `cover-letter-${current.jobSnapshot?.companyName || 'job'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Cover Letter</title>
      <style>
        body { font-family: Georgia, serif; font-size: 12pt; line-height: 1.7; padding: 40px; color: #111; max-width: 700px; margin: 0 auto; }
        pre  { white-space: pre-wrap; font-family: inherit; }
      </style></head>
      <body><pre>${current.letterText}</pre></body></html>
    `);
    win.document.close();
    win.print();
  };

  const updateCustom = (key, val) => setCustomization(prev => ({ ...prev, [key]: val }));

  const selectedJob = jobs.find(j => j.id === Number(jobId));

  return (
    <div className="cl-page">
      <div className="page-header">
        <h2>✉️ AI Cover Letter Generator</h2>
        <p>Generate a personalized, ATS-friendly cover letter for any job in seconds</p>
      </div>

      <div className="cl-layout">
        {/* ── Left: Controls ── */}
        <div className="cl-left">

          {/* Job selector */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="cl-section-title">Select Job</div>
            <select value={jobId} onChange={e => setJobId(e.target.value)} style={{ marginBottom: 0 }}>
              <option value="">— Choose a job to apply for —</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.companyName} — {j.title}</option>
              ))}
            </select>
            {selectedJob && (
              <div className="cl-job-preview">
                <span className="cl-job-company">{selectedJob.companyName}</span>
                <span className="cl-job-title">{selectedJob.title}</span>
                {selectedJob.requiredSkills?.length > 0 && (
                  <div className="cl-job-skills">
                    {selectedJob.requiredSkills.slice(0, 6).map(s => (
                      <span key={s} className="badge badge-info">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tone */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="cl-section-title">Tone</div>
            <div className="cl-tone-grid">
              {TONES.map(t => (
                <button
                  key={t.value}
                  className={`cl-option-btn${tone === t.value ? ' active' : ''}`}
                  onClick={() => setTone(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="cl-section-title">Length</div>
            <div className="cl-length-row">
              {LENGTHS.map(l => (
                <button
                  key={l.value}
                  className={`cl-length-btn${length === l.value ? ' active' : ''}`}
                  onClick={() => setLength(l.value)}
                >
                  <span className="cl-length-label">{l.label}</span>
                  <span className="cl-length-desc">{l.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional customization */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <button className="cl-toggle-custom" onClick={() => setShowCustom(p => !p)}>
              ✨ Optional Customization {showCustom ? '▲' : '▼'}
            </button>
            {showCustom && (
              <div className="cl-custom-fields">
                <label className="form-label">Achievements to Highlight</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Won national hackathon, published research paper…"
                  value={customization.achievementsToHighlight}
                  onChange={e => updateCustom('achievementsToHighlight', e.target.value)}
                />
                <label className="form-label">Skills to Emphasize</label>
                <textarea
                  rows={2}
                  placeholder="e.g. React, Node.js, system design…"
                  value={customization.skillsToEmphasize}
                  onChange={e => updateCustom('skillsToEmphasize', e.target.value)}
                />
                <label className="form-label">Personal Motivation</label>
                <textarea
                  rows={2}
                  placeholder="Why do you want to work at this company specifically?"
                  value={customization.personalMotivation}
                  onChange={e => updateCustom('personalMotivation', e.target.value)}
                />
                <label className="form-label">Additional Notes</label>
                <textarea
                  rows={2}
                  placeholder="Anything else the AI should know or include…"
                  value={customization.additionalNotes}
                  onChange={e => updateCustom('additionalNotes', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="alert-error" style={{ marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Generate button */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '16px' }}
            onClick={handleGenerate}
            disabled={generating || !jobId}
          >
            {generating ? '⏳ Generating…' : '✨ Generate Cover Letter'}
          </button>

          {/* Progress */}
          {generating && (
            <div className="cl-progress">
              <div className="cl-spinner" />
              <span className="cl-progress-msg">{progress}</span>
            </div>
          )}

          {/* History */}
          {!loadingHistory && history.length > 0 && (
            <div className="card" style={{ marginTop: '20px' }}>
              <div className="cl-section-title">History</div>
              <div className="cl-history-list">
                {history.map(h => (
                  <div key={h.id} className={`cl-history-item${current?.id === h.id ? ' active' : ''}`}>
                    <button className="cl-history-load" onClick={() => loadLetter(h.id)}>
                      <span className="cl-history-company">{h.jobSnapshot?.companyName || 'Unknown'}</span>
                      <span className="cl-history-meta">{h.jobSnapshot?.title} · {h.tone} · {h.length}</span>
                      <span className="cl-history-date">{new Date(h.createdAt).toLocaleDateString()}</span>
                    </button>
                    <button className="cl-history-del" onClick={() => deleteLetter(h.id)} title="Delete">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Result viewer ── */}
        <div className="cl-right">
          {!current && !generating && (
            <div className="card empty-state" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: '40px', marginBottom: '12px' }}>✉️</p>
              <p style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                Your cover letter will appear here
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Select a job, choose your tone and length, then click Generate
              </p>
            </div>
          )}

          {generating && (
            <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div className="cl-spinner cl-spinner-lg" />
              <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '16px' }}>{progress}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>This usually takes 10–20 seconds</p>
            </div>
          )}

          {current && !generating && (
            <div className="cl-result-card">
              {/* Result header */}
              <div className="cl-result-header">
                <div>
                  <div className="cl-result-title">{current.jobSnapshot?.companyName}</div>
                  <div className="cl-result-sub">
                    {current.jobSnapshot?.title} · <span style={{ textTransform: 'capitalize' }}>{current.tone}</span> · <span style={{ textTransform: 'capitalize' }}>{current.length}</span>
                  </div>
                </div>
                <div className="cl-result-actions">
                  <button className="cl-action-btn" onClick={handleCopy}>
                    {copied ? '✅ Copied' : '📋 Copy'}
                  </button>
                  <button className="cl-action-btn" onClick={handleDownloadTxt}>
                    ⬇️ Download
                  </button>
                  <button className="cl-action-btn" onClick={handlePrint}>
                    🖨️ Print
                  </button>
                  <button className="cl-action-btn cl-action-regen" onClick={handleGenerate} disabled={!jobId}>
                    🔄 Regenerate
                  </button>
                </div>
              </div>

              {/* Letter body */}
              <div className="cl-letter-body" ref={printRef}>
                {current.letterText.split('\n').map((line, i) => (
                  <p key={i} className={line.trim() === '' ? 'cl-letter-blank' : 'cl-letter-line'}>
                    {line || '\u00A0'}
                  </p>
                ))}
              </div>

              <div className="cl-result-footer">
                <span>AI-generated · Review before sending · Advisory only</span>
                <button className="cl-action-btn" style={{ marginLeft: 'auto' }} onClick={clearCurrent}>
                  ✕ Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
