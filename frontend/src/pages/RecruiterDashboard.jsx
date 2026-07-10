import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import GenerateInterviewPanel from '../components/interview/GenerateInterviewPanel';
import AssessmentManager from '../components/assessments/AssessmentManager';
import RecruiterAnalyticsDashboard from '../components/analytics/RecruiterAnalyticsDashboard';
import ThemeToggle from '../components/shared/ThemeToggle';
import AuroraBackground from '../components/shared/AuroraBackground';

export default function RecruiterDashboard() {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [view, setView] = useState('jobs');
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobSuccess, setJobSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    minCGPA: '',
    eligibleBranches: '',
  });

  const loadJobs = useCallback(async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch {
      setJobs([]);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const loadApplicants = useCallback(async (jobId) => {
    try {
      const { data } = await api.get(`/jobs/${jobId}/applicants`);
      setApplicants(data);
      setSelectedJob(jobId);
      setView('applicants');
    } catch {
      setApplicants([]);
      setSelectedJob(jobId);
      setView('applicants');
    }
  }, []);

  const handleCreateJob = useCallback(async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        eligibleBranches: formData.eligibleBranches.split(',').map(s => s.trim()).filter(Boolean),
        minCGPA: parseFloat(formData.minCGPA),
        companyName: user.companyName,
      });
      setFormData({ title: '', description: '', requiredSkills: '', minCGPA: '', eligibleBranches: '' });
      setJobSuccess('Job posted successfully!');
      setTimeout(() => setJobSuccess(''), 3000);
      await loadJobs();
      setView('jobs');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post job.');
    }
  }, [formData, loadJobs, user?.companyName]);

  const updateStatus = useCallback(async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      await loadApplicants(selectedJob);
    } catch {
      alert('Failed to update status.');
    }
  }, [loadApplicants, selectedJob]);

  const statusColor = (status) => {
    if (status === 'selected') return 'badge-success';
    if (status === 'rejected') return 'badge-danger';
    if (status === 'interview') return 'badge-primary';
    if (status === 'shortlisted') return 'badge-warning';
    return 'badge-info';
  };

  const sortedApplicants = useMemo(() => [...applicants].sort((a, b) => b.aiScore - a.aiScore), [applicants]);

  return (
    <AuroraBackground style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div className="sidebar-brand">
              <div className="sidebar-brand-icon">🏢</div>
              <div>
                <h3>CampusHire AI</h3>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>{user.companyName}</p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user.name}</p>
          <span className="sidebar-role-badge">Recruiter</span>
        </div>

        <ul className="sidebar-menu">
          <li>
            <button onClick={() => setView('jobs')} className={view === 'jobs' ? 'active' : ''}>
              💼 My Jobs
              {jobs.length > 0 && (
                <span className="badge badge-primary" style={{ marginLeft: 'auto', fontSize: '11px' }}>{jobs.length}</span>
              )}
            </button>
          </li>
          <li>
            <button onClick={() => setView('create')} className={view === 'create' ? 'active' : ''}>
              ➕ Post New Job
            </button>
          </li>
          {view === 'applicants' && (
            <li>
              <button className="active">
                👥 Applicants
              </button>
            </li>
          )}
          <li>
            <button onClick={() => setView('assessment')} className={view === 'assessment' ? 'active' : ''}>
              🧪 Assessments
            </button>
          </li>
          <li>
            <button onClick={() => setView('analytics')} className={view === 'analytics' ? 'active' : ''}>
              📊 Analytics
            </button>
          </li>
          <li>
            <button onClick={() => setView('interview')} className={view === 'interview' ? 'active' : ''}>
              🎤 Interview
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button onClick={logout} className="btn btn-ghost" style={{ width: '100%' }}>
            ← Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="main-content">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="content-container">

          {view === 'jobs' && (
            <>
              <div className="page-header">
                <h2>My Job Postings</h2>
                <p>Manage your active job listings and view applicants</p>
              </div>

              {jobs.length === 0 && (
                <div className="card empty-state">
                  <p>No jobs posted yet. Create your first listing.</p>
                </div>
              )}

              <div className="cards-grid">
                {jobs.map(job => (
                  <div key={job.id} className="job-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h4>{job.title}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>{job.companyName}</p>
                      </div>
                      <span className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {job.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '14px', lineHeight: '1.6' }}>{job.description}</p>
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '8px' }}>Skills:</span>
                      {(job.requiredSkills || []).map(skill => <span key={skill} className="badge badge-info">{skill}</span>)}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button onClick={() => loadApplicants(job.id)} className="btn btn-primary">
                        View Applicants →
                      </button>
                      <span className="badge badge-info">Min CGPA: {job.minCGPA}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {view === 'create' && (
            <>
              <div className="page-header">
                <h2>Post New Job</h2>
                <p>Fill in the details to create a new job listing</p>
              </div>

              <div className="card" style={{ width: '100%' }}>
                <form onSubmit={handleCreateJob}>
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                  <label className="form-label">Job Description</label>
                  <textarea
                    placeholder="Describe the role, responsibilities, and expectations..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                  <label className="form-label">Required Skills</label>
                  <input
                    type="text"
                    placeholder="React, Node.js, SQL (comma separated)"
                    value={formData.requiredSkills}
                    onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                    required
                  />
                  <label className="form-label">Minimum CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 7.5"
                    value={formData.minCGPA}
                    onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value })}
                    required
                  />
                  <label className="form-label">Eligible Branches</label>
                  <input
                    type="text"
                    placeholder="CSE, IT, ECE (comma separated)"
                    value={formData.eligibleBranches}
                    onChange={(e) => setFormData({ ...formData, eligibleBranches: e.target.value })}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
                    Post Job
                  </button>
                  {jobSuccess && <div className="alert-success" style={{ marginTop: '12px' }}>✓ {jobSuccess}</div>}
                </form>
              </div>
            </>
          )}

          {view === 'applicants' && (
            <>
              <div className="page-header">
                <h2>Applicants</h2>
                <p>Ranked by AI match score — final decisions are yours</p>
              </div>

              {applicants.length === 0 && (
                <div className="card empty-state">
                  <p>No applicants yet for this position.</p>
                </div>
              )}

              <div className="cards-grid">
                {sortedApplicants.map(app => (
                  <div key={app.id} className="job-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <h4>{app.student?.name}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{app.student?.email}</p>
                      </div>
                      <span className={`badge ${statusColor(app.status)}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Branch:</strong> {app.student?.branch}
                      </span>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>CGPA:</strong> {app.student?.cgpa}
                      </span>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '8px' }}>Skills:</span>
                      {app.student?.skills?.map(skill => <span key={skill} className="badge badge-info">{skill}</span>)}
                    </div>

                    <div className="ai-panel">
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
                        <span className="ai-score-value">{app.aiScore}%</span>
                        <span className="ai-score-label">AI Recommendation Score · Advisory only</span>
                      </div>
                      <div style={{ marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '6px' }}>Matched:</span>
                        {app.matchedSkills.map(s => <span key={s} className="badge badge-success">{s}</span>)}
                      </div>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '6px' }}>Missing:</span>
                        {app.missingSkills.map(s => <span key={s} className="badge badge-danger">{s}</span>)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => updateStatus(app.id, 'shortlisted')} className="btn btn-warning">Shortlist</button>
                      <button onClick={() => updateStatus(app.id, 'interview')} className="btn btn-primary">Interview</button>
                      <button onClick={() => updateStatus(app.id, 'selected')} className="btn btn-success">Select ✓</button>
                      <button onClick={() => updateStatus(app.id, 'rejected')} className="btn btn-danger">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {view === 'assessment' && <AssessmentManager />}
          {view === 'analytics' && <RecruiterAnalyticsDashboard />}
          {view === 'interview' && <GenerateInterviewPanel />}

        </motion.div>
      </div>
    </AuroraBackground>
  );
}
