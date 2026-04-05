const Groq = require('groq-sdk');

let groqClient = null;

function getGroqClient() {
  if (!groqClient) {
    const key = process.env.GROQ_API_KEY;
    if (!key || key === 'your_groq_api_key_here') {
      throw new Error('GROQ_API_KEY is not configured. Get a free key at https://console.groq.com');
    }
    groqClient = new Groq({ apiKey: key });
  }
  return groqClient;
}

// ========== REQUEST QUEUE ==========
// Ensures only ONE AI call runs at a time with a cooldown between calls.
// This prevents hitting Groq's rate limits (30 req/min free tier).

let queue = [];
let processing = false;
const COOLDOWN_MS = 3000; // 3 seconds between requests

function enqueue(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    processQueue();
  });
}

async function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;

  const { fn, resolve, reject } = queue.shift();
  try {
    const result = await fn();
    resolve(result);
  } catch (err) {
    reject(err);
  }

  // Wait cooldown before processing next request
  setTimeout(() => {
    processing = false;
    processQueue();
  }, COOLDOWN_MS);
}

// ========== AI CALL ==========

async function callAI(messages, options = {}) {
  // Wrap the actual API call in the queue
  return enqueue(() => _callAI(messages, options));
}

async function _callAI(messages, options = {}) {
  const client = getGroqClient();
  const {
    model = 'llama-3.3-70b-versatile',
    temperature = 0.7,
    maxTokens = 4096,
    retries = 2,
  } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[Groq] Calling ${model} (attempt ${attempt})...`);
      const response = await client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });
      console.log(`[Groq] Success! Tokens used: ${response.usage?.total_tokens || 'N/A'}`);
      return response.choices[0].message.content;
    } catch (err) {
      const msg = err.message || '';
      console.warn(`[Groq] Attempt ${attempt} failed: ${msg.slice(0, 120)}`);

      if (attempt === retries) {
        if (msg.includes('rate_limit') || msg.includes('429') || msg.includes('quota')) {
          throw new Error('API rate limit reached. Please wait a moment and try again.');
        }
        throw err;
      }
      // Wait before retry (longer for rate limits)
      const delay = (msg.includes('429') || msg.includes('rate')) ? 15000 : 3000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

/**
 * Parse JSON from AI response (handles markdown code fences)
 */
function parseJSONResponse(text) {
  try {
    const cleaned = text
      .replace(/^```(?:json)?\s*\n?/m, '')
      .replace(/\n?\s*```\s*$/m, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    return null;
  }
}

module.exports = { callAI, parseJSONResponse };
