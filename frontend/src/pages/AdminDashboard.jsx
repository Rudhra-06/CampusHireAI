import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ThemeToggle from '../components/shared/ThemeToggle';
import AuroraBackground from '../components/shared/AuroraBackground';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [pendingRecruiters, setPendingRecruiters] = useState([]);
  const [view, setView] = useState('analytics');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadAnalytics(), loadPendingRecruiters()]);
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data } = await api.get('/admin/analytics');
      setAnalytics(data);
    } catch {
      // stays null — handled in render
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRecruiters = async () => {
    try {
      const { data } = await api.get('/admin/recruiters/pending');
      setPendingRecruiters(data);
    } catch {
      setPendingRecruiters([]);
    }
  };

  const approveRecruiter = async (id) => {
    try {
      await api.put(`/admin/recruiters/${id}/approve`);
      await loadPendingRecruiters();
    } catch {
      alert('Failed to approve recruiter.');
    }
  };

  return (
    <AuroraBackground style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div className="sidebar-brand">
              <div className="sidebar-brand-icon">⚙️</div>
              <div><h3>CampusHire AI</h3></div>
            </div>
            <ThemeToggle />
          </div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>Admin Portal</p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>System Administrator</p>
          <span className="sidebar-role-badge">Admin</span>
        </div>

        <ul className="sidebar-menu">
          <li>
            <button onClick={() => setView('analytics')} className={view === 'analytics' ? 'active' : ''}>
              📊 Analytics
            </button>
          </li>
          <li>
            <button onClick={() => setView('recruiters')} className={view === 'recruiters' ? 'active' : ''}>
              ✅ Pending Approvals
              {pendingRecruiters.length > 0 && (
                <span className="badge badge-danger" style={{ marginLeft: 'auto', fontSize: '11px' }}>
                  {pendingRecruiters.length}
                </span>
              )}
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

          {view === 'analytics' && (
            <>
              <div className="page-header">
                <h2>Placement Statistics</h2>
                <p>Overview of platform activity and placement outcomes</p>
              </div>

              {loading && (
                <div className="card empty-state"><p>Loading analytics…</p></div>
              )}

              {!loading && !analytics && (
                <div className="card empty-state">
                  <p>Failed to load analytics. Please refresh the page.</p>
                </div>
              )}

              {!loading && analytics && (
                <>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <h4>{analytics.totalStudents}</h4>
                      <p>Total Students</p>
                    </div>
                    <div className="stat-card">
                      <h4>{analytics.totalRecruiters}</h4>
                      <p>Active Recruiters</p>
                    </div>
                    <div className="stat-card">
                      <h4>{analytics.totalJobs}</h4>
                      <p>Total Jobs</p>
                    </div>
                    <div className="stat-card">
                      <h4>{analytics.totalApplications}</h4>
                      <p>Applications</p>
                    </div>
                    <div className="stat-card">
                      <h4 style={{ color: 'var(--success)' }}>{analytics.placedStudents}</h4>
                      <p>Students Placed</p>
                    </div>
                  </div>

                  <div className="card">
                    <p className="section-title">Branch-wise Student Distribution</p>
                    {analytics.branchWise.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No data available.</p>
                    )}
                    {analytics.branchWise.map(b => (
                      <div key={b.branch} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>{b.branch}</span>
                        <span className="badge badge-info">{b.count} students</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {view === 'recruiters' && (
            <>
              <div className="page-header">
                <h2>Pending Recruiter Approvals</h2>
                <p>Review and approve recruiter registrations before they can post jobs</p>
              </div>

              {pendingRecruiters.length === 0 && (
                <div className="card empty-state">
                  <p>All caught up — no pending approvals.</p>
                </div>
              )}

              <div className="cards-grid">
                {pendingRecruiters.map(rec => (
                  <div key={rec.id} className="job-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h4>{rec.companyName}</h4>
                        <span className="badge badge-warning" style={{ marginTop: '4px' }}>Pending Approval</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Contact:</strong> {rec.name}
                      </span>
                      <span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {rec.email}
                      </span>
                    </div>
                    <button onClick={() => approveRecruiter(rec.id)} className="btn btn-success">
                      ✓ Approve Recruiter
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

        </motion.div>
      </div>
    </AuroraBackground>
  );
}
