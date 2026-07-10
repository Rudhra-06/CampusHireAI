import { Op } from 'sequelize';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

const normalizeList = (value) => {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

export const createJob = async (req, res) => {
  try {
    const { title, description, requiredSkills, minCGPA, eligibleBranches } = req.body;
    const parsedMinCGPA = Number(minCGPA);
    const payload = {
      title: title?.trim(),
      description: description?.trim(),
      requiredSkills: normalizeList(requiredSkills),
      eligibleBranches: normalizeList(eligibleBranches),
      minCGPA: parsedMinCGPA,
      recruiterId: req.user.id,
      companyName: req.user.companyName,
    };

    if (!payload.title || !payload.description || Number.isNaN(parsedMinCGPA)) {
      return res.status(400).json({ message: 'Invalid job payload.' });
    }

    const job = await Job.create(payload);
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobs = async (req, res) => {
  try {
    const { role, branch, cgpa } = req.user;
    let where = {};

    if (role === 'student') {
      where = {
        status: 'active',
        eligibleBranches: { [Op.contains]: [branch] },
        minCGPA: { [Op.lte]: cgpa },
      };
    } else if (role === 'recruiter') {
      where = { recruiterId: req.user.id };
    } else {
      where = { status: 'active' };
    }

    const jobs = await Job.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const [updated] = await Job.update(req.body, { where: { id: req.params.id, recruiterId: req.user.id } });
    if (!updated) return res.status(404).json({ message: 'Job not found.' });
    const job = await Job.findByPk(req.params.id);
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const deleted = await Job.destroy({ where: { id: req.params.id, recruiterId: req.user.id } });
    if (!deleted) return res.status(404).json({ message: 'Job not found.' });
    res.json({ message: 'Job deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findOne({ where: { id: req.params.id, recruiterId: req.user.id } });
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const applications = await Application.findAll({
      where: { jobId: req.params.id },
      include: [{ model: User, as: 'student', attributes: ['name', 'email', 'branch', 'cgpa', 'skills', 'resumeURL'] }],
      order: [['aiScore', 'DESC']],
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
