import multer from 'multer';
import path from 'path';
import User from '../models/User.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`)
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const resumeURL = req.file.path;
    await User.update({ resumeURL }, { where: { id: req.user.id } });
    res.json({ message: 'Resume uploaded', resumeURL });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
