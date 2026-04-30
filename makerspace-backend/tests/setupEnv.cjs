/**
 * setupEnv.cjs
 * Test-only backend environment defaults.
 *
 * @ai-assisted Codex (OpenAI) — https://openai.com/codex
 * AI used to isolate Jest tests from production environment and hardware settings.
 */

process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT ?? '0';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.PI_API_KEY = process.env.PI_API_KEY ?? 'test-pi-key';
process.env.PYTHON_VENV_PATH = process.env.PYTHON_VENV_PATH ?? 'python';
process.env.PYTHON_SCRIPT_PATH = process.env.PYTHON_SCRIPT_PATH ?? 'inference.py';
