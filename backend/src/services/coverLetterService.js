import { askJSON } from './aiService.js';

/* ── Build student context from all available sources ─────── */
function buildContext(user, profile, analysis, job) {
  const lines = [];

  // Student identity
  lines.push(`Student Name: ${profile?.personalInfo?.name || user.name}`);
  lines.push(`Email: ${profile?.personalInfo?.email || user.email}`);
  if (profile?.personalInfo?.phone)   lines.push(`Phone: ${profile.personalInfo.phone}`);
  if (profile?.personalInfo?.linkedin) lines.push(`LinkedIn: ${profile.personalInfo.linkedin}`);
  if (profile?.personalInfo?.github)   lines.push(`GitHub: ${profile.personalInfo.github}`);
  lines.push(`Branch: ${user.branch || 'Not specified'}`);
  lines.push(`CGPA: ${user.cgpa || 'Not specified'}`);

  // Skills — prefer profile, fall back to user.skills
  const skills = profile?.skills?.length ? profile.skills : (user.skills || []);
  if (skills.length) lines.push(`Skills: ${skills.join(', ')}`);

  // Summary
  if (profile?.summary) lines.push(`Professional Summary: ${profile.summary}`);

  // Education
  if (profile?.education?.length)
    lines.push(`Education: ${profile.education.map(e => `${e.degree} at ${e.college} (CGPA: ${e.cgpa || 'N/A'}, Year: ${e.year || 'N/A'})`).join('; ')}`);

  // Experience
  if (profile?.experience?.length)
    lines.push(`Work Experience: ${profile.experience.map(e => `${e.role} at ${e.company} — ${e.duration || ''}: ${e.description || ''}`).join(' | ')}`);

  // Internships
  if (profile?.internships?.length)
    lines.push(`Internships: ${profile.internships.map(e => `${e.role} at ${e.company} — ${e.duration || ''}: ${e.description || ''}`).join(' | ')}`);

  // Projects
  if (profile?.projects?.length)
    lines.push(`Projects: ${profile.projects.map(p => `${p.name} (${(p.tech || []).join(', ')}): ${p.description || ''}`).join(' | ')}`);

  // Certifications
  if (profile?.certifications?.length)
    lines.push(`Certifications: ${profile.certifications.map(c => `${c.name} by ${c.issuer || ''} (${c.year || ''})`).join(', ')}`);

  // Achievements
  if (profile?.achievements?.length)
    lines.push(`Achievements: ${profile.achievements.map(a => a.title).join(', ')}`);

  // Resume analysis insights
  if (analysis?.analysisData) {
    const d = analysis.analysisData;
    if (d.presentTechnicalSkills?.length)
      lines.push(`Verified Technical Skills (from resume analysis): ${d.presentTechnicalSkills.join(', ')}`);
    if (d.strengths?.length)
      lines.push(`Key Strengths: ${d.strengths.join(', ')}`);
  }

  // Job details
  lines.push(`\nTarget Job Title: ${job.title}`);
  lines.push(`Company: ${job.companyName}`);
  lines.push(`Job Description: ${job.description}`);
  if (job.requiredSkills?.length)
    lines.push(`Required Skills: ${job.requiredSkills.join(', ')}`);

  return lines.join('\n');
}

/* ── Tone instructions ────────────────────────────────────── */
const TONE_GUIDE = {
  professional:  'formal, polished, and business-appropriate',
  friendly:      'warm, approachable, and personable while remaining professional',
  formal:        'highly formal, structured, and traditional',
  confident:     'assertive, self-assured, and results-focused',
  enthusiastic:  'energetic, passionate, and genuinely excited about the opportunity',
  minimal:       'concise, direct, and free of filler — every sentence earns its place',
  creative:      'distinctive and memorable while staying professional',
};

/* ── Length instructions ──────────────────────────────────── */
const LENGTH_GUIDE = {
  short:    '2 short paragraphs (150-200 words total)',
  medium:   '3 paragraphs (250-350 words total)',
  detailed: '4-5 paragraphs (400-500 words total)',
};

/* ── Generation prompt ────────────────────────────────────── */
function buildGenerationPrompt(context, tone, length, customization) {
  const toneDesc   = TONE_GUIDE[tone]   || TONE_GUIDE.professional;
  const lengthDesc = LENGTH_GUIDE[length] || LENGTH_GUIDE.medium;

  const customLines = [];
  if (customization?.additionalNotes)     customLines.push(`Additional Notes: ${customization.additionalNotes}`);
  if (customization?.achievementsToHighlight) customLines.push(`Achievements to Highlight: ${customization.achievementsToHighlight}`);
  if (customization?.personalMotivation)  customLines.push(`Personal Motivation: ${customization.personalMotivation}`);
  if (customization?.skillsToEmphasize)   customLines.push(`Skills to Emphasize: ${customization.skillsToEmphasize}`);

  return `You are an expert career coach and professional writer specializing in ATS-optimized cover letters for campus placements.

STUDENT PROFILE:
${context}
${customLines.length ? `\nCUSTOMIZATION REQUESTS:\n${customLines.join('\n')}` : ''}

WRITING INSTRUCTIONS:
- Tone: ${toneDesc}
- Length: ${lengthDesc}
- Write a complete, professional cover letter
- Include: professional header (name, contact), today's date (${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}), hiring manager greeting, opening paragraph, body paragraphs covering relevant skills/projects/experience, why this company and role, closing paragraph, professional signature
- Make it feel human and natural — avoid generic AI phrases like "I am writing to express my interest"
- Reference specific skills and projects from the student profile that match the job requirements
- Do NOT fabricate achievements, companies, or experiences not present in the profile
- Do NOT use hollow filler phrases like "I am a quick learner" or "I am passionate about technology"
- Use the student's actual name, skills, and experiences throughout
- ATS-friendly: naturally include keywords from the job description

Return ONLY a valid JSON object:
{
  "letterText": "<complete cover letter as a single string with \\n for line breaks>",
  "wordCount": <integer>
}`;
}

/* ── Self-review prompt ───────────────────────────────────── */
function buildReviewPrompt(letterText) {
  return `You are a professional editor reviewing a cover letter for grammar, tone, readability, and quality.

COVER LETTER:
${letterText}

Review for:
1. Grammar and spelling errors
2. Repeated sentences or phrases
3. Hollow filler phrases (e.g. "I am a quick learner", "passionate about technology")
4. Unnatural or robotic AI-sounding language
5. Conciseness — remove any redundant sentences

If improvements are needed, rewrite the improved version. If the letter is already excellent, return it unchanged.

Return ONLY a valid JSON object:
{
  "improved": "<final improved cover letter as a single string with \\n for line breaks>",
  "changesMade": "<brief description of changes, or 'None' if unchanged>"
}`;
}

/* ── Mock fallback ────────────────────────────────────────── */
function mockCoverLetter(user, profile, job, tone, length) {
  const name    = profile?.personalInfo?.name || user.name;
  const email   = profile?.personalInfo?.email || user.email;
  const phone   = profile?.personalInfo?.phone || '';
  const skills  = (profile?.skills?.length ? profile.skills : user.skills || []).slice(0, 4).join(', ');
  const today   = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const letter = `${name}
${email}${phone ? ' · ' + phone : ''}

${today}

Hiring Manager
${job.companyName}

Dear Hiring Manager,

Your ${job.title} opening at ${job.companyName} caught my attention immediately — the role aligns closely with the work I have been building toward throughout my academic career.

I am a ${user.branch || 'Computer Science'} student with a CGPA of ${user.cgpa || 'N/A'}, and I bring hands-on experience in ${skills || 'software development'}. Through my projects and coursework, I have developed a strong foundation in the skills your team values, and I am eager to apply that knowledge in a professional setting at ${job.companyName}.

What draws me to ${job.companyName} specifically is the opportunity to contribute to meaningful work while continuing to grow alongside a talented team. I am confident that my technical background and commitment to quality make me a strong fit for this role.

I would welcome the opportunity to discuss how I can contribute to your team. Thank you for your time and consideration.

Sincerely,
${name}`;

  return letter;
}

/* ── Main export ──────────────────────────────────────────── */
export async function generateCoverLetter(user, profile, analysis, job, tone, length, customization) {
  const context = buildContext(user, profile, analysis, job);

  try {
    // Step 1: Generate
    const genResult = await askJSON(buildGenerationPrompt(context, tone, length, customization), 2000);
    if (!genResult.letterText) throw new Error('Empty letter text');

    // Step 2: Self-review and improve
    const reviewResult = await askJSON(buildReviewPrompt(genResult.letterText), 2000);
    const finalText = reviewResult.improved || genResult.letterText;

    return finalText;
  } catch (err) {
    console.warn('AI cover letter unavailable, using mock:', err.message);
    return mockCoverLetter(user, profile, job, tone, length);
  }
}
