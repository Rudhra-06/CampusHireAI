import { fn, col, literal } from 'sequelize';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

export const getPendingRecruiters = async (req, res) => {
  try {
    const recruiters = await User.findAll({
      where: { role: 'recruiter', approved: false },
      attributes: { exclude: ['password'] }
    });
    res.json(recruiters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveRecruiter = async (req, res) => {
  try {
    const [updated] = await User.update({ approved: true }, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ message: 'Recruiter not found' });
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const [
      totalStudents, totalRecruiters, totalJobs,
      totalApplications, placedStudents,
    ] = await Promise.all([
      User.count({ where: { role: 'student' } }),
      User.count({ where: { role: 'recruiter', approved: true } }),
      Job.count(),
      Application.count(),
      Application.count({ where: { status: 'selected' } }),
    ]);

    const [branchWise, recentApplications] = await Promise.all([
      User.findAll({
        where: { role: 'student' },
        attributes: ['branch', [fn('COUNT', col('id')), 'count']],
        group: ['branch'],
      }),
      Application.findAll({
        include: [
          { model: User, as: 'student', attributes: ['name', 'email'] },
          { model: Job,  as: 'job',     attributes: ['title', 'companyName'] },
        ],
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
    ]);

    res.json({
      totalStudents, totalRecruiters, totalJobs,
      totalApplications, placedStudents,
      branchWise, recentApplications,
    });
  } catch (error) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ message: 'Failed to load analytics.' });
  }
};
