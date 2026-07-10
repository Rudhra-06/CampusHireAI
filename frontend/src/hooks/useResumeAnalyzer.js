import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export default function useResumeAnalyzer() {
  const [result, setResult]     = useState(null);   // latest analysis record
  const [loading, setLoading]   = useState(true);   // initial load
  const [analyzing, setAnalyzing] = useState(false); // AI call in progress
  const [error, setError]       = useState('');
  const [progress, setProgress] = useState('');

  useEffect(() => { loadLatest(); }, []);

  const loadLatest = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/resume-analyzer/latest');
      setResult(data);
    } catch {
      setError('Failed to load previous analysis.');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = useCallback(async (source, jobId) => {
    setAnalyzing(true);
    setError('');
    setProgress('Extracting resume content…');

    const messages = [
      'Extracting resume content…',
      'Analyzing skills and experience…',
      'Calculating ATS compatibility…',
      'Generating improvement suggestions…',
      'Finalizing your report…',
    ];
    let i = 0;
    const ticker = setInterval(() => {
      i = (i + 1) % messages.length;
      setProgress(messages[i]);
    }, 2200);

    try {
      const payload = { source };
      if (jobId) payload.jobId = jobId;
      const { data } = await api.post('/resume-analyzer/analyze', payload);
      setResult(data);
      setProgress('');
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      clearInterval(ticker);
      setAnalyzing(false);
      setProgress('');
    }
  }, []);

  return { result, loading, analyzing, error, progress, runAnalysis };
}
