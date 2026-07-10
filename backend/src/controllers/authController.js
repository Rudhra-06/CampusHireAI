import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  approved: user.approved,
  branch: user.branch,
  cgpa: user.cgpa,
  skills: user.skills || [],
  companyName: user.companyName,
});

export const register = async (req, res) => {
  try {
    const { name, email, password, role, branch, cgpa, skills, companyName } = req.body;

    if (!name?.trim() || !email?.trim() || !password || !role)
      return res.status(400).json({ message: 'name, email, password and role are required.' });

    if (!['student', 'recruiter'].includes(role))
      return res.status(400).json({ message: 'Invalid role.' });

    const existing = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existing) return res.status(400).json({ message: 'Email already exists.' });

    const userData = { name: name.trim(), email: email.trim().toLowerCase(), password, role };
    if (role === 'student') {
      userData.branch = branch;
      userData.cgpa = cgpa ? parseFloat(cgpa) : null;
      userData.skills = Array.isArray(skills) ? skills : [];
    } else if (role === 'recruiter') {
      if (!companyName?.trim())
        return res.status(400).json({ message: 'companyName is required for recruiters.' });
      userData.companyName = companyName.trim();
      userData.approved = false;
    }

    const user = await User.create(userData);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    if (user.role === 'recruiter' && !user.approved)
      return res.status(403).json({ message: 'Account pending approval.' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(user ? sanitizeUser(user) : null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.role;
    delete updates.approved;
    delete updates.id;

    await User.update(updates, { where: { id: req.user.id } });
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(user ? sanitizeUser(user) : null);
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};
