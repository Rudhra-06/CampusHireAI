import User from '../models/User.js';
import ResumeProfile from '../models/ResumeProfile.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import ProjectRecommendation from '../models/ProjectRecommendation.js';
import { generateRecommendations } from '../services/projectRecommendService.js';

// POST /api/projects/recommend
export const recommend = async (req, res) => {
  try {
    const { careerGoal, domain, difficulty, techStack, jobDescription } = req.body;

    const prefs = { careerGoal, domain, difficulty, techStack, jobDescription };

    const [user, profile, analysis] = await Promise.all([
      User.findByPk(req.user.id),
      ResumeProfile.findOne({ where: { studentId: req.user.id } }),
      ResumeAnalysis.findOne({ where: { studentId: req.user.id } }),
    ]);

    const result = await generateRecommendations(user, profile, analysis, prefs);

    // Upsert — one record per student
    const [record, created] = await ProjectRecommendation.findOrCreate({
      where: { studentId: req.user.id },
      defaults: { studentId: req.user.id, recommendations: result.recommendations, preferences: prefs, bookmarks: [] },
    });

    if (!created) {
      await record.update({ recommendations: result.recommendations, preferences: prefs });
    }

    res.json({ recommendations: result.recommendations, preferences: prefs, bookmarks: record.bookmarks, updatedAt: record.updatedAt });
  } catch (err) {
    console.error('recommend error:', err);
    res.status(500).json({ message: 'Failed to generate recommendations. Please try again.' });
  }
};

// GET /api/projects/recommend/latest
export const getLatest = async (req, res) => {
  try {
    const record = await ProjectRecommendation.findOne({ where: { studentId: req.user.id } });
    if (!record) return res.json(null);
    res.json({ recommendations: record.recommendations, preferences: record.preferences, bookmarks: record.bookmarks, updatedAt: record.updatedAt });
  } catch (err) {
    console.error('getLatest error:', err);
    res.status(500).json({ message: 'Failed to load recommendations.' });
  }
};

// DELETE /api/projects/recommend
export const deleteRecommendations = async (req, res) => {
  try {
    const deleted = await ProjectRecommendation.destroy({ where: { studentId: req.user.id } });
    if (!deleted) return res.status(404).json({ message: 'No recommendations found.' });
    res.json({ message: 'Recommendations deleted.' });
  } catch (err) {
    console.error('delete error:', err);
    res.status(500).json({ message: 'Failed to delete recommendations.' });
  }
};

// PATCH /api/projects/recommend/bookmarks
export const updateBookmarks = async (req, res) => {
  try {
    const { bookmarks } = req.body;
    if (!Array.isArray(bookmarks)) return res.status(422).json({ message: 'bookmarks must be an array.' });

    const record = await ProjectRecommendation.findOne({ where: { studentId: req.user.id } });
    if (!record) return res.status(404).json({ message: 'No recommendations found.' });

    await record.update({ bookmarks });
    res.json({ bookmarks: record.bookmarks });
  } catch (err) {
    console.error('updateBookmarks error:', err);
    res.status(500).json({ message: 'Failed to update bookmarks.' });
  }
};
