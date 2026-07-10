/* ── helpers ──────────────────────────────────────────────── */
function scoreColor(n) {
  if (n >= 80) return 'var(--success)';
  if (n >= 60) return 'var(--warning)';
  return 'var(--error)';
}

function ScoreRing({ score, label }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <div className="ra-ring-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#E5E7EB" strokeWidth="10" />
        <circle
          cx="55" cy="55" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x="55" y="51" textAnchor="middle" fontSize="20" fontWeight="800" fill={color}>{score}</text>
        <text x="55" y="66" textAnchor="middle" fontSize="9" fill="#6B7280">/ 100</text>
      </svg>
      <div className="ra-ring-label">{label}</div>
    </div>
  );
}

function ScoreBar({ label, value }) {
  return (
    <div className="ra-bar-row">
      <div className="ra-bar-label">
        <span>{label}</span>
        <span style={{ color: scoreColor(value), fontWeight: 700 }}>{value}</span>
      </div>
      <div className="ra-bar-track">
        <div
          className="ra-bar-fill"
          style={{ width: `${value}%`, background: scoreColor(value) }}
        />
      </div>
    </div>
  );
}

function InfoCard({ title, icon, items, variant = 'default' }) {
  if (!items?.length) return null;
  return (
    <div className={`ra-card ra-card-${variant}`}>
      <div className="ra-card-title">{icon} {title}</div>
      <ul className="ra-card-list">
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}

function TagCard({ title, icon, tags, variant = 'default' }) {
  if (!tags?.length) return null;
  return (
    <div className={`ra-card ra-card-${variant}`}>
      <div className="ra-card-title">{icon} {title}</div>
      <div className="ra-tag-group">
        {tags.map((t, i) => <span key={i} className={`ra-tag ra-tag-${variant}`}>{t}</span>)}
      </div>
    </div>
  );
}

/* ── main component ───────────────────────────────────────── */
export default function ResumeAnalysisResult({ result }) {
  const { analysisData: d, resumeScore, updatedAt, source, jobId } = result;
  const scores = d.scores || {};
  const kw = d.keywordAnalysis || {};

  return (
    <div className="ra-results">

      {/* ── Hero row ─────────────────────────────────────── */}
      <div className="ra-hero">
        <ScoreRing score={scores.ats ?? resumeScore ?? 0} label="ATS Score" />
        <div className="ra-hero-meta">
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Resume Analysis Report</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '10px' }}>
            Source: <strong>{source === 'auto' ? 'Auto-detected' : source === 'pdf' ? 'Uploaded PDF' : 'Resume Builder'}</strong>
            {jobId && <span> · Job-targeted</span>}
            {updatedAt && <span> · {new Date(updatedAt).toLocaleDateString()}</span>}
          </p>
          {kw.atsCompatibility && (
            <span className={`badge ${kw.atsCompatibility === 'High' ? 'badge-success' : kw.atsCompatibility === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>
              ATS Compatibility: {kw.atsCompatibility}
            </span>
          )}
          {kw.skillMatchPercent != null && (
            <span className="badge badge-info" style={{ marginLeft: '6px' }}>
              Skill Match: {kw.skillMatchPercent}%
            </span>
          )}
          {kw.keywordMatchPercent != null && (
            <span className="badge badge-primary" style={{ marginLeft: '6px' }}>
              Keyword Match: {kw.keywordMatchPercent}%
            </span>
          )}
        </div>
      </div>

      {/* ── Sub-score bars ───────────────────────────────── */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="section-title">Detailed Scores</div>
        <div className="ra-bars-grid">
          <ScoreBar label="Resume Quality"       value={scores.quality           ?? 0} />
          <ScoreBar label="Technical Skills"     value={scores.technicalSkills   ?? 0} />
          <ScoreBar label="Projects"             value={scores.projects          ?? 0} />
          <ScoreBar label="Experience"           value={scores.experience        ?? 0} />
          <ScoreBar label="Education"            value={scores.education         ?? 0} />
          <ScoreBar label="Grammar & Language"   value={scores.grammar           ?? 0} />
          <ScoreBar label="Keyword Match"        value={scores.keywords          ?? 0} />
          <ScoreBar label="Formatting"           value={scores.formatting        ?? 0} />
          <ScoreBar label="Recruiter Readability"value={scores.recruiterReadability ?? 0} />
        </div>
      </div>

      {/* ── Priority improvements ────────────────────────── */}
      {d.priorityImprovements?.length > 0 && (
        <div className="card ra-priority-card" style={{ marginBottom: '20px' }}>
          <div className="section-title">🎯 Top 5 Priority Improvements</div>
          <ol className="ra-priority-list">
            {d.priorityImprovements.map((item, i) => (
              <li key={i}>
                <span className="ra-priority-num">{i + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Keyword analysis ─────────────────────────────── */}
      {(kw.matchingKeywords?.length > 0 || kw.missingKeywords?.length > 0) && (
        <div className="ra-two-col" style={{ marginBottom: '20px' }}>
          <TagCard title="Matching Keywords" icon="✅" tags={kw.matchingKeywords} variant="success" />
          <TagCard title="Missing Keywords"  icon="❌" tags={kw.missingKeywords}  variant="danger" />
        </div>
      )}

      {/* ── Strengths & Weaknesses ───────────────────────── */}
      <div className="ra-two-col" style={{ marginBottom: '20px' }}>
        <InfoCard title="Strengths"  icon="💪" items={d.strengths}  variant="success" />
        <InfoCard title="Weaknesses" icon="⚠️" items={d.weaknesses} variant="warning" />
      </div>

      {/* ── Missing skills ───────────────────────────────── */}
      <div className="ra-two-col" style={{ marginBottom: '20px' }}>
        <TagCard title="Missing Technical Skills" icon="🔧" tags={d.missingTechnicalSkills} variant="danger" />
        <TagCard title="Missing Soft Skills"      icon="🤝" tags={d.missingSoftSkills}      variant="warning" />
      </div>

      {/* ── Bullet points & grammar ──────────────────────── */}
      <div className="ra-two-col" style={{ marginBottom: '20px' }}>
        <InfoCard title="Weak Bullet Points — How to Improve" icon="✏️" items={d.weakBulletPoints} variant="warning" />
        <InfoCard title="Grammar Issues"                       icon="📝" items={d.grammarProblems?.length ? d.grammarProblems : ['No significant grammar issues found.']} variant="default" />
      </div>

      {/* ── Suggestions row ──────────────────────────────── */}
      <div className="ra-three-col" style={{ marginBottom: '20px' }}>
        <TagCard  title="Recommended Technologies"  icon="⚡" tags={d.recommendedTechnologies}  variant="info" />
        <TagCard  title="Recommended Certifications"icon="🏆" tags={d.recommendedCertifications} variant="info" />
        <InfoCard title="Action Verb Suggestions"   icon="🚀" items={d.actionVerbSuggestions}    variant="info" />
      </div>

      {/* ── Projects & career tips ───────────────────────── */}
      <div className="ra-two-col" style={{ marginBottom: '20px' }}>
        <InfoCard title="Recommended Projects" icon="🛠️" items={d.recommendedProjects}    variant="default" />
        <InfoCard title="Career Advice"        icon="🎓" items={d.careerTips}             variant="default" />
      </div>

      {/* ── Formatting suggestions ───────────────────────── */}
      <InfoCard title="Formatting Suggestions" icon="📐" items={d.formattingSuggestions} variant="default" />

    </div>
  );
}
