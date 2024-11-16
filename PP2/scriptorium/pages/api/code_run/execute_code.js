import { codeExecuter } from "../../../utils/code_executer";

/**
 * Execute code in the given language and return the output
 * Allowed method: POST
 * Url: /api/code_run/execute_code
 * Access: Public
 * Payload: { code: string, language: string, input?: string }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { code, language, input } = req.body;
  if (!code || !language) {
    res.status(400).json({ error: "Code and language are required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let codeOutput = "";

  const outputHandler = (data) => {
    codeOutput += data;
    res.write(`data: ${data}\n\n`);
  };

  try {
    const result = await codeExecuter(code, language, input, outputHandler);
    res.write(
      `data: ${JSON.stringify({
        executionResult: result,
        output: codeOutput,
      })}\n\n`
    );
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.toString() })}\n\n`);
    res.end();
  }
}