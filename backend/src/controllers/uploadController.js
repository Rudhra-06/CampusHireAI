import multer from 'multer';
import path from 'path';
import User from '../models/User.js';
import { uploadToS3 } from '../utils/s3.js';

// Use memory storage for cloud deployment
const storage = multer.memoryStorage();

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

    let resumeURL;
    const filename = `${req.user.id}-${Date.now()}${path.extname(req.file.originalname)}`;

    if (process.env.AWS_S3_BUCKET) {
      // Upload directly to S3 from memory buffer
      const s3Key = `resumes/${filename}`;
      resumeURL = await uploadToS3(req.file.buffer, s3Key, req.file.mimetype);
    } else {
      // Fallback for local development if AWS_S3_BUCKET is not set
      const fs = await import('fs');
      if (!fs.existsSync('uploads')) fs.mkdirSync('uploads', { recursive: true });
      const localPath = path.join('uploads', filename);
      fs.writeFileSync(localPath, req.file.buffer);
      resumeURL = localPath;
    }

    await User.update({ resumeURL }, { where: { id: req.user.id } });
    res.json({ message: 'Resume uploaded successfully', resumeURL });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload resume.' });
  }
};

