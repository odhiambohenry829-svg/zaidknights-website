"""
Example AI article generator helper (Python) — adapted copy.
Install: pip install openai requests

Place API keys in environment variables: OPENAI_API_KEY
"""
import os
import openai

openai.api_key = os.getenv('OPENAI_API_KEY')

PROMPT_TEMPLATE = '''You are an expert chess journalist. Expand the following brief into a 500-800 word news article with a neutral tone, include sources and a short TL;DR.

Brief:
{brief}

Return JSON with keys: title, tl_dr, body, sources
'''


def generate_article(brief: str, max_tokens: int = 800) -> dict:
    prompt = PROMPT_TEMPLATE.format(brief=brief)
    resp = openai.ChatCompletion.create(
        model='gpt-4o-mini',
        messages=[{"role":"user","content":prompt}],
        max_tokens=max_tokens,
        temperature=0.2,
    )
    text = resp['choices'][0]['message']['content']
    # Simple best-effort: return raw text for now; production should parse/validate JSON
    return {"raw": text}


if __name__ == '__main__':
    brief = 'Magnus Carlsen wins rapid chess event in Reykjavik, dramatic final game.'
    out = generate_article(brief)
    print(out['raw'])
