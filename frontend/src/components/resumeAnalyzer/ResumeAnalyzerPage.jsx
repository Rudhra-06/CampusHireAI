import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useResumeAnalyzer from '../../hooks/useResumeAnalyzer';
import ResumeAnalysisResult from './ResumeAnalysisResult';

const SOURCE_OPTIONS = [
  { value: 'auto', label: '🔄 Auto Detect (PDF + Builder)' },
  { value: 'pdf', label: '📄 Uploaded Resume PDF' },
  { value: 'builder', label: '🛠️ Resume Builder Profile' },
];

export default function ResumeAnalyzerPage() {
  const { result, loading, analyzing, error, progress, runAnalysis } = useResumeAnalyzer();
  const [source, setSource] = useState('auto');
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    api.get('/jobs').then(({ data }) => setJobs(data)).catch(() => { });
  }, []);

  const handleAnalyze = () => runAnalysis(source, jobId || null);

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setUploadMessage('Please choose a PDF resume file first.');
      return;
    }

    setUploading(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const { data } = await api.post('/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadMessage(data.message || 'Resume uploaded successfully.');
      setSource('pdf');
      await runAnalysis('pdf', jobId || null);
    } catch (err) {
      setUploadMessage(err.response?.data?.message || 'Resume upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>AI Resume Analyzer</h2>
        <p>Get an intelligent ATS score, keyword analysis, and personalized improvement suggestions</p>
      </div>

      {/* ── Controls card ─────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="ra-controls">

          <div className="ra-control-group">
            <label className="form-label">Resume Source</label>
            <div className="ra-source-options">
              {SOURCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`ra-source-btn ${source === opt.value ? 'active' : ''}`}
                  onClick={() => setSource(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ra-control-group">
            <label className="form-label">Target Job (Optional)</label>
            <select
              value={jobId}
              onChange={e => setJobId(e.target.value)}
              style={{ marginBottom: 0 }}
            >
              <option value="">— General Software Engineering Standards —</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.title} · {j.companyName}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Select a job to get targeted keyword and skill gap analysis.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignSelf: 'flex-end' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Upload PDF Resume</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] || null);
                setUploadMessage('');
              }}
              style={{ maxWidth: '260px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                onClick={handleUploadAndAnalyze}
                disabled={analyzing || uploading || !selectedFile}
                style={{ padding: '12px 20px', fontSize: '15px' }}
              >
                {uploading ? '📤 Uploading…' : '📄 Upload & Analyze'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAnalyze}
                disabled={analyzing}
                style={{ padding: '12px 28px', fontSize: '15px' }}
              >
                {analyzing ? '⏳ Analyzing…' : '🔍 Analyze Resume'}
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Upload a PDF to save and analyze it. Existing resume-builder analysis still works as before.
            </p>
          </div>
        </div>

        {uploadMessage && (
          <div className="alert-success" style={{ marginTop: '12px' }}>{uploadMessage}</div>
        )}

        {/* Loading state */}
        {analyzing && (
          <div className="ra-loading">
            <div className="ra-spinner" />
            <p className="ra-progress-msg">{progress}</p>
          </div>
        )}

        {/* Error */}
        {error && !analyzing && (
          <div className="alert-error" style={{ marginTop: '16px' }}>⚠ {error}</div>
        )}
      </div>

      {/* ── Results ───────────────────────────────────────── */}
      {loading && (
        <div className="card empty-state"><p>Loading previous analysis…</p></div>
      )}

      {!loading && !result && !analyzing && !error && (
        <div className="card empty-state">
          <p style={{ fontSize: '28px', marginBottom: '10px' }}>🔍</p>
          <p style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '6px' }}>
            No analysis yet
          </p>
          <p>Select a resume source above and click Analyze Resume to get your AI-powered report.</p>
        </div>
      )}

      {result && !analyzing && (
        <ResumeAnalysisResult result={result} />
      )}
    </div>
  );
}
