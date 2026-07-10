# CampusHire AI
Intelligent Campus Placement Management System with AI-Assisted Resume Screening

## Features
- Role-based dashboards (Student, Recruiter, Admin)
- AI-powered resume-job matching
- Real-time application tracking
- Placement analytics
- Transparent AI scoring system

## Tech Stack
- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, Vite
- **AI**: OpenAI GPT-3.5
- **Authentication**: JWT

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB
- OpenAI API Key

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/campushireai
   JWT_SECRET=your_jwt_secret_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start MongoDB service

5. Run backend:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run frontend:
   ```bash
   npm run dev
   ```

4. Access application at `http://localhost:3000`

## User Roles

### Student
- Register with academic details
- Upload resume (PDF)
- View eligible jobs
- Apply for jobs
- Track application status
- View AI match scores

### Recruiter
- Register company profile
- Post job openings
- View applicants with AI scores
- Shortlist/reject candidates
- Update interview status

### Admin
- Approve recruiter registrations
- View placement analytics
- Monitor system activity

## AI Integration
The system uses OpenAI to:
- Extract skills from resumes
- Calculate match scores (0-100)
- Identify matched/missing skills
- Provide assistive recommendations

**Important**: AI scores are advisory only. Final decisions are made by recruiters.

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Get profile
- PUT `/api/auth/profile` - Update profile

### Jobs
- POST `/api/jobs` - Create job (Recruiter)
- GET `/api/jobs` - Get jobs
- GET `/api/jobs/:id/applicants` - Get applicants (Recruiter)

### Applications
- POST `/api/applications` - Apply for job (Student)
- GET `/api/applications/my` - Get my applications (Student)
- PUT `/api/applications/:id/status` - Update status (Recruiter)

### Admin
- GET `/api/admin/recruiters/pending` - Get pending recruiters
- PUT `/api/admin/recruiters/:id/approve` - Approve recruiter
- GET `/api/admin/analytics` - Get analytics

### Upload
- POST `/api/upload/resume` - Upload resume (Student)

## Database Schema

### Users
- name, email, password, role
- Student: branch, cgpa, skills, resumeURL
- Recruiter: companyName, approved

### Jobs
- title, description, requiredSkills
- minCGPA, eligibleBranches
- recruiterId, companyName

### Applications
- studentId, jobId
- aiScore, matchedSkills, missingSkills
- status (applied, shortlisted, rejected, interview, selected)

## License
MIT
