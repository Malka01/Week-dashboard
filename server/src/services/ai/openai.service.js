const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateAnswer = async ({
  question,
  context,
}) => {
  const response = await client.responses.create({
    model: "gpt-5.6-luna",

    instructions: `
You are a Team Analytics Assistant for a Weekly Report Management System.

Your job is to help managers understand team activity using weekly reports.

IMPORTANT RULES:

1. Use ONLY the report context provided by the application.
2. Do not invent team members, tasks, blockers, achievements, projects, or statistics.
3. If the requested information is not available in the context, clearly say that the information is not available.
4. Keep answers concise and professional.
5. When discussing statistics, mention the relevant date range when available.
6. Do not expose passwords, JWT tokens, API keys, or other sensitive authentication information.
7. Treat the report data as internal company information.
`,

    input: `
REPORT CONTEXT:

${context}

END REPORT CONTEXT.

MANAGER QUESTION:

${question}
`,
  });

  return response.output_text;
};

module.exports = {
  generateAnswer,
};