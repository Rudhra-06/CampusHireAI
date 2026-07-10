import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const EMPTY = {
  personalInfo:  { name: '', email: '', phone: '', address: '', linkedin: '', github: '', portfolio: '' },
  summary:       '',
  education:     [],
  skills:        [],
  projects:      [],
  experience:    [],
  internships:   [],
  certifications:[],
  achievements:  [],
  languages:     [],
};

export default function useResumeBuilder() {
  const [data, setData]       = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [exists, setExists]   = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: resume } = await api.get('/resume-builder');
      if (resume) {
        setData({ ...EMPTY, ...resume });
        setExists(true);
      }
    } catch {
      setError('Failed to load resume data.');
    } finally {
      setLoading(false);
    }
  };

  const save = useCallback(async (formData) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data: saved } = await api.put('/resume-builder', formData);
      setData({ ...EMPTY, ...saved });
      setExists(true);
      setSuccess('Resume saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save resume.');
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async () => {
    try {
      await api.delete('/resume-builder');
      setData(EMPTY);
      setExists(false);
      setSuccess('Resume deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to delete resume.');
    }
  }, []);

  return { data, loading, saving, error, success, exists, save, remove, setError };
}
