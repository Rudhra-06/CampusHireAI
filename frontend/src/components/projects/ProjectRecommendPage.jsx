import { useState, useMemo } from 'react';
import useProjectRecommend from '../../hooks/useProjectRecommend';
import ProjectRecommendCard from './ProjectRecommendCard';

const DOMAINS = [
  'Full Stack Web Development', 'Frontend Development', 'Backend Development',
  'Mobile Development', 'Machine Learning / AI', 'Data Engineering',
  'DevOps / Cloud', 'Cybersecurity', 'Blockchain', 'Game Development',
];

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const CAREER_GOALS = [
  'Software Engineer', 'Full Stack Developer', 'Frontend Developer',
  'Backend Developer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer',
  'Mobile Developer', 'Cloud Architect', 'Product Engineer',
];

export default function ProjectRecommendPage() {
  const {
    recommendations, preferences, bookmarks, updatedAt,
    loading, generating, error, progress,
    generate, remove, toggleBookmark,
  } = useProjectRecommend();

  const [prefs, setPrefs] = useState({
    careerGoal:      preferences.careerGoal      || 'Software Engineer',
    domain:          preferences.domain          || 'Full Stack Web Development',
    difficulty:      preferences.difficulty      || 'Intermediate',
    techStack:       preferences.techStack       || '',
    jobDescription:  preferences.jobDescription  || '',
  });

  // Filters
  const [filterDiff,   setFilterDiff]   = useState('All');
  const [filterDomain, setFilterDomain] = useState('All');
  const [filterTech,   setFilterTech]   = useState('');
  const [showBookmarks, setShowBookmarks] = useState(false);

  const setP = (k, v) => setPrefs(p => ({ ...p, [k]: v }));

  const handleGenerate = () => generate(prefs);

  const filtered = useMemo(() => {
    let list = recommendations;
    if (showBookmarks)          list = list.filter(p => bookmarks.includes(p.title));
    if (filterDiff !== 'All')   list = list.filter(p => p.difficulty === filterDiff);
    if (filterDomain !== 'All') list = list.filter(p => p.domain === filterDomain);
    if (filterTech.trim())      list = list.filter(p =>
      p.techStack?.some(t => t.toLowerCase().includes(filterTech.toLowerCase()))
    );
    return list;
  }, [recommendations, bookmarks, showBookmarks, filterDiff, filterDomain, filterTech]);

  const allDomains = useMemo(() =>
    ['All', ...new Set(recommendations.map(p => p.domain).filter(Boolean))],
    [recommendations]
  );

  return (
    <div>
      <div className="page-header">
        <h2>AI Project Recommendations</h2>
        <p>Personalized projects to build your portfolio, fill skill gaps, and impress recruiters</p>
      </div>

      {/* ── Preferences card ──────────────────────────────── */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="section-title">Your Preferences</div>
        <div className="pr-prefs-grid">
          <div>
            <label className="form-label">Career Goal</label>
            <select value={prefs.careerGoal} onChange={e => setP('careerGoal', e.target.value)} style={{ marginBottom: 0 }}>
              {CAREER_GOALS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Preferred Domain</label>
            <select value={prefs.domain} onChange={e => setP('domain', e.target.value)} style={{ marginBottom: 0 }}>
              {DOMAINS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Difficulty Level</label>
            <select value={prefs.difficulty} onChange={e => setP('difficulty', e.target.value)} style={{ marginBottom: 0 }}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Preferred Tech Stack (optional)</label>
            <input
              type="text"
              value={prefs.techStack}
              onChange={e => setP('techStack', e.target.value)}
              placeholder="e.g. React, Python, AWS"
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>
        <div style={{ marginTop: '14px' }}>
          <label className="form-label">Target Job Description (optional)</label>
          <textarea
            value={prefs.jobDescription}
            onChange={e => setP('jobDescription', e.target.value)}
            placeholder="Paste a job description to get projects tailored to that role…"
            style={{ marginBottom: 0, minHeight: '72px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={generating}
            style={{ padding: '12px 28px', fontSize: '15px' }}
          >
            {generating ? '⏳ Generating…' : recommendations.length ? '🔄 Regenerate' : '✨ Generate Projects'}
          </button>
          {recommendations.length > 0 && (
            <button className="btn btn-ghost" onClick={remove} style={{ fontSize: '14px' }}>
              🗑 Clear All
            </button>
          )}
          {updatedAt && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Last generated: {new Date(updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Loading */}
        {generating && (
          <div className="ra-loading" style={{ marginTop: '16px' }}>
            <div className="ra-spinner" />
            <p className="ra-progress-msg">{progress}</p>
          </div>
        )}

        {error && !generating && (
          <div className="alert-error" style={{ marginTop: '16px' }}>⚠ {error}</div>
        )}
      </div>

      {/* ── Empty / loading states ────────────────────────── */}
      {loading && (
        <div className="card empty-state"><p>Loading your recommendations…</p></div>
      )}

      {!loading && !generating && recommendations.length === 0 && !error && (
        <div className="card empty-state">
          <p style={{ fontSize: '28px', marginBottom: '10px' }}>💡</p>
          <p style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '6px' }}>
            No recommendations yet
          </p>
          <p>Set your preferences above and click Generate Projects to get personalized AI recommendations.</p>
        </div>
      )}

      {/* ── Filter bar ───────────────────────────────────── */}
      {recommendations.length > 0 && !generating && (
        <>
          <div className="pr-filter-bar">
            <div className="pr-filter-group">
              <label className="form-label" style={{ marginBottom: '4px' }}>Difficulty</label>
              <div className="pr-filter-pills">
                {['All', ...DIFFICULTIES].map(d => (
                  <button
                    key={d}
                    className={`pr-pill ${filterDiff === d ? 'active' : ''}`}
                    onClick={() => setFilterDiff(d)}
                  >{d}</button>
                ))}
              </div>
            </div>
            <div className="pr-filter-group">
              <label className="form-label" style={{ marginBottom: '4px' }}>Domain</label>
              <div className="pr-filter-pills">
                {allDomains.map(d => (
                  <button
                    key={d}
                    className={`pr-pill ${filterDomain === d ? 'active' : ''}`}
                    onClick={() => setFilterDomain(d)}
                  >{d}</button>
                ))}
              </div>
            </div>
            <div className="pr-filter-group">
              <label className="form-label" style={{ marginBottom: '4px' }}>Technology</label>
              <input
                type="text"
                value={filterTech}
                onChange={e => setFilterTech(e.target.value)}
                placeholder="Filter by tech…"
                style={{ marginBottom: 0, maxWidth: '200px' }}
              />
            </div>
            <div className="pr-filter-group" style={{ justifyContent: 'flex-end' }}>
              <button
                className={`pr-pill ${showBookmarks ? 'active' : ''}`}
                onClick={() => setShowBookmarks(b => !b)}
                style={{ marginTop: '22px' }}
              >
                🔖 Saved ({bookmarks.length})
              </button>
            </div>
          </div>

          {/* Results count */}
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Showing {filtered.length} of {recommendations.length} recommendations
          </div>

          {/* ── Cards grid ─────────────────────────────────── */}
          {filtered.length === 0 ? (
            <div className="card empty-state">
              <p>No projects match your current filters.</p>
            </div>
          ) : (
            <div className="pr-cards-grid">
              {filtered.map((project, i) => (
                <ProjectRecommendCard
                  key={project.title + i}
                  project={project}
                  index={recommendations.indexOf(project)}
                  isBookmarked={bookmarks.includes(project.title)}
                  onBookmark={toggleBookmark}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
