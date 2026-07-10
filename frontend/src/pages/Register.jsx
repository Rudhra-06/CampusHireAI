import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    branch: '',
    cgpa: '',
    skills: '',
    companyName: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      if (data.role === 'student') {
        data.skills = data.skills.split(',').map(s => s.trim());
        data.cgpa = parseFloat(data.cgpa);
      }
      await register(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon"><Sparkles size={18} /></div>
          <h2>Create Account</h2>
        </div>
        <p className="auth-subtitle">Join a modern placement platform for students and recruiters</p>

        {error && (
          <div className="alert-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="form-label">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <label className="form-label">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button type="button" onClick={() => setShowPassword(prev => !prev)} style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <label className="form-label">I am a</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="recruiter">Recruiter</option>
          </select>

          {formData.role === 'student' && (
            <>
              <label className="form-label">Branch</label>
              <input
                type="text"
                placeholder="e.g. CSE, IT, ECE"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                required
              />
              <label className="form-label">CGPA</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 8.5"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                required
              />
              <label className="form-label">Skills</label>
              <input
                type="text"
                placeholder="React, Node.js, Python (comma separated)"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </>
          )}

          {formData.role === 'recruiter' && (
            <>
              <label className="form-label">Company Name</label>
              <input
                type="text"
                placeholder="Acme Corp"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '4px' }}>
            Create Account
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
