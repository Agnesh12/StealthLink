import { useState } from 'react';
import './index.css';
function Popup() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResult('Please enter a song name');
      return;
    }

    setLoading(true);
    setCopied(false);
    setResult('');

    try {
      const response = await fetch(`http://localhost:8080/search?name=${encodeURIComponent(query)}`);
      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || 'Failed to fetch track');
      }

      setResult(text);
    } catch (err) {
      console.error(err);
      setResult('Error fetching data');
    }

    setLoading(false);
  };

  const handleCopy = async () => {
    if (result && result.startsWith('https://')) {
      try {
        await navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Clipboard copy failed', err);
      }
    }
  };

  return (
    <div className="w-[340px] p-6 bg-gradient-to-br from-blue-50 to-green-100 rounded-2xl shadow-xl text-black font-sans">
      <h1 className="text-2xl font-extrabold mb-4 text-center text-blue-700 tracking-tight drop-shadow">Stealth Link</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter song name"
        className="w-full p-3 border border-blue-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />
      <button
        onClick={handleSearch}
        disabled={loading}
        className={`w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-2.5 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-green-600 transition ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            Searching...
          </span>
        ) : 'Get Spotify Link'}
      </button>

      {result && (
        <div className="mt-6 bg-white/80 rounded-lg p-4 shadow-inner">
          <p className={`text-sm break-words ${result.startsWith('https://') ? 'text-green-700 font-medium' : 'text-red-600'}`}>{result}</p>
          {result.startsWith('https://') && (
            <button
              onClick={handleCopy}
              className={`mt-3 w-full bg-gradient-to-r from-green-600 to-blue-500 text-white px-3 py-2 rounded-lg font-semibold shadow hover:from-green-700 hover:to-blue-600 transition ${copied ? 'bg-green-700' : ''}`}
            >
              {copied ? (
                <span className="flex items-center justify-center">
                  <svg className="h-5 w-5 mr-1 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="h-5 w-5 mr-1 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5V3a1 1 0 00-1-1H5a1 1 0 00-1 1v16a1 1 0 001 1h11a1 1 0 001-1v-4" />
                  </svg>
                  Copy Link
                </span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Popup;
