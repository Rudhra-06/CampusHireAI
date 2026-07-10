import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const PROGRESS_MESSAGES = [
  'Gathering your profile information…',
  'Analyzing job requirements…',
  'Crafting your opening paragraph…',
  'Tailoring skills and experience…',
  'Writing your closing statement…',
  'Running quality review…',
  'Finalizing your cover letter…',
];

export default function useCoverLetter() {
  const [jobs, setJobs]           = useState([]);
  const [history, setHistory]     = useState([]);
  const [current, setCurrent]     = useState(null);   // full letter record being viewed
  const [generating, setGenerating] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [progress, setProgress]   = useState('');
  const [error, setError]         = useState('');

  useEffect(() => {
    loadJobs();
    loadHistory();
  }, []);

  const loadJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch {
      // non-fatal — jobs list just stays empty
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get('/cover-letter/history');
      setHistory(data);
    } catch {
      // non-fatal
    } finally {
      setLoadingHistory(false);
    }
  };

  const generate = useCallback(async (jobId, tone, length, customization) => {
    setGenerating(true);
    setError('');
    setProgress(PROGRESS_MESSAGES[0]);

    let i = 0;
    const ticker = setInterval(() => {
      i = (i + 1) % PROGRESS_MESSAGES.length;
      setProgress(PROGRESS_MESSAGES[i]);
    }, 2000);

    try {
      const { data } = await api.post('/cover-letter/generate', {
        jobId, tone, length, customization,
      });
      setCurrent(data);
      setHistory(prev => [
        { id: data.id, tone: data.tone, length: data.length, jobSnapshot: data.jobSnapshot, jobId: data.jobId, createdAt: data.createdAt },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate cover letter. Please try again.');
    } finally {
      clearInterval(ticker);
      setGenerating(false);
      setProgress('');
    }
  }, []);

  const loadLetter = useCallback(async (id) => {
    try {
      const { data } = await api.get(`/cover-letter/${id}`);
      setCurrent(data);
    } catch {
      setError('Failed to load cover letter.');
    }
  }, []);

  const deleteLetter = useCallback(async (id) => {
    try {
      await api.delete(`/cover-letter/${id}`);
      setHistory(prev => prev.filter(h => h.id !== id));
      if (current?.id === id) setCurrent(null);
    } catch {
      setError('Failed to delete cover letter.');
    }
  }, [current]);

  const clearCurrent = () => setCurrent(null);
  const clearError   = () => setError('');

  return {
    jobs, history, current, generating, loadingHistory,
    progress, error,
    generate, loadLetter, deleteLetter, clearCurrent, clearError,
  };
}
