const { createClient } = require("@supabase/supabase-js");
const Groq = require("groq-sdk");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const GEMINI_KEY = process.env.GEMINI_KEY;
const GROQ_KEY = process.env.GROQ_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_KEY || !GROQ_KEY) {
  throw new Error("Missing required environment variables.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const groq = new Groq({ apiKey: GROQ_KEY });

// Helper to call Groq with exponential backoff retry for rate limits (429)
async function callGroqWithRetry(params, retries = 3, delay = 1000) {
  try {
    return await groq.chat.completions.create(params);
  } catch (error) {
    const isRateLimit = error.status === 429 || (error.message && error.message.includes('429'));
    if (isRateLimit && retries > 0) {
      console.warn(`⚠️ Groq Rate Limit (429) hit. Retrying in ${delay}ms... (Retries left: ${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return await callGroqWithRetry(params, retries - 1, delay * 2);
    }
    throw error;
  }
}

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

async function getEmbedding(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: {
          parts: [{ text }]
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error("Gemini embedding request failed.");
  }

  const data = await response.json();

  if (!data.embedding || !data.embedding.values) {
    throw new Error("Invalid embedding response from Gemini.");
  }

  return data.embedding.values;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: "Method Not Allowed"
      })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Messages array is required."
        })
      };
    }

    const messages = body.messages;
    const userQuestion = messages[messages.length - 1].content;

    // Generate embedding
    const embedding = await getEmbedding(userQuestion);

    // Search similar packages (raised threshold to 0.5 for anti-hallucination)
    const { data: packages, error } = await supabase.rpc("match_packages", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 5
    });

    if (error) {
      throw new Error(error.message);
    }

    // Hard stop if no packages found
    if (!packages || packages.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: "I couldn't find any packages matching your query. Please contact our team on WhatsApp for personalized assistance! 🙏"
        })
      };
    }

    const context = packages
      .map(
        (pkg) => `
Package Name: ${pkg.name}
Destination: ${pkg.destination}
Level: ${pkg.level}
Duration: ${pkg.duration}
Price: ₹${pkg.price}
Season: ${pkg.season}
Best For: ${pkg.best_for}
Includes: ${pkg.includes}

Description:
${pkg.description}
`
      )
      .join("\n-------------------------\n");

    const chatHistory = messages.slice(-6);

    // Call Groq with low temperature (0.1) and exponential backoff retry
    const completion = await callGroqWithRetry({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 600,
      messages: [
        {
          role: "system",
          content: `
You are Travgo AI, the official travel assistant for Travgo Tours & Travels.

Rules:
- Recommend only from the package information below.
- Never invent package names, prices, durations or inclusions.
- If multiple packages match, compare them briefly.
- If no suitable package exists, politely say the team will assist further.
- Keep answers friendly and concise.
- Mention price and duration whenever available.
- Always end by inviting the customer to contact Travgo on WhatsApp: +91 8893147696

Available Packages:

${context}
`
        },
        ...chatHistory
      ]
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: completion.choices[0].message.content
      })
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: err.message || "Internal Server Error"
      })
    };
  }
};
