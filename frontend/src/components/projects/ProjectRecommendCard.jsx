import { useState } from 'react';

const DIFF_COLOR = {
  Beginner:     'badge-success',
  Intermediate: 'badge-warning',
  Advanced:     'badge-danger',
};

const PV_COLOR = {
  High:   'badge-success',
  Medium: 'badge-warning',
  Low:    'badge-info',
};

function MiniBar({ label, value, color }) {
  return (
    <div className="pr-mini-bar">
      <span className="pr-mini-label">{label}</span>
      <div className="pr-mini-track">
        <div className="pr-mini-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="pr-mini-val" style={{ color }}>{value}</span>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div className="pr-detail-section">
      <div className="pr-detail-title">{title}</div>
      {children}
    </div>
  );
}

function TagList({ items }) {
  if (!items?.length) return null;
  return (
    <div className="pr-tag-row">
      {items.map((t, i) => <span key={i} className="pr-tag">{t}</span>)}
    </div>
  );
}

function BulletList({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="pr-bullet-list">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

export default function ProjectRecommendCard({ project, isBookmarked, onBookmark, index }) {
  const [expanded, setExpanded] = useState(false);
  const s = project.scores || {};

  const scoreColor = (n) => n >= 80 ? 'var(--success)' : n >= 60 ? 'var(--warning)' : 'var(--error)';

  const copyToClipboard = () => {
    const text = `Project: ${project.title}\nTech Stack: ${project.techStack?.join(', ')}\nDescription: ${project.description}\nDuration: ${project.estimatedDuration}`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className={`pr-card ${expanded ? 'pr-card-expanded' : ''}`}>

      {/* ── Card header ─────────────────────────────────── */}
      <div className="pr-card-header">
        <div className="pr-card-index">#{index + 1}</div>
        <div className="pr-card-meta">
          <div className="pr-card-title-row">
            <h4 className="pr-card-title">{project.title}</h4>
            <div className="pr-card-badges">
              <span className={`badge ${DIFF_COLOR[project.difficulty] || 'badge-info'}`}>
                {project.difficulty}
              </span>
              <span className={`badge ${PV_COLOR[project.portfolioValue] || 'badge-info'}`}>
                {project.portfolioValue} Value
              </span>
            </div>
          </div>
          <div className="pr-card-sub">
            <span>📁 {project.domain}</span>
            <span>⏱ {project.estimatedDuration}</span>
            {project.industryRelevance && <span>🏢 {project.industryRelevance.split('.')[0]}</span>}
          </div>
        </div>
        <div className="pr-suitability">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke="#E5E7EB" strokeWidth="5" />
            <circle
              cx="28" cy="28" r="22" fill="none"
              stroke={scoreColor(s.suitability ?? 0)}
              strokeWidth="5"
              strokeDasharray={`${((s.suitability ?? 0) / 100) * 138.2} 138.2`}
              strokeLinecap="round"
              transform="rotate(-90 28 28)"
            />
            <text x="28" y="32" textAnchor="middle" fontSize="12" fontWeight="800" fill={scoreColor(s.suitability ?? 0)}>
              {s.suitability ?? 0}%
            </text>
          </svg>
          <span className="pr-suit-label">Fit</span>
        </div>
      </div>

      {/* ── Tech stack ──────────────────────────────────── */}
      <div className="pr-tech-row">
        {project.techStack?.map(t => <span key={t} className="pr-tech-tag">{t}</span>)}
      </div>

      {/* ── Description ─────────────────────────────────── */}
      <p className="pr-description">{project.description}</p>

      {/* ── Score bars ──────────────────────────────────── */}
      <div className="pr-scores-row">
        <MiniBar label="Recruiter Appeal" value={s.recruiterAppeal ?? 0} color={scoreColor(s.recruiterAppeal ?? 0)} />
        <MiniBar label="Innovation"       value={s.innovation      ?? 0} color={scoreColor(s.innovation      ?? 0)} />
        <MiniBar label="Hiring Trend"     value={s.hiringTrend     ?? 0} color={scoreColor(s.hiringTrend     ?? 0)} />
      </div>

      {/* ── Resume impact ───────────────────────────────── */}
      {project.resumeImpact && (
        <div className="pr-impact-row">
          <span className="pr-impact-icon">📄</span>
          <span className="pr-impact-text">{project.resumeImpact}</span>
        </div>
      )}

      {/* ── Action buttons ──────────────────────────────── */}
      <div className="pr-actions">
        <button
          className={`pr-action-btn ${isBookmarked ? 'pr-action-bookmarked' : ''}`}
          onClick={() => onBookmark(project.title)}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          {isBookmarked ? '🔖 Saved' : '🔖 Save'}
        </button>
        <button className="pr-action-btn" onClick={copyToClipboard} title="Copy project details">
          📋 Copy
        </button>
        <button
          className="pr-action-btn pr-action-expand"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? '▲ Less Details' : '▼ Full Details'}
        </button>
      </div>

      {/* ── Expanded details ────────────────────────────── */}
      {expanded && (
        <div className="pr-expanded">
          <div className="pr-expanded-grid">

            {/* Architecture */}
            <DetailSection title="🏗️ Architecture">
              <p className="pr-detail-text">{project.architecture}</p>
            </DetailSection>

            {/* Folder structure */}
            <DetailSection title="📂 Folder Structure">
              <pre className="pr-code-block">{project.folderStructure}</pre>
            </DetailSection>

            {/* Database */}
            <DetailSection title="🗄️ Database">
              <p className="pr-detail-text">{project.databaseRecommendation}</p>
            </DetailSection>

            {/* Suggested APIs */}
            <DetailSection title="🔌 Suggested APIs & Services">
              <TagList items={project.suggestedAPIs} />
            </DetailSection>

            {/* AI Features */}
            {project.aiFeatures && project.aiFeatures !== 'None' && (
              <DetailSection title="🤖 AI Features">
                <p className="pr-detail-text">{project.aiFeatures}</p>
              </DetailSection>
            )}

            {/* Deployment */}
            <DetailSection title="🚀 Deployment">
              <p className="pr-detail-text">{project.deploymentRecommendation}</p>
            </DetailSection>

            {/* GitHub structure */}
            <DetailSection title="🐙 GitHub Structure">
              <p className="pr-detail-text">{project.githubStructure}</p>
            </DetailSection>

            {/* Future enhancements */}
            <DetailSection title="✨ Future Enhancements">
              <BulletList items={project.futureEnhancements} />
            </DetailSection>

          </div>

          {/* Learning roadmap — full width */}
          <div className="pr-roadmap">
            <div className="pr-roadmap-title">📚 Learning Roadmap</div>
            <div className="pr-roadmap-grid">

              <DetailSection title="Prerequisites">
                <BulletList items={project.prerequisites} />
              </DetailSection>

              <DetailSection title="Learning Order">
                <ol className="pr-ordered-list">
                  {project.learningOrder?.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </DetailSection>

              <DetailSection title="Expected Time">
                <p className="pr-detail-text">{project.expectedTime}</p>
              </DetailSection>

              <DetailSection title="Common Mistakes to Avoid">
                <BulletList items={project.commonMistakes} />
              </DetailSection>

            </div>

            {/* Free resources */}
            {project.freeResources?.length > 0 && (
              <DetailSection title="🆓 Free Resources">
                <ul className="pr-resource-list">
                  {project.freeResources.map((r, i) => {
                    const parts = r.split(' — ');
                    return (
                      <li key={i}>
                        {parts.length === 2
                          ? <a href={parts[1]} target="_blank" rel="noreferrer">{parts[0]}</a>
                          : r}
                      </li>
                    );
                  })}
                </ul>
              </DetailSection>
            )}

            {/* Learning outcomes */}
            {project.learningOutcomes?.length > 0 && (
              <DetailSection title="🎯 Learning Outcomes">
                <TagList items={project.learningOutcomes} />
              </DetailSection>
            )}

            {/* Interview value */}
            {project.interviewValue && (
              <DetailSection title="🎤 Interview Preparation Value">
                <p className="pr-detail-text">{project.interviewValue}</p>
              </DetailSection>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
