import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Footer from './components/Footer';
import Marketplace from './pages/Marketplace';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Landing Page Component
const LandingPage = () => (
  <>
    <Header />
    <main>
      <Hero />
      <Stats />
      <HowItWorks />
      <Features />
    </main>
    <Footer />
  </>
);

// Wrapped Marketplace Page to include Header/Footer
const MarketplaceLayout = () => (
  <>
    <Header />
    <Marketplace />
    <Footer />
  </>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/marketplace" element={<MarketplaceLayout />} />
          <Route path="/login" element={<Login />} />
          {/* Protected Routes (Simulated) */}
          <Route path="/advertisers" element={<Dashboard type="advertiser" />} />
          <Route path="/publishers" element={<Dashboard type="publisher" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
