import React, { useState } from 'react';

const BACKEND_URL = 'http://localhost:5000';

export default function EndpointQuery() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResponse('');
    try {
      const resp = await fetch(`${BACKEND_URL}/index/endpoint-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!resp.ok) throw new Error(`${resp.status} ${await resp.text()}`);
      const data = await resp.json();
      setResponse(data.response || 'No response');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Query LlamaCloudIndex Endpoint</h1>
      <form onSubmit={onSubmit} className="mb-6 flex flex-col gap-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="border px-3 py-2 rounded shadow"
          placeholder="Type your question..."
        />
        <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Querying...' : 'Ask'}
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
      {response && (
        <div className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
          <span className="font-semibold text-gray-700">Response:</span>
          <pre className="mt-2 text-gray-900">{response}</pre>
        </div>
      )}
    </div>
  );
}
