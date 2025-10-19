import React, { useState } from 'react';

const BACKEND_URL = 'http://localhost:5000';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}`).toLocaleDateString('fr-TN');
};

export default function Extract() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult('');
    setSaveStatus('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult('');
      setSaveStatus('');
    }
  };

  const saveToDatabase = async (data) => {
    try {
      const resp = await fetch(`${BACKEND_URL}/save-facture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
        mode: 'cors',
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || 'Failed to save');
      setSaveStatus('✅ Saved successfully!');
    } catch (err) {
      setSaveStatus(`❌ ${err.message}`);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file');
    setLoading(true);
    setError('');
    setResult('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await fetch(`${BACKEND_URL}/upload`, { method: 'POST', body: formData, mode: 'cors' });
      if (!resp.ok) throw new Error(`${resp.status} ${await resp.text()}`);
      const text = await resp.text();
      try {
        const json = JSON.parse(text);
        setResult(JSON.stringify(json, null, 2));
      } catch {
        setResult(text);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInvoiceData = (data) => {
    if (!data) return null;
    return (
      <div className="space-y-6">
        <div className="bg-[#161b22] rounded-2xl border border-gray-800 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between">
            <div>
              <h3 className="text-2xl font-bold">Facture N° {data.invoice_number}</h3>
              <p className="text-blue-200">Client N° {data.client_number}</p>
            </div>
            <div className="text-right text-blue-200">
              <p>Date: {formatDate(data.invoice_date)}</p>
              <p>Échéance: {formatDate(data.due_date)}</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Client Info */}
            <div className="bg-[#0d1117] p-4 rounded-lg border border-green-500/20">
              <h4 className="text-lg font-semibold text-green-400 flex items-center mb-2">
                🧑 Client
              </h4>
              <p className="font-medium">{data.customer_name}</p>
              <p className="text-gray-400">{data.customer_address}</p>
            </div>

            {/* Contract Details */}
            {data.contract_details?.length > 0 && (
              <div className="bg-[#0d1117] p-4 rounded-lg border border-blue-500/20 overflow-x-auto">
                <h4 className="text-lg font-semibold text-blue-400 mb-4">📄 Détails du Contrat</h4>
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
                <h4 className="text-lg font-semibold text-purple-400 mb-4">📝 Détails des Services</h4>
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
                <span className="text-gray-400">Montant HT</span>
                <span>{formatCurrency(data.total_amount_before_tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">TVA ({data.vat_percentage}%)</span>
                <span>{formatCurrency(data.vat_amount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-gray-700 pt-2">
                <span>Total TTC</span>
                <span>{formatCurrency(data.total_amount_with_tax)}</span>
              </div>
              {data.outstanding_balance > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Solde précédent</span>
                  <span>{formatCurrency(data.outstanding_balance)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200 p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Upload Card */}
      <div className="bg-[#161b22] rounded-2xl shadow-lg border border-gray-800 mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center gap-3 text-2xl font-bold">
          📤 Upload Facture
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
                <p className="text-sm text-gray-500">PDF files only</p>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-2 rounded-lg flex items-center gap-2"
              >
                {loading ? 'Processing...' : 'Extract Data'}
              </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
          </form>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-[#161b22] rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
          <div className="p-6 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-bold">
            🧾 Extracted Invoice Data
            <button
              onClick={() => saveToDatabase(JSON.parse(result)?.data)}
              className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-lg flex items-center gap-2"
            >
              Save to DB
            </button>
          </div>
          <div className="p-6">{renderInvoiceData(JSON.parse(result)?.data)}</div>
          {saveStatus && (
            <div className={`p-4 text-sm ${saveStatus.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
              {saveStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
