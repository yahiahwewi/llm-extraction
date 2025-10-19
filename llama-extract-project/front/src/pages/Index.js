import React, { useState } from 'react';

const BACKEND_URL = 'http://localhost:5000';

export default function Index() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setExtractedData(null);
    setQuestion('');
    setAnswer('');
    setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setExtractedData(null);
      setQuestion('');
      setAnswer('');
      setError('');
    }
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file');
    setUploading(true);
    setError('');
    setExtractedData(null);
    setAnswer('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!resp.ok) throw new Error(`${resp.status} ${await resp.text()}`);
      const data = await resp.json();
      setExtractedData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const askQuestion = async (e) => {
    e.preventDefault();
    if (!question) return;
    setAnswer('');
    setError('');
    try {
      const resp = await fetch(`${BACKEND_URL}/retrieve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question }),
      });
      if (!resp.ok) throw new Error(`${resp.status} ${await resp.text()}`);
      const data = await resp.json();
      setAnswer(JSON.stringify(data.results, null, 2) || 'No answer');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Upload Card */}
      <div className="card mb-8 bg-gray-800 text-gray-100 shadow-lg rounded-xl overflow-hidden">
        <div className="card-header bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <span className="p-2 bg-white/20 rounded-lg">📄</span>
            Upload & Query PDF
          </h1>
        </div>
        <div className="card-body p-6">
          <form onSubmit={uploadFile} className="space-y-6">
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${
                dragActive ? 'border-blue-400 bg-blue-50/20' : 'border-gray-600 bg-gray-700/20'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={onFileChange}
                className="hidden"
                id="file"
              />
              <label
                htmlFor="file"
                className="cursor-pointer flex flex-col items-center justify-center text-center"
              >
                <svg
                  className="w-12 h-12 text-gray-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-200 mb-1">
                  {file ? file.name : 'Choose a PDF file or drag and drop'}
                </p>
                <p className="text-sm text-gray-400">PDF files only</p>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center"
              >
                {uploading && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          </form>

          {error && (
            <div className="alert mt-4 bg-red-600/20 border-l-4 border-red-400 p-4 rounded">
              <div className="flex items-center text-red-400">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Extracted Data Card */}
      {extractedData && (
        <div className="card mb-8 bg-gray-800 text-gray-100 shadow-lg rounded-xl overflow-hidden">
          <div className="card-header bg-green-600/20 border-l-4 border-green-400 p-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-lg font-semibold text-green-800">
                File extracted successfully!
              </h2>
            </div>
          </div>
          <div className="card-body p-4">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(extractedData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Question & Answer Card */}
      <div className="card bg-gray-800 text-gray-100 shadow-lg rounded-xl overflow-hidden">
        <div className="card-header bg-gray-700 p-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Ask a Question
          </h2>
        </div>
        <div className="card-body p-6">
          <form onSubmit={askQuestion} className="space-y-4">
            <div>
              <label htmlFor="question" className="block mb-2 text-gray-200">
                Your Question
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. What is the total amount?"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
              >
                Ask
              </button>
            </div>
          </form>

          {answer && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-200 mb-2">Answer:</h3>
              <div className="bg-gray-900 p-4 rounded text-sm text-gray-100 whitespace-pre-wrap overflow-x-auto">
                {answer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
