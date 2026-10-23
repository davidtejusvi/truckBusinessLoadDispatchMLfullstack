import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setFormError(error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden md:flex md:w-1/2 bg-navy-900 flex-col justify-center px-16">
        <div className="flex items-center gap-3 mb-8">
          <Truck className="w-10 h-10 text-accent" />
          <span className="text-3xl font-bold text-white">TruckBiz</span>
        </div>
        <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">Welcome back, driver.</h2>
        <p className="text-slate-400 text-lg">Your loads are waiting. Sign in to get on the road.</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <Truck className="w-7 h-7 text-accent" />
            <span className="text-2xl font-bold text-navy-900">TruckBiz</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mb-2">Sign in to your account</h1>
          <p className="text-slate-500 mb-8">Don't have an account? <Link to="/register" className="text-accent font-semibold hover:underline">Get started</Link></p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {(formError || error) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{formError || error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-navy-900" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-navy-900" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-60 text-base">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
