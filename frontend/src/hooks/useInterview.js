import { useState, useCallback } from 'react';
import api from '../utils/api';

export default function useInterview() {
  const [sessions, setSessions]         = useState([]);
  const [session, setSession]           = useState(null);
  const [report, setReport]             = useState(null);
  const [loading, setLoading]           = useState(false);
  const [creating, setCreating]         = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');

  const clearError = useCallback(() => setError(''), []);

  const loadStudentSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/interviews/student');
      setSessions(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load interviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRecruiterSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/interviews/recruiter');
      setSessions(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load interviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSession = useCallback(async (sessionId) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/interviews/${sessionId}`);
      setSession(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load session.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createInterview = useCallback(async (studentId, jobId) => {
    setCreating(true);
    setError('');
    try {
      const { data } = await api.post('/interviews/create', { studentId, jobId });
      setSessions(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create interview.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setCreating(false);
    }
  }, []);

  const saveProgress = useCallback(async (sessionId, answers) => {
    try {
      await api.post(`/interviews/${sessionId}/submit`, { answers, final: false });
    } catch (err) {
      console.warn('Save progress failed:', err.message);
    }
  }, []);

  const submitInterview = useCallback(async (sessionId, answers) => {
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post(`/interviews/${sessionId}/submit`, { answers, final: true });
      setSession(data);
      setReport(data.report);
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'completed', overallScore: data.overallScore, report: data.report } : s));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  }, []);

  const loadReport = useCallback(async (sessionId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/interviews/report/${sessionId}`);
      setReport(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sessions, session, report,
    loading, creating, submitting, error,
    clearError,
    loadStudentSessions, loadRecruiterSessions,
    loadSession, createInterview,
    saveProgress, submitInterview, loadReport,
  };
}
