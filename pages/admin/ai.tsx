import { useState } from 'react';
import ProtectedRoute from '../../components/common/ProtectedRoute';

export default function AdminAI() {
  const [brief, setBrief] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate(e: any) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief }),
      });
      const data = await res.json();
      if (data?.article?.text) setResult(data.article.text);
      else if (data?.article?.raw) setResult(JSON.stringify(data.article.raw, null, 2));
      else setResult(JSON.stringify(data));
    } catch (err: any) {
      setResult('Error: ' + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN","COACH"]}>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">AI — Article Generator</h1>
        <form onSubmit={handleGenerate} className="space-y-4">
          <label className="block">
            <div className="text-sm text-gray-300 mb-1">Brief / prompt</div>
            <textarea value={brief} onChange={e => setBrief(e.target.value)} rows={8} className="w-full p-3 rounded bg-gray-900" />
          </label>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={loading || !brief}>
              {loading ? 'Generating…' : 'Generate Article'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Result</h2>
          <pre className="whitespace-pre-wrap bg-black/30 p-4 rounded">{result ?? 'No result yet'}</pre>
        </div>
      </div>
    </ProtectedRoute>
  );
}
