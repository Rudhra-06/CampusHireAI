import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function extractJsonPayload(rawContent) {
  if (!rawContent) throw new Error('AI returned an empty response.');

  const trimmed = rawContent.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fencedMatch ? fencedMatch[1] : trimmed;

  try {
    return JSON.parse(candidate);
  } catch (error) {
    throw new Error(`AI returned invalid JSON: ${error.message}`);
  }
}

/**
 * Send a prompt to GPT and parse the JSON response.
 * @param {string} prompt
 * @param {number} maxTokens
 * @returns {object} parsed JSON object
 */
export const askJSON = async (prompt, maxTokens = 2000) => {
  if (!openai) throw new Error('OPENAI_API_KEY is not configured.');

  const response = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: maxTokens,
  });

  const raw = response.choices?.[0]?.message?.content;
  return extractJsonPayload(raw);
};

export const generateAiResponse = async (prompt, maxTokens = 1200) => {
  if (!openai) {
    return 'I can help with your resume, applications, interviews, and skill plan. Add your OpenAI API key to unlock richer guidance.';
  }

  const response = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    max_tokens: maxTokens,
  });

  return response.choices?.[0]?.message?.content || 'I could not generate a response right now.';
};

export default { askJSON, generateAiResponse };
