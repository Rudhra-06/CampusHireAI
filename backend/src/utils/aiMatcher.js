import { askJSON } from '../services/aiService.js';

export const calculateMatchScore = async (resumeText, jobDescription, requiredSkills) => {
  try {
    const prompt = `Analyze this resume against the job requirements and return a JSON object.

Resume: ${resumeText.substring(0, 2000)}
Job Description: ${jobDescription}
Required Skills: ${requiredSkills.join(', ')}

Return format: { "score": <0-100>, "matchedSkills": [...], "missingSkills": [...] }`;

    const result = await askJSON(prompt, 500);
    return {
      aiScore: result.score ?? 0,
      matchedSkills: result.matchedSkills ?? [],
      missingSkills: result.missingSkills ?? requiredSkills,
    };
  } catch {
    // Fallback: simple keyword matching
    const resumeLower = resumeText.toLowerCase();
    const matched = requiredSkills.filter(s => resumeLower.includes(s.toLowerCase()));
    const missing = requiredSkills.filter(s => !resumeLower.includes(s.toLowerCase()));
    return {
      aiScore: Math.round((matched.length / Math.max(requiredSkills.length, 1)) * 100),
      matchedSkills: matched,
      missingSkills: missing,
    };
  }
};
