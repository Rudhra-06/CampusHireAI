import ResumeProfile from '../models/ResumeProfile.js';

// Validate required fields before save
const validate = (body) => {
  const errors = [];
  const pi = body.personalInfo || {};
  if (!pi.name?.trim())  errors.push('Full name is required.');
  if (!pi.email?.trim()) errors.push('Email is required.');
  if (!body.education?.length) errors.push('At least one education entry is required.');
  if (!body.skills?.length)    errors.push('At least one skill is required.');
  return errors;
};

// GET /api/resume-builder
export const getResume = async (req, res) => {
  try {
    const resume = await ResumeProfile.findOne({ where: { studentId: req.user.id } });
    if (!resume) return res.json(null);
    res.json(resume);
  } catch (err) {
    console.error('getResume error:', err);
    res.status(500).json({ message: 'Failed to load resume.' });
  }
};

// POST /api/resume-builder  — create (one per student)
export const createResume = async (req, res) => {
  try {
    const existing = await ResumeProfile.findOne({ where: { studentId: req.user.id } });
    if (existing) return res.status(400).json({ message: 'Resume already exists. Use PUT to update.' });

    const errors = validate(req.body);
    if (errors.length) return res.status(422).json({ message: errors.join(' ') });

    const resume = await ResumeProfile.create({ ...req.body, studentId: req.user.id });
    res.status(201).json(resume);
  } catch (err) {
    console.error('createResume error:', err);
    res.status(500).json({ message: 'Failed to create resume.' });
  }
};

// PUT /api/resume-builder  — upsert
export const updateResume = async (req, res) => {
  try {
    const errors = validate(req.body);
    if (errors.length) return res.status(422).json({ message: errors.join(' ') });

    const [resume, created] = await ResumeProfile.findOrCreate({
      where: { studentId: req.user.id },
      defaults: { ...req.body, studentId: req.user.id }
    });

    if (!created) {
      await resume.update(req.body);
    }

    res.json(resume);
  } catch (err) {
    console.error('updateResume error:', err);
    res.status(500).json({ message: 'Failed to save resume.' });
  }
};

// DELETE /api/resume-builder
export const deleteResume = async (req, res) => {
  try {
    const deleted = await ResumeProfile.destroy({ where: { studentId: req.user.id } });
    if (!deleted) return res.status(404).json({ message: 'No resume found.' });
    res.json({ message: 'Resume deleted.' });
  } catch (err) {
    console.error('deleteResume error:', err);
    res.status(500).json({ message: 'Failed to delete resume.' });
  }
};
