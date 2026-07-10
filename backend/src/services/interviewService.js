import { askJSON } from './aiService.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';

/* ── Assemble resume text without cross-service dependency ── */
async function buildResumeText(student, resumeProfile) {
  const lines = [];
  if (resumeProfile) {
    if (resumeProfile.summary)   lines.push(`Summary: ${resumeProfile.summary}`);
    if (resumeProfile.skills?.length) lines.push(`Skills: ${resumeProfile.skills.join(', ')}`);
    if (resumeProfile.education?.length)
      resumeProfile.education.forEach(e => lines.push(`Education: ${e.degree} at ${e.college} (${e.year})`));
    if (resumeProfile.experience?.length)
      resumeProfile.experience.forEach(e => lines.push(`Experience: ${e.role} at ${e.company} — ${e.description}`));
    if (resumeProfile.internships?.length)
      resumeProfile.internships.forEach(e => lines.push(`Internship: ${e.role} at ${e.company}`));
    if (resumeProfile.projects?.length)
      resumeProfile.projects.forEach(p => lines.push(`Project: ${p.name} [${p.tech}] — ${p.description}`));
    if (resumeProfile.certifications?.length)
      resumeProfile.certifications.forEach(c => lines.push(`Certification: ${c.name} (${c.issuer})`));
  }
  if (student.resumeURL && lines.length === 0) {
    try {
      const pdfText = await extractTextFromPDF(student.resumeURL);
      if (pdfText) lines.push(pdfText.substring(0, 2000));
    } catch { /* ignore PDF errors */ }
  }
  return lines.join('\n');
}

/* ── Question Generation ─────────────────────────────────── */
export async function generateQuestions({ student, resumeProfile, resumeAnalysis, job }) {
  const resumeText = await buildResumeText(student, resumeProfile);

  const analysisContext = resumeAnalysis?.analysisData
    ? `Resume Analysis Insights:
- Strengths: ${(resumeAnalysis.analysisData.strengths || []).join(', ')}
- Weaknesses: ${(resumeAnalysis.analysisData.weaknesses || []).join(', ')}
- Missing Skills: ${(resumeAnalysis.analysisData.missingTechnicalSkills || []).join(', ')}`
    : '';

  const prompt = `You are an expert technical interviewer. Generate interview questions for a campus placement interview.

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.companyName}
- Description: ${job.description}
- Required Skills: ${(job.requiredSkills || []).join(', ')}

CANDIDATE PROFILE:
- Name: ${student.name}
- Branch: ${student.branch || 'N/A'}
- CGPA: ${student.cgpa || 'N/A'}
- Skills: ${(student.skills || []).join(', ')}
${resumeText ? `\nRESUME:\n${resumeText.substring(0, 2000)}` : ''}
${analysisContext}

Generate between 7 and 10 interview questions. Mix the following categories:
- technical (3-4 questions): specific to the job's required skills and candidate's background
- behavioral (2 questions): past experiences and soft skills
- situational (1-2 questions): hypothetical scenarios relevant to the role
- problem_solving (1-2 questions): logical thinking and approach

Adapt difficulty to the job role and candidate's CGPA/experience level.

Return a JSON object with key "questions" containing an array of objects:
{
  "questions": [
    {
      "questionText": "<full question text>",
      "questionType": "<technical|behavioral|situational|problem_solving>",
      "orderIndex": <1-based integer>
    }
  ]
}`;

  const result = await askJSON(prompt, 2000);
  if (!Array.isArray(result.questions) || result.questions.length === 0) {
    throw new Error('AI did not return valid questions.');
  }
  return result.questions.slice(0, 10);
}

/* ── Answer Evaluation ───────────────────────────────────── */
export async function evaluateAnswers({ questions, answers, job, student }) {
  const pairs = questions.map(q => {
    const ans = answers.find(a => a.questionId === q.id);
    return { question: q.questionText, type: q.questionType, answer: ans?.answerText || '' };
  });

  const prompt = `You are an expert interviewer evaluating a campus placement interview.

JOB: ${job.title} at ${job.companyName}
CANDIDATE: ${student.name} (${student.branch || 'N/A'}, CGPA: ${student.cgpa || 'N/A'})

Evaluate each answer independently. For blank/empty answers, score 0.

Q&A PAIRS:
${pairs.map((p, i) => `Q${i + 1} [${p.type}]: ${p.question}\nAnswer: ${p.answer || '(no answer provided)'}`).join('\n\n')}

Return a JSON object:
{
  "evaluations": [
    {
      "questionIndex": <0-based>,
      "score": <0-10 integer>,
      "feedback": "<2-3 sentence specific feedback>",
      "improvementSuggestion": "<1-2 sentence actionable improvement>"
    }
  ]
}`;

  const result = await askJSON(prompt, 2000);
  if (!Array.isArray(result.evaluations)) throw new Error('AI evaluation failed.');
  return result.evaluations;
}

/* ── Report Generation ───────────────────────────────────── */
export async function generateReport({ questions, answers, evaluations, job, student }) {
  const evalSummary = evaluations.map((e, i) => {
    const q = questions[i];
    return `[${q?.questionType || 'general'}] Score: ${e.score}/10 — ${e.feedback}`;
  }).join('\n');

  const avgScore = evaluations.length
    ? Math.round(evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length * 10)
    : 0;

  const prompt = `You are a senior hiring manager generating a final interview evaluation report.

JOB: ${job.title} at ${job.companyName}
CANDIDATE: ${student.name} (${student.branch || 'N/A'}, CGPA: ${student.cgpa || 'N/A'})
AVERAGE ANSWER SCORE: ${avgScore}/100

INDIVIDUAL EVALUATIONS:
${evalSummary}

Generate a comprehensive final report. Return a JSON object:
{
  "overallScore": <0-100 integer>,
  "technicalScore": <0-100 integer>,
  "communicationScore": <0-100 integer>,
  "problemSolvingScore": <0-100 integer>,
  "behavioralScore": <0-100 integer>,
  "confidenceScore": <0-100 integer>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "missingSkills": ["<skill 1>", "<skill 2>", "<skill 3>"],
  "suggestedTopics": ["<topic 1>", "<topic 2>", "<topic 3>"],
  "suggestedCertifications": ["<cert 1>", "<cert 2>"],
  "interviewSummary": "<3-4 sentence professional summary of the interview performance>",
  "recruiterRecommendation": "<Strong Hire|Hire|Consider|Needs Improvement|Reject>"
}

Base scores on actual answer quality. Be honest and constructive.`;

  const result = await askJSON(prompt, 1500);

  const validRecs = ['Strong Hire', 'Hire', 'Consider', 'Needs Improvement', 'Reject'];
  if (!validRecs.includes(result.recruiterRecommendation)) {
    result.recruiterRecommendation = 'Consider';
  }

  return result;
}

/* ── Mock fallback (no OpenAI key) ───────────────────────── */
export function mockQuestions(job) {
  return [
    { questionText: `Explain your experience with ${(job.requiredSkills || ['programming'])[0]}.`, questionType: 'technical', orderIndex: 1 },
    { questionText: 'Describe a challenging project you worked on and how you overcame obstacles.', questionType: 'behavioral', orderIndex: 2 },
    { questionText: `How would you design a scalable system for ${job.title} responsibilities?`, questionType: 'problem_solving', orderIndex: 3 },
    { questionText: 'Tell me about a time you had to learn a new technology quickly.', questionType: 'behavioral', orderIndex: 4 },
    { questionText: `What is your approach to debugging complex issues in ${(job.requiredSkills || ['software'])[0]}?`, questionType: 'technical', orderIndex: 5 },
    { questionText: 'How do you prioritize tasks when working on multiple deadlines?', questionType: 'situational', orderIndex: 6 },
    { questionText: `Describe your understanding of ${(job.requiredSkills || ['the core concepts'])[1] || 'data structures'}.`, questionType: 'technical', orderIndex: 7 },
  ];
}

export function mockEvaluations(count) {
  return Array.from({ length: count }, (_, i) => ({
    questionIndex: i,
    score: Math.floor(Math.random() * 4) + 5,
    feedback: 'The answer demonstrated reasonable understanding of the topic.',
    improvementSuggestion: 'Consider providing more specific examples with measurable outcomes.',
  }));
}

export function mockReport() {
  return {
    overallScore: 68, technicalScore: 70, communicationScore: 65,
    problemSolvingScore: 72, behavioralScore: 60, confidenceScore: 68,
    strengths: ['Good technical foundation', 'Clear communication', 'Relevant project experience'],
    weaknesses: ['Lacks depth in system design', 'Limited industry experience', 'Could improve on behavioral answers'],
    missingSkills: ['Docker', 'System Design', 'Cloud Platforms'],
    suggestedTopics: ['System Design Fundamentals', 'Cloud Computing', 'Data Structures & Algorithms'],
    suggestedCertifications: ['AWS Certified Developer', 'Google Associate Cloud Engineer'],
    interviewSummary: 'The candidate demonstrated solid foundational knowledge and communicated clearly. Performance was consistent across technical questions but showed room for improvement in behavioral and situational responses.',
    recruiterRecommendation: 'Consider',
  };
}
