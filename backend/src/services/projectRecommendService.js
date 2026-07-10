import { askJSON } from './aiService.js';

/* ── Assemble student context string ─────────────────────── */
function buildContext(user, profile, analysis, prefs) {
  const lines = [];

  // From User model
  lines.push(`Branch: ${user.branch || 'Not specified'}`);
  lines.push(`CGPA: ${user.cgpa || 'Not specified'}`);
  if (user.skills?.length) lines.push(`Registered Skills: ${user.skills.join(', ')}`);

  // From Resume Builder profile
  if (profile) {
    if (profile.skills?.length)
      lines.push(`Resume Skills: ${profile.skills.join(', ')}`);
    if (profile.summary)
      lines.push(`Summary: ${profile.summary}`);
    if (profile.education?.length)
      lines.push(`Education: ${profile.education.map(e => `${e.degree} at ${e.college} (${e.year})`).join('; ')}`);
    if (profile.experience?.length)
      lines.push(`Experience: ${profile.experience.map(e => `${e.role} at ${e.company}`).join('; ')}`);
    if (profile.internships?.length)
      lines.push(`Internships: ${profile.internships.map(e => `${e.role} at ${e.company}`).join('; ')}`);
    if (profile.projects?.length)
      lines.push(`Existing Projects: ${profile.projects.map(p => `${p.name} (${p.tech})`).join('; ')}`);
    if (profile.certifications?.length)
      lines.push(`Certifications: ${profile.certifications.map(c => c.name).join(', ')}`);
  }

  // From Resume Analysis
  if (analysis?.analysisData) {
    const d = analysis.analysisData;
    if (d.missingTechnicalSkills?.length)
      lines.push(`Missing Technical Skills (from analysis): ${d.missingTechnicalSkills.join(', ')}`);
    if (d.recommendedTechnologies?.length)
      lines.push(`Recommended Technologies (from analysis): ${d.recommendedTechnologies.join(', ')}`);
    if (d.scores)
      lines.push(`Resume Scores — Projects: ${d.scores.projects}, Experience: ${d.scores.experience}, Technical: ${d.scores.technicalSkills}`);
  }

  // User preferences
  lines.push(`\nCareer Goal: ${prefs.careerGoal || 'Software Engineer'}`);
  lines.push(`Preferred Domain: ${prefs.domain || 'Full Stack Web Development'}`);
  lines.push(`Preferred Difficulty: ${prefs.difficulty || 'Intermediate'}`);
  if (prefs.techStack) lines.push(`Preferred Tech Stack: ${prefs.techStack}`);
  if (prefs.jobDescription) lines.push(`Target Job Description: ${prefs.jobDescription.substring(0, 500)}`);

  return lines.join('\n');
}

/* ── AI prompt ───────────────────────────────────────────── */
function buildPrompt(context) {
  return `You are an expert software engineering career coach and project mentor. Based on the student profile below, generate 6 highly personalized project recommendations that will maximize their resume impact and hiring chances.

STUDENT PROFILE:
${context}

Return ONLY a valid JSON object with this exact structure:
{
  "recommendations": [
    {
      "title": "<project title>",
      "difficulty": "<Beginner | Intermediate | Advanced>",
      "domain": "<e.g. Full Stack, ML, DevOps, Mobile, Data Engineering>",
      "estimatedDuration": "<e.g. 2-3 weeks>",
      "techStack": ["<tech1>", "<tech2>"],
      "requiredSkills": ["<skill1>", "<skill2>"],
      "problemStatement": "<one sentence problem this project solves>",
      "description": "<2-3 sentence project description>",
      "learningOutcomes": ["<outcome1>", "<outcome2>", "<outcome3>"],
      "portfolioValue": "<High | Medium | Low>",
      "resumeImpact": "<specific sentence on how this improves the resume>",
      "interviewValue": "<what interview topics this prepares for>",
      "industryRelevance": "<which companies or industries value this>",
      "architecture": "<brief architecture description>",
      "folderStructure": "<suggested top-level folder structure as a string>",
      "databaseRecommendation": "<recommended DB and why>",
      "suggestedAPIs": ["<API or service 1>", "<API or service 2>"],
      "aiFeatures": "<AI/ML features to add, or 'None' if not applicable>",
      "deploymentRecommendation": "<e.g. Vercel + Railway, AWS EC2, etc.>",
      "githubStructure": "<suggested repo structure note>",
      "futureEnhancements": ["<enhancement1>", "<enhancement2>"],
      "prerequisites": ["<prerequisite1>", "<prerequisite2>"],
      "learningOrder": ["<step1>", "<step2>", "<step3>"],
      "expectedTime": "<total realistic time estimate>",
      "freeResources": ["<resource name + URL>", "<resource name + URL>"],
      "commonMistakes": ["<mistake1>", "<mistake2>"],
      "scores": {
        "suitability": <integer 0-100>,
        "difficulty": <integer 0-100>,
        "innovation": <integer 0-100>,
        "recruiterAppeal": <integer 0-100>,
        "hiringTrend": <integer 0-100>
      }
    }
  ]
}`;
}

/* ── Mock fallback ───────────────────────────────────────── */
function mockRecommendations() {
  return {
    recommendations: [
      {
        title: 'Full-Stack Job Board Platform',
        difficulty: 'Intermediate',
        domain: 'Full Stack Web Development',
        estimatedDuration: '3-4 weeks',
        techStack: ['React', 'Node.js', 'PostgreSQL', 'Express'],
        requiredSkills: ['JavaScript', 'REST APIs', 'SQL', 'React Hooks'],
        problemStatement: 'Job seekers lack a centralized platform to discover and apply for campus placements.',
        description: 'Build a full-stack job board with role-based authentication, job posting, application tracking, and email notifications. Implement search and filter functionality with pagination.',
        learningOutcomes: ['Full-stack architecture', 'JWT authentication', 'Database design', 'REST API design'],
        portfolioValue: 'High',
        resumeImpact: 'Demonstrates end-to-end full-stack capability — highly valued by product companies.',
        interviewValue: 'Covers system design, database normalization, auth flows, and REST API design.',
        industryRelevance: 'Relevant to startups, HR tech companies, and product-based firms.',
        architecture: 'React SPA → Express REST API → PostgreSQL with Sequelize ORM',
        folderStructure: 'client/ (React) | server/ (Express) | server/models | server/routes | server/controllers',
        databaseRecommendation: 'PostgreSQL — relational data with complex queries and joins.',
        suggestedAPIs: ['Nodemailer for email', 'Cloudinary for file uploads'],
        aiFeatures: 'AI-powered job-resume matching score using OpenAI embeddings.',
        deploymentRecommendation: 'Frontend: Vercel | Backend: Railway | DB: Supabase',
        githubStructure: 'Monorepo with /client and /server folders, GitHub Actions CI/CD.',
        futureEnhancements: ['Real-time notifications with WebSockets', 'AI resume screening'],
        prerequisites: ['JavaScript ES6+', 'React basics', 'SQL fundamentals'],
        learningOrder: ['React state management', 'Express routing', 'PostgreSQL queries', 'JWT auth', 'Deployment'],
        expectedTime: '3-4 weeks (10-12 hrs/week)',
        freeResources: ['The Odin Project — https://theodinproject.com', 'PostgreSQL Tutorial — https://www.postgresqltutorial.com'],
        commonMistakes: ['Skipping input validation', 'Not handling async errors properly', 'Hardcoding credentials'],
        scores: { suitability: 92, difficulty: 60, innovation: 70, recruiterAppeal: 88, hiringTrend: 85 },
      },
      {
        title: 'AI-Powered Resume Analyzer CLI Tool',
        difficulty: 'Intermediate',
        domain: 'AI / Developer Tools',
        estimatedDuration: '2-3 weeks',
        techStack: ['Python', 'OpenAI API', 'FastAPI', 'PyPDF2'],
        requiredSkills: ['Python', 'REST APIs', 'Prompt Engineering'],
        problemStatement: 'Developers need a quick CLI tool to get ATS feedback on their resume before applying.',
        description: 'Build a Python CLI and FastAPI backend that parses PDF resumes, sends them to OpenAI, and returns structured ATS scores, missing keywords, and improvement suggestions.',
        learningOutcomes: ['Python scripting', 'OpenAI API integration', 'PDF parsing', 'FastAPI'],
        portfolioValue: 'High',
        resumeImpact: 'Shows AI integration skills — extremely attractive to AI-first companies.',
        interviewValue: 'Covers prompt engineering, API design, and Python best practices.',
        industryRelevance: 'Relevant to AI startups, HR tech, and developer tooling companies.',
        architecture: 'CLI → FastAPI → OpenAI GPT → JSON response',
        folderStructure: 'src/ | src/parser.py | src/analyzer.py | src/api.py | tests/',
        databaseRecommendation: 'SQLite for local caching of analysis results.',
        suggestedAPIs: ['OpenAI Chat Completions', 'PyPDF2 for PDF parsing'],
        aiFeatures: 'Core feature — GPT-based resume analysis with structured JSON output.',
        deploymentRecommendation: 'Package as PyPI library + deploy API on Railway.',
        githubStructure: 'Single repo with README, requirements.txt, and GitHub Actions tests.',
        futureEnhancements: ['Web UI with React', 'Job description comparison mode'],
        prerequisites: ['Python basics', 'REST API concepts', 'JSON handling'],
        learningOrder: ['Python file I/O', 'PDF parsing', 'OpenAI API', 'FastAPI routing', 'CLI with argparse'],
        expectedTime: '2-3 weeks (8-10 hrs/week)',
        freeResources: ['FastAPI Docs — https://fastapi.tiangolo.com', 'OpenAI Cookbook — https://cookbook.openai.com'],
        commonMistakes: ['Not handling PDF encoding errors', 'Exceeding token limits', 'No rate limiting'],
        scores: { suitability: 85, difficulty: 55, innovation: 88, recruiterAppeal: 90, hiringTrend: 92 },
      },
    ],
  };
}

/* ── Main export ─────────────────────────────────────────── */
export async function generateRecommendations(user, profile, analysis, prefs) {
  const context = buildContext(user, profile, analysis, prefs);
  try {
    const result = await askJSON(buildPrompt(context), 4000);
    if (!result.recommendations?.length) throw new Error('Empty recommendations');
    return result;
  } catch (err) {
    console.warn('AI recommendations unavailable, using mock data:', err.message);
    return mockRecommendations();
  }
}
