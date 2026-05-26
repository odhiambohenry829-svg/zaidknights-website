export async function generateArticleWithClaude(brief: string, maxTokens = 800): Promise<{ error?: string; text?: string; raw?: any }> {
  const key = process.env.CLAUDE_API_KEY;
  if (!key) return { error: 'CLAUDE_API_KEY not set' };

  const prompt = `You are an expert chess journalist. Expand the brief into a 500-800 word news article with a neutral tone, include sources and a short TL;DR. Return JSON with keys: title, tl_dr, body, sources.\n\nBrief:\n${brief}`;

  const payload = {
    model: 'claude-2.1',
    prompt,
    max_tokens_to_sample: maxTokens,
    temperature: 0.2,
  };

  try {
    const res = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    // Anthropic responses include a `completion` string; return best-effort text
    const text = data?.completion ?? data?.completion?.content ?? JSON.stringify(data);
    return { raw: data, text };
  } catch (err: any) {
    return { error: err?.message || String(err) };
  }
}
