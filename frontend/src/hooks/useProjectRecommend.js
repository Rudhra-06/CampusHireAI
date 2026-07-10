import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export default function useProjectRecommend() {
  const [recommendations, setRecommendations] = useState([]);
  const [preferences, setPreferences]         = useState({});
  const [bookmarks, setBookmarks]             = useState([]);
  const [updatedAt, setUpdatedAt]             = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [generating, setGenerating]           = useState(false);
  const [error, setError]                     = useState('');
  const [progress, setProgress]               = useState('');

  useEffect(() => { loadLatest(); }, []);

  const loadLatest = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/projects/recommend/latest');
      if (data) {
        setRecommendations(data.recommendations || []);
        setPreferences(data.preferences || {});
        setBookmarks(data.bookmarks || []);
        setUpdatedAt(data.updatedAt);
      }
    } catch {
      setError('Failed to load previous recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const generate = useCallback(async (prefs) => {
    setGenerating(true);
    setError('');

    const messages = [
      'Analyzing your skills and experience…',
      'Identifying skill gaps and opportunities…',
      'Matching projects to your career goal…',
      'Generating learning roadmaps…',
      'Calculating suitability scores…',
      'Finalizing your recommendations…',
    ];
    let i = 0;
    setProgress(messages[0]);
    const ticker = setInterval(() => {
      i = (i + 1) % messages.length;
      setProgress(messages[i]);
    }, 2500);

    try {
      const { data } = await api.post('/projects/recommend', prefs);
      setRecommendations(data.recommendations || []);
      setPreferences(data.preferences || {});
      setBookmarks(data.bookmarks || []);
      setUpdatedAt(data.updatedAt);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate recommendations. Please try again.');
    } finally {
      clearInterval(ticker);
      setGenerating(false);
      setProgress('');
    }
  }, []);

  const remove = useCallback(async () => {
    try {
      await api.delete('/projects/recommend');
      setRecommendations([]);
      setPreferences({});
      setBookmarks([]);
      setUpdatedAt(null);
    } catch {
      setError('Failed to delete recommendations.');
    }
  }, []);

  const toggleBookmark = useCallback(async (title) => {
    const next = bookmarks.includes(title)
      ? bookmarks.filter(b => b !== title)
      : [...bookmarks, title];
    setBookmarks(next);
    try {
      await api.patch('/projects/recommend/bookmarks', { bookmarks: next });
    } catch {
      // revert on failure
      setBookmarks(bookmarks);
    }
  }, [bookmarks]);

  return {
    recommendations, preferences, bookmarks, updatedAt,
    loading, generating, error, progress,
    generate, remove, toggleBookmark,
  };
}
