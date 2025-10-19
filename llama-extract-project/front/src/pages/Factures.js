import React, { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5000';

// Reuse the formatters from Extract.js
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-TN', { 
    style: 'currency', 
    currency: 'TND'
  }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}`).toLocaleDateString('fr-TN');
};

export default function Factures() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchFactures();
  }, []);

  const fetchFactures = async () => {
    try {
      const resp = await fetch(`${BACKEND_URL}/factures`, { mode: 'cors' });
      if (!resp.ok) throw new Error('Failed to fetch factures');
      const data = await resp.json();
      setFactures(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredFactures = factures.filter(facture => 
    facture.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facture.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFactures = [...filteredFactures].sort((a, b) => {
    const dateA = new Date(a.invoice_date);
    const dateB = new Date(b.invoice_date);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const renderFactureDetails = (facture) => (
    <div className="space-y-6">
      <div className="card bg-gray-800 text-gray-100 shadow-md rounded-xl">
        <div className="card-header bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl">
          <div className="flex justify-between items-center text-white p-4">
            <div>
              <h3 className="text-2xl font-bold">Facture N° {facture.invoice_number}</h3>
              <p className="text-blue-100">Client N° {facture.client_number}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100">Date: {formatDate(facture.invoice_date)}</p>
              <p className="text-blue-100">Échéance: {formatDate(facture.due_date)}</p>
            </div>
          </div>
        </div>
        <div className="card-body p-4">
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-200 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Client
            </h4>
            <p className="text-lg font-medium">{facture.customer_name}</p>
            <p className="text-gray-300">{facture.customer_address}</p>
          </div>

          {facture.contract_details?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-200 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Détails du Contrat
              </h4>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead className="table-header bg-gray-700 text-gray-200">
                    <tr>
                      <th className="p-2 text-left">Contract Name</th>
                      <th className="p-2 text-left">Phone Number</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facture.contract_details.map((contract, i) => (
                      <tr key={i} className="border-b border-gray-600 hover:bg-gray-700/50">
                        <td className="p-2 font-medium">{contract.contract_name}</td>
                        <td className="p-2">{contract.phone_number}</td>
                        <td className="p-2 text-right font-semibold">{formatCurrency(contract.amount_with_tax)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-gray-300">Montant HT</span>
                <span>{formatCurrency(facture.total_amount_before_tax)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-300">TVA ({facture.vat_percentage}%)</span>
                <span>{formatCurrency(facture.vat_amount)}</span>
              </div>
              <div className="flex justify-between py-2 font-semibold text-lg border-t border-gray-600">
                <span>Total TTC</span>
                <span>{formatCurrency(facture.total_amount_with_tax)}</span>
              </div>
              {facture.outstanding_balance > 0 && (
                <div className="flex justify-between py-1 text-red-500">
                  <span>Solde précédent</span>
                  <span>{formatCurrency(facture.outstanding_balance)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-400">Loading factures...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <div className="alert alert-danger max-w-md">
        <div className="flex items-center text-red-400">
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>Error: {error}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="card mb-6 bg-gray-800 text-gray-100 shadow-md rounded-xl">
        <div className="card-header p-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="p-2 bg-blue-600 rounded-lg">📋</span>
            Liste des Factures
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search factures..."
                className="pl-10 pr-4 py-2 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <select
              className="py-2 px-3 rounded-lg bg-gray-700 text-gray-100"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1">
          <div className="card h-[calc(100vh-250px)] overflow-hidden bg-gray-800 text-gray-100 shadow-md rounded-xl">
            <div className="card-header bg-gray-700 p-4 rounded-t-xl">
              <h2 className="text-lg font-semibold">Factures ({sortedFactures.length})</h2>
            </div>
            <div className="card-body p-0 overflow-y-auto">
              {sortedFactures.length > 0 ? (
                <div className="divide-y divide-gray-600">
                  {sortedFactures.map(facture => (
                    <div
                      key={facture.id}
                      className={`p-4 cursor-pointer transition-all duration-200 ${
                        selectedFacture?.id === facture.id ? 'bg-blue-600/20 border-l-4 border-blue-500' : 'hover:bg-gray-700/50'
                      }`}
                      onClick={() => setSelectedFacture(facture)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{facture.invoice_number}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">
                          {formatDate(facture.invoice_date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{facture.customer_name}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-blue-400">
                          {formatCurrency(facture.total_amount_with_tax)}
                        </span>
                        {facture.outstanding_balance > 0 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-600 text-white">
                            Outstanding
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
                  <p>No factures found</p>
                  <p className="text-sm mt-1">Try adjusting your search</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          <div className="card h-[calc(100vh-250px)] overflow-hidden bg-gray-800 text-gray-100 shadow-md rounded-xl">
            <div className="card-header bg-gray-700 p-4 rounded-t-xl">
              <h2 className="text-lg font-semibold">Facture Details</h2>
            </div>
            <div className="card-body overflow-y-auto p-4">
              {selectedFacture ? (
                renderFactureDetails(selectedFacture)
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p className="text-lg">Select a facture to view details</p>
                  <p className="text-sm mt-1">Click on a facture from the list</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
