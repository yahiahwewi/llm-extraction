import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hello from './pages/Hello';
import Extract from './pages/Extract';
import Factures from './pages/Factures';
import Parse from './pages/Parse';
import Index from './pages/Index';
import EndpointQuery from './pages/EndpointQuery';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      {/* Push content below fixed navbar (h-16) */}
      <div className="pt-16 min-h-screen bg-[#0d1117] text-gray-200">
        <Routes>
          <Route path="/" element={<Hello />} />
          <Route path="/extract" element={<Extract />} />
          <Route path="/factures" element={<Factures />} />
          <Route path="/parse" element={<Parse />} />
          <Route path="/index" element={<Index />} />
          <Route path="/endpoint-query" element={<EndpointQuery />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
