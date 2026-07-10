const mapLanguage = (language) => {
    const normalized = String(language || 'python').toLowerCase();
    if (normalized === 'javascript' || normalized === 'js') return 'javascript';
    if (normalized === 'c++' || normalized === 'cpp') return 'cpp';
    if (normalized === 'c#') return 'csharp';
    return normalized;
};

export async function executeCode({ code, language = 'python', tests = [] }) {
    const lang = mapLanguage(language);
    const configuredEndpoint = process.env.JUDGE0_URL || process.env.JUDGE0_HOST;

    if (!configuredEndpoint) {
        const passed = (tests.length ? tests.filter(test => String(test.expected).trim() === String(test.actual).trim()).length : 1);
        const total = tests.length || 1;
        return {
            status: passed === total ? 'accepted' : 'wrong_answer',
            score: passed === total ? 100 : Math.round((passed / total) * 100),
            executionTime: 0.2,
            memoryUsage: 8,
            compilerOutput: 'Mock execution succeeded. Configure Judge0 for live evaluation.',
            errorMessage: '',
            testResults: tests.length ? tests.map((test, index) => ({ index, input: test.input, expected: test.expected, actual: test.actual || '', passed: String(test.expected).trim() === String(test.actual).trim() })) : [{ index: 0, input: '', expected: 'mock', actual: 'mock', passed: true }],
        };
    }

    try {
        const response = await fetch(configuredEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': process.env.JUDGE0_KEY || '',
            },
            body: JSON.stringify({
                source_code: code,
                language_id: lang === 'python' ? 71 : lang === 'javascript' ? 63 : lang === 'java' ? 62 : lang === 'c' ? 50 : lang === 'cpp' ? 54 : 71,
                stdin: tests[0]?.input || '',
                expected_output: tests[0]?.expected || '',
            }),
        });

        const data = await response.json();
        return {
            status: data.status?.description || 'completed',
            score: response.ok ? 100 : 0,
            executionTime: Number(data.time) || 0,
            memoryUsage: Number(data.memory) || 0,
            compilerOutput: data.stdout || data.compile_output || '',
            errorMessage: data.stderr || data.message || '',
            testResults: [],
        };
    } catch (error) {
        return {
            status: 'network_error',
            score: 0,
            executionTime: 0,
            memoryUsage: 0,
            compilerOutput: '',
            errorMessage: error.message || 'Execution service failed.',
            testResults: [],
        };
    }
}
