import { askJSON } from './aiService.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';

/* ── Build plain-text representation of a ResumeProfile ─── */
function profileToText(profile) {
  if (!profile) return '';
  const lines = [];
  const pi = profile.personalInfo || {};

  if (pi.name)  lines.push(`Name: ${pi.name}`);
  if (pi.email) lines.push(`Email: ${pi.email}`);
  if (pi.phone) lines.push(`Phone: ${pi.phone}`);
  if (profile.summary) lines.push(`\nSummary:\n${profile.summary}`);

  if (profile.skills?.length)
    lines.push(`\nSkills: ${profile.skills.join(', ')}`);

  if (profile.education?.length) {
    lines.push('\nEducation:');
    profile.education.forEach(e =>
      lines.push(`  ${e.degree} — ${e.college} (${e.year}) CGPA: ${e.cgpa}`)
    );
  }

  if (profile.experience?.length) {
    lines.push('\nExperience:');
    profile.experience.forEach(e =>
      lines.push(`  ${e.role} at ${e.company} (${e.duration})\n  ${e.description}`)
    );
  }

  if (profile.internships?.length) {
    lines.push('\nInternships:');
    profile.internships.forEach(e =>
      lines.push(`  ${e.role} at ${e.company} (${e.duration})\n  ${e.description}`)
    );
  }

  if (profile.projects?.length) {
    lines.push('\nProjects:');
    profile.projects.forEach(p =>
      lines.push(`  ${p.name} [${p.tech}]\n  ${p.description}`)
    );
  }

  if (profile.certifications?.length) {
    lines.push('\nCertifications:');
    profile.certifications.forEach(c =>
      lines.push(`  ${c.name} — ${c.issuer} (${c.year})`)
    );
  }

  if (profile.achievements?.length) {
    lines.push('\nAchievements:');
    profile.achievements.forEach(a =>
      lines.push(`  ${a.title}: ${a.description}`)
    );
  }

  if (profile.languages?.length)
    lines.push(`\nLanguages: ${profile.languages.map(l => `${l.name} (${l.proficiency})`).join(', ')}`);

  return lines.join('\n');
}

/* ── Assemble resume text from available sources ─────────── */
export async function assembleResumeText(user, profile, source) {
  let pdfText = '';
  let profileText = '';

  const usePDF     = source === 'pdf'     || source === 'auto';
  const useProfile = source === 'builder' || source === 'auto';

  if (usePDF && user.resumeURL) {
    pdfText = await extractTextFromPDF(user.resumeURL);
  }

  if (useProfile && profile) {
    profileText = profileToText(profile);
  }

  if (!pdfText && !profileText) return null;

  // Combine without duplication — profile text is structured, PDF may add extra context
  if (pdfText && profileText) {
    return `=== RESUME BUILDER PROFILE ===\n${profileText}\n\n=== UPLOADED PDF (additional context) ===\n${pdfText.substring(0, 1500)}`;
  }
  return pdfText || profileText;
}

/* ── Build the AI analysis prompt ────────────────────────── */
function buildPrompt(resumeText, job) {
  const jobSection = job
    ? `\n\nTARGET JOB:\nTitle: ${job.title}\nCompany: ${job.companyName}\nDescription: ${job.description}\nRequired Skills: ${job.requiredSkills.join(', ')}`
    : '\n\nNo specific job selected — analyze against general Software Engineering / IT hiring standards.';

  return `You are an expert ATS resume analyzer and career coach. Analyze the resume below and return ONLY a valid JSON object with this exact structure.

RESUME:
${resumeText.substring(0, 3000)}
${jobSection}

Return this exact JSON structure (all scores are integers 0-100):
{
  "scores": {
    "ats": <overall ATS compatibility score>,
    "quality": <overall resume quality>,
    "technicalSkills": <technical skills depth score>,
    "projects": <projects section score>,
    "experience": <experience section score>,
    "education": <education section score>,
    "grammar": <grammar and language score>,
    "keywords": <keyword match score>,
    "formatting": <formatting and structure score>,
    "recruiterReadability": <how readable to a recruiter>
  },
  "strengths": [<3-5 specific strengths as strings>],
  "weaknesses": [<3-5 specific weaknesses as strings>],
  "missingTechnicalSkills": [<5-8 technical skills missing for the role>],
  "missingSoftSkills": [<3-5 soft skills missing>],
  "weakBulletPoints": [<2-4 examples of weak bullet points found, or suggestions to improve>],
  "grammarProblems": [<specific grammar issues found, or empty array if none>],
  "actionVerbSuggestions": [<5 strong action verbs to use>],
  "formattingSuggestions": [<3-4 formatting improvements>],
  "recommendedCertifications": [<3-5 certifications that would strengthen this resume>],
  "recommendedProjects": [<3 project ideas relevant to the target role>],
  "recommendedTechnologies": [<5 technologies to learn>],
  "careerTips": [<3-4 career improvement tips>],
  "priorityImprovements": [<exactly 5 highest-priority improvements, ordered by impact>],
  "keywordAnalysis": {
    "matchingKeywords": [<keywords found in both resume and job>],
    "missingKeywords": [<important keywords from job not in resume>],
    "skillMatchPercent": <integer 0-100>,
    "keywordMatchPercent": <integer 0-100>,
    "atsCompatibility": <"High" | "Medium" | "Low">
  }
}`;
}

/* ── Mock fallback when no OpenAI key ────────────────────── */
function mockAnalysis() {
  return {
    scores: {
      ats: 72, quality: 68, technicalSkills: 75, projects: 65,
      experience: 60, education: 80, grammar: 85, keywords: 70,
      formatting: 78, recruiterReadability: 73,
    },
    strengths: [
      'Strong educational background with relevant degree',
      'Good variety of technical skills listed',
      'Projects demonstrate practical application of skills',
    ],
    weaknesses: [
      'Work experience section lacks quantifiable achievements',
      'Summary section is too generic',
      'Missing industry-relevant certifications',
    ],
    missingTechnicalSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'TypeScript'],
    missingSoftSkills: ['Leadership', 'Cross-functional collaboration', 'Agile/Scrum'],
    weakBulletPoints: [
      '"Worked on web development" → Use: "Built and deployed 3 full-stack web apps using React and Node.js"',
      '"Helped with database" → Use: "Optimized PostgreSQL queries reducing load time by 40%"',
    ],
    grammarProblems: [],
    actionVerbSuggestions: ['Architected', 'Optimized', 'Delivered', 'Spearheaded', 'Engineered'],
    formattingSuggestions: [
      'Use consistent date formatting throughout',
      'Add a skills section with categorized technical skills',
      'Keep resume to one page for entry-level positions',
    ],
    recommendedCertifications: [
      'AWS Certified Developer – Associate',
      'Google Associate Cloud Engineer',
      'MongoDB Certified Developer',
    ],
    recommendedProjects: [
      'Build a full-stack e-commerce app with React, Node.js, and PostgreSQL',
      'Create a REST API with authentication and deploy to AWS',
      'Develop a real-time chat application using WebSockets',
    ],
    recommendedTechnologies: ['Docker', 'Redis', 'GraphQL', 'TypeScript', 'Terraform'],
    careerTips: [
      'Contribute to open-source projects to build your portfolio',
      'Network actively on LinkedIn and attend tech meetups',
      'Tailor your resume for each job application',
    ],
    priorityImprovements: [
      'Add quantifiable metrics to all experience bullet points',
      'Write a targeted professional summary for each application',
      'Obtain at least one cloud certification (AWS/GCP/Azure)',
      'Add 2-3 more substantial projects with live demos',
      'Include keywords from the job description throughout your resume',
    ],
    keywordAnalysis: {
      matchingKeywords: ['JavaScript', 'React', 'Node.js'],
      missingKeywords: ['Docker', 'AWS', 'TypeScript', 'CI/CD'],
      skillMatchPercent: 55,
      keywordMatchPercent: 48,
      atsCompatibility: 'Medium',
    },
  };
}

/* ── Main export ─────────────────────────────────────────── */
export async function analyzeResume(user, profile, source, job) {
  const resumeText = await assembleResumeText(user, profile, source);
  if (!resumeText) return null;

  try {
    const prompt = buildPrompt(resumeText, job);
    return await askJSON(prompt, 2000);
  } catch (err) {
    // No API key or OpenAI failure — return mock so UI still works
    console.warn('AI analysis unavailable, using mock data:', err.message);
    return mockAnalysis();
  }
}
