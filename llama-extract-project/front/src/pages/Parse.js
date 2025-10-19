import React, { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5000';

// Format currency for consistency
const formatCurrency = (amount) =>
  new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}`).toLocaleDateString('fr-TN');
};

// Reusable Loading Overlay
function LoadingOverlay({ isVisible, message }) {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#161b22] rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <h3 className="text-lg font-semibold text-white mb-2">Processing Document</h3>
          <p className="text-gray-300 text-center">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Progress Bar Component
function ProgressBar({ progress, isVisible }) {
  if (!isVisible) return null;
  return (
    <div className="w-full bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
      <div
        className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-1"
        style={{ width: `${progress}%` }}
      >
        {progress > 10 && <span className="text-xs text-white font-medium">{progress}%</span>}
      </div>
    </div>
  );
}

// Formatted Invoice Component (styled like Extract)
function FormattedInvoice({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161b22] rounded-2xl border border-gray-800 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between">
          <div>
            <h3 className="text-2xl font-bold">Invoice N° {data.invoice_number}</h3>
            {data.client_number && <p className="text-blue-200">Client N° {data.client_number}</p>}
          </div>
          <div className="text-right text-blue-200">
            <p>Date: {formatDate(data.invoice_date)}</p>
            <p>Due: {formatDate(data.due_date)}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-[#0d1117] p-4 rounded-lg border border-green-500/20">
            <h4 className="text-lg font-semibold text-green-400 flex items-center mb-2">🧑 Customer</h4>
            <p className="font-medium">{data.customer_name}</p>
            <p className="text-gray-400">{data.customer_address}</p>
          </div>

          {/* Contract Details */}
          {data.contract_details?.length > 0 && (
            <div className="bg-[#0d1117] p-4 rounded-lg border border-blue-500/20 overflow-x-auto">
              <h4 className="text-lg font-semibold text-blue-400 mb-4">📄 Contract Details</h4>
              <table className="w-full text-left">
                <thead className="text-gray-300 border-b border-gray-700">
                  <tr>
                    <th>Contract Name</th>
                    <th>Phone Number</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-gray-200">
                  {data.contract_details.map((c, i) => (
                    <tr key={i} className="border-b border-gray-700">
                      <td className="py-1">{c.contract_name}</td>
                      <td>{c.phone_number}</td>
                      <td className="text-right font-semibold">{formatCurrency(c.amount_with_tax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Subscription Details */}
          {data.subscription_details?.length > 0 && (
            <div className="bg-[#0d1117] p-4 rounded-lg border border-purple-500/20 overflow-x-auto">
              <h4 className="text-lg font-semibold text-purple-400 mb-4">📝 Subscription Details</h4>
              <table className="w-full text-left">
                <thead className="text-gray-300 border-b border-gray-700">
                  <tr>
                    <th>Description</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-gray-200">
                  {data.subscription_details.map((s, i) => (
                    <tr key={i} className="border-b border-gray-700">
                      <td className="py-1">{s.description}</td>
                      <td className="text-right font-semibold">{formatCurrency(s.amount_with_tax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div className="bg-[#0d1117] p-4 rounded-lg border border-gray-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Before Tax</span>
              <span>{formatCurrency(data.total_amount_before_tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">VAT ({data.vat_percentage}%)</span>
              <span>{formatCurrency(data.vat_amount)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t border-gray-700 pt-2">
              <span>Total With Tax</span>
              <span>{formatCurrency(data.total_amount_with_tax)}</span>
            </div>
            {data.outstanding_balance > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Outstanding Balance</span>
                <span>{formatCurrency(data.outstanding_balance)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function Parse() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!loading) return;

    setProgress(0);
    setLoadingMessage('Uploading file...');
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 2));
    }, 50);

    const timers = [
      setTimeout(() => setLoadingMessage('Parsing document...'), 1000),
      setTimeout(() => setLoadingMessage('Extracting document details...'), 2500),
      setTimeout(() => setLoadingMessage('Finalizing results...'), 4000),
    ];

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [loading]);

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError('');
    setProgress(0);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
      setError('');
      setProgress(0);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file');

    setLoading(true);
    setError('');
    setResult(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const resp = await fetch(`${BACKEND_URL}/parse`, { method: 'POST', body: formData, mode: 'cors' });
      if (!resp.ok) throw new Error(`${resp.status} ${await resp.text()}`);

      const data = await resp.json();
      setResult(data);
      setProgress(100);
    } catch (err) {
      setError(err.message);
      setProgress(0);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Upload Card */}
      <div className="bg-[#161b22] rounded-2xl shadow-lg border border-gray-800 mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-2xl font-bold flex items-center gap-3">
          📤 Upload Document
        </div>
        <div className="p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-700 bg-[#0d1117]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input type="file" accept="application/pdf" onChange={onFileChange} id="file" className="hidden" />
              <label htmlFor="file" className="flex flex-col items-center justify-center">
                <p className="text-lg mb-1">{file ? file.name : 'Choose a PDF file or drag and drop'}</p>
                <p className="text-sm text-gray-400">PDF files only</p>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-2 rounded-lg flex items-center gap-2"
              >
                {loading ? 'Processing...' : 'Parse Document'}
              </button>
            </div>

            <ProgressBar progress={progress} isVisible={loading} />

            {error && <p className="text-red-500">{error}</p>}
          </form>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-[#161b22] rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
          <div className="p-6 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-bold">
            🧾 Extracted Data
          </div>
          <div className="p-6">
            <FormattedInvoice data={result.data} />
          </div>
        </div>
      )}

      <LoadingOverlay isVisible={loading} message={loadingMessage} />
    </div>
  );
}
