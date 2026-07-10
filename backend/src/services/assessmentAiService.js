import { askJSON } from './aiService.js';

const mockQuestions = ({ role, skills, difficulty, count }) => {
    const skillList = skills || 'problem solving';
    const questions = [];
    for (let index = 0; index < count; index += 1) {
        if (index % 3 === 0) {
            questions.push({
                questionType: 'mcq',
                prompt: `Which option best describes a good approach for ${role || 'software engineering'} work?`,
                options: ['Write clear, tested, maintainable code', 'Skip edge cases', 'Hardcode values everywhere'],
                correctAnswers: ['Write clear, tested, maintainable code'],
                difficulty: difficulty || 'medium',
                points: 10,
            });
        } else if (index % 3 === 1) {
            questions.push({
                questionType: 'programming',
                prompt: `Write a function that uses ${skillList} to solve a common coding problem.`,
                inputFormat: 'Input: integer n',
                outputFormat: 'Output: result',
                constraints: '1 <= n <= 1000',
                difficulty: difficulty || 'medium',
                points: 20,
                expectedLanguage: 'python',
            });
        } else {
            questions.push({
                questionType: 'short_answer',
                prompt: `Explain how you would approach debugging a bug in a ${role || 'software'} application.`,
                difficulty: difficulty || 'medium',
                points: 10,
            });
        }
    }
    return questions;
};

export async function generateQuestions({ role, requiredSkills, difficulty, count = 5 }) {
    const prompt = `Generate ${count} assessment questions for a ${role || 'software engineering'} role. Focus on these skills: ${requiredSkills || 'problem solving, debugging, algorithms'}. Difficulty: ${difficulty || 'medium'}. Return a JSON object with a single key "questions" containing an array of objects with fields: questionType, prompt, options, correctAnswers, difficulty, points, inputFormat, outputFormat, constraints, expectedLanguage.`;

    try {
        const result = await askJSON(prompt, 3000);
        if (Array.isArray(result?.questions) && result.questions.length > 0) {
            return result.questions.slice(0, count);
        }
    } catch (error) {
        console.warn('AI question generation failed, using fallback questions:', error.message);
    }

    return mockQuestions({ role, skills: requiredSkills, difficulty, count });
}
