import React, { useState } from 'react';

const BACKEND_URL = 'http://localhost:5000';

// Component to render tables with better styling
function InvoiceTable({ table }) {
  if (!table.rows || table.rows.length === 0) return null;
  
  return (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-gray-300 bg-white shadow-sm rounded-lg">
        <thead>
          {table.rows.length > 0 && (
            <tr className="bg-blue-50">
              {table.rows[0].map((header, index) => (
                <th key={index} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
                  {header}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {table.rows.slice(1).map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Component to render headings
function InvoiceHeading({ level, children }) {
  const headingClasses = {
    1: "text-2xl font-bold text-blue-800 mt-6 mb-4 pb-2 border-b border-blue-200",
    2: "text-xl font-semibold text-blue-700 mt-5 mb-3",
    3: "text-lg font-medium text-blue-600 mt-4 mb-2",
    default: "text-base font-medium text-gray-700 mt-3 mb-2"
  };
  
  const Tag = `h${level || '3'}`;
  return <Tag className={headingClasses[level] || headingClasses.default}>{children}</Tag>;
}

// Component to render text content
function InvoiceText({ children, className = "" }) {
  return <p className={`text-gray-700 mb-3 ${className}`}>{children}</p>;
}

// Component to render invoice details in a card format
function InvoiceDetails({ title, details }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <h3 className="text-lg font-semibold text-blue-700 mb-3">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {details.map((detail, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-600">{detail.label}:</span>
            <span className="font-medium text-gray-800">{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component to render payment information
function PaymentInfo({ amount, dueDate, reference }) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">Payment Information</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-700">Amount Due:</span>
          <span className="font-bold text-blue-800 text-lg">{amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Due Date:</span>
          <span className="font-medium text-gray-800">{dueDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Reference:</span>
          <span className="font-medium text-gray-800">{reference}</span>
        </div>
      </div>
    </div>
  );
}

// Component to render contact information
function ContactInfo({ contact }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
      <div className="space-y-2">
        {contact.map((item, index) => (
          <div key={index} className="text-gray-700">{item}</div>
        ))}
      </div>
    </div>
  );
}

// Component to render a page of the invoice
function InvoicePage({ page }) {
  // Extract key information from the page
  const extractInvoiceInfo = () => {
    const info = {
      customer: null,
      invoice: null,
      payment: null,
      contact: null,
      hasTables: false,
      hasImages: false
    };
    
    // Check if page has tables
    if (page.items && page.items.some(item => item.type === 'table')) {
      info.hasTables = true;
    }
    
    // Check if page has images
    if (page.images && page.images.length > 0) {
      info.hasImages = true;
    }
    
    // Extract customer information
    if (page.page === 1) {
      const customerDetails = [];
      const invoiceDetails = [];
      
      // Look for customer and invoice details in the text
      if (page.text) {
        const lines = page.text.split('\n');
        let currentSection = null;
        
        lines.forEach(line => {
          if (line.includes('votre compte')) {
            currentSection = 'customer';
          } else if (line.includes('facture N°')) {
            currentSection = 'invoice';
          } else if (line.includes('montant à payer')) {
            const match = line.match(/montant à payer\s+([\d.]+)/);
            if (match) {
              info.payment = {
                amount: match[1],
                dueDate: null
              };
            }
          } else if (line.includes('date limite de paiement')) {
            const match = line.match(/date limite de paiement\s+(\d{2}\/\d{2}\/\d{4})/);
            if (match && info.payment) {
              info.payment.dueDate = match[1];
            }
          } else if (line.includes('pour nous joindre')) {
            currentSection = 'contact';
          } else if (currentSection === 'customer' && line.includes(':')) {
            const [label, value] = line.split(':').map(s => s.trim());
            customerDetails.push({ label, value });
          } else if (currentSection === 'invoice' && line.includes(':')) {
            const [label, value] = line.split(':').map(s => s.trim());
            invoiceDetails.push({ label, value });
          } else if (currentSection === 'contact' && line.trim()) {
            if (!info.contact) info.contact = [];
            info.contact.push(line.trim());
          }
        });
      }
      
      if (customerDetails.length > 0) info.customer = customerDetails;
      if (invoiceDetails.length > 0) info.invoice = invoiceDetails;
    }
    
    return info;
  };
  
  const invoiceInfo = extractInvoiceInfo();
  
  return (
    <div className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white px-6 py-4">
        <h2 className="text-xl font-bold">Page {page.page}</h2>
      </div>
      
      <div className="p-6">
        {/* Render customer information if available */}
        {invoiceInfo.customer && (
          <InvoiceDetails title="Customer Information" details={invoiceInfo.customer} />
        )}
        
        {/* Render invoice information if available */}
        {invoiceInfo.invoice && (
          <InvoiceDetails title="Invoice Details" details={invoiceInfo.invoice} />
        )}
        
        {/* Render payment information if available */}
        {invoiceInfo.payment && (
          <PaymentInfo 
            amount={invoiceInfo.payment.amount} 
            dueDate={invoiceInfo.payment.dueDate}
            reference={invoiceInfo.invoice?.find(d => d.label.includes('facture N°'))?.value}
          />
        )}
        
        {/* Render contact information if available */}
        {invoiceInfo.contact && (
          <ContactInfo contact={invoiceInfo.contact} />
        )}
        
        {/* Render page header if available */}
        {page.pageHeaderMarkdown && (
          <div className="mb-4 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
            <div dangerouslySetInnerHTML={{ __html: page.pageHeaderMarkdown.replace(/\n/g, '<br/>') }} />
          </div>
        )}
        
        {/* Render items based on their type */}
        {page.items && page.items.map((item, idx) => {
          if (item.type === 'table') return <InvoiceTable key={idx} table={item} />;
          if (item.type === 'heading') return <InvoiceHeading key={idx} level={item.lvl}>{item.value}</InvoiceHeading>;
          if (item.type === 'text') return <InvoiceText key={idx}>{item.value}</InvoiceText>;
          return null;
        })}
        
        {/* Render markdown content if available */}
        {page.md && (
          <div className="prose max-w-none my-4 p-4 bg-gray-50 rounded">
            <div dangerouslySetInnerHTML={{ __html: page.md.replace(/\n/g, '<br/>') }} />
          </div>
        )}
        
        {/* Render images if available */}
        {page.images && page.images.map((img, idx) => (
          <div key={idx} className="my-4">
            <img 
              src={img.url || ''} 
              alt={img.name || ''} 
              className="max-w-full rounded shadow-md" 
              style={{maxHeight: 400}} 
            />
          </div>
        ))}
        
        {/* Render page footer if available */}
        {page.pageFooterMarkdown && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-right text-sm text-gray-500">
            <div dangerouslySetInnerHTML={{ __html: page.pageFooterMarkdown.replace(/\n/g, '<br/>') }} />
          </div>
        )}
      </div>
    </div>
  );
}

// Main component
export default function Parse() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('raw');

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file');
    setLoading(true); 
    setError(''); 
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await fetch(`${BACKEND_URL}/parse`, {
        method: 'POST',
        body: formData,
        mode: 'cors'
      });
      if (!resp.ok) throw new Error(`${resp.status} ${await resp.text()}`);
      const data = await resp.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Invoice Parser</h1>
          
          <form onSubmit={onSubmit} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={onFileChange} 
                  id="file" 
                  className="hidden" 
                />
                <label 
                  htmlFor="file" 
                  className="cursor-pointer inline-block px-4 py-2 border border-gray-300 rounded bg-white shadow hover:bg-blue-50 transition-colors"
                >
                  {file ? file.name : 'Choose a PDF file'}
                </label>
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-6 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Parsing...' : 'Parse'}
              </button>
            </div>
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </form>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  className={`py-3 px-6 font-medium text-sm ${activeTab === 'formatted' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('formatted')}
                >
                  Formatted View
                </button>
                <button
                  className={`py-3 px-6 font-medium text-sm ${activeTab === 'raw' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('raw')}
                >
                  Raw Data
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'formatted' && result.pages && (
                <div>
                  {result.pages.map(page => (
                    <InvoicePage key={page.page} page={page} />
                  ))}
                </div>
              )}
              
              {activeTab === 'raw' && (
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}