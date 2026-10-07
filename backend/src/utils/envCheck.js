export function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';
  const required = ['JWT_SECRET', 'PG_DATABASE', 'PG_USER', 'PG_PASSWORD'];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    const errorMsg = `❌ Missing required environment variables: ${missing.join(', ')}`;
    console.error(errorMsg);
    if (isProduction) {
      throw new Error(errorMsg);
    } else {
      console.warn('⚠️ Running in development mode with fallback environment variables.');
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️ OPENAI_API_KEY is not configured. AI endpoints will operate with mock fallbacks.');
  }

  if (isProduction && !process.env.CLIENT_URL) {
    console.warn('⚠️ CLIENT_URL is not set in production. CORS should be explicitly configured.');
  }
}

export default validateEnv;
