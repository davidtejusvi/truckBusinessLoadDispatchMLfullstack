import { useNavigate } from 'react-router-dom';
import { Truck, ArrowRight, MapPin, TrendingUp, Shield } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <Truck className="w-8 h-8 text-accent" />
          <span className="text-2xl font-bold">TruckBiz</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/login')} className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</button>
          <button onClick={() => navigate('/register')} className="px-5 py-2 text-sm font-semibold bg-accent hover:bg-accent-dark rounded-xl transition-colors">Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-800 border border-navy-600 text-sm text-slate-300 mb-8">
          <span>🇺🇸 USA</span>
          <span className="text-slate-600">•</span>
          <span>🇪🇺 Europe</span>
          <span className="text-slate-600">•</span>
          <span>AI-Powered Freight</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Pick loads smarter.<br />
          <span className="text-accent">Drive more. Earn more.</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          The freight platform built for modern carriers. Find loads across USA and Europe, predict rates, and maximize your revenue — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/register')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-accent hover:bg-accent-dark text-white font-semibold text-lg rounded-2xl transition-all hover:scale-105"
          >
            Start for Free <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 border border-navy-600 hover:border-navy-500 text-slate-300 hover:text-white font-semibold text-lg rounded-2xl transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-8 pb-20 grid md:grid-cols-3 gap-6">
        {[
          { icon: <MapPin className="w-6 h-6" />, title: 'Find Loads', desc: 'Search thousands of loads across USA and Europe with smart filters.' },
          { icon: <TrendingUp className="w-6 h-6" />, title: 'Rate Predictions', desc: 'AI-powered rate forecasting to help you bid right and earn more.' },
          { icon: <Shield className="w-6 h-6" />, title: 'Trusted Platform', desc: 'Verified brokers and carriers with built-in compliance tools.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="bg-navy-800 rounded-2xl p-6 border border-navy-700">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent mb-4">{icon}</div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="border-t border-navy-700 px-8 py-6 text-center text-slate-500 text-sm">
        © 2024 TruckBiz. Built for carriers worldwide.
      </footer>
    </div>
  );
}
