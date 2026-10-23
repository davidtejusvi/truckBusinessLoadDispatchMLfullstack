import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    role: 'CARRIER', market: 'USA', companyName: '',
  });

  const setField = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch {
      setFormError(error || 'Registration failed. Please try again.');
    }
  };

  const inputCls = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-navy-900";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg p-8">
        <div className="flex items-center gap-2 mb-8">
          <Truck className="w-7 h-7 text-accent" />
          <span className="text-2xl font-bold text-navy-900">TruckBiz</span>
        </div>
        <h1 className="text-2xl font-bold text-navy-900 mb-1">Create your account</h1>
        <p className="text-slate-500 mb-8">Already registered? <Link to="/login" className="text-accent font-semibold hover:underline">Sign in</Link></p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {(formError || error) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{formError || error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>First name</label><input value={form.firstName} onChange={e => setField('firstName', e.target.value)} required className={inputCls} placeholder="John" /></div>
            <div><label className={labelCls}>Last name</label><input value={form.lastName} onChange={e => setField('lastName', e.target.value)} required className={inputCls} placeholder="Doe" /></div>
          </div>
          <div><label className={labelCls}>Email address</label><input type="email" value={form.email} onChange={e => setField('email', e.target.value)} required className={inputCls} placeholder="john@carrier.com" /></div>
          <div><label className={labelCls}>Password</label><input type="password" value={form.password} onChange={e => setField('password', e.target.value)} required minLength={8} className={inputCls} placeholder="Min. 8 characters" /></div>
          <div><label className={labelCls}>Company name</label><input value={form.companyName} onChange={e => setField('companyName', e.target.value)} required className={inputCls} placeholder="Doe Trucking LLC" /></div>
          <div>
            <label className={labelCls}>Role</label>
            <select value={form.role} onChange={e => setField('role', e.target.value)} className={inputCls}>
              <option value="CARRIER">Carrier</option>
              <option value="BROKER">Broker</option>
              <option value="DISPATCHER">Dispatcher</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Market</label>
            <div className="grid grid-cols-2 gap-3">
              {['USA', 'EUROPE'].map(m => (
                <button key={m} type="button" onClick={() => setField('market', m)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    form.market === m ? 'border-accent bg-orange-50 text-accent' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span>{m === 'USA' ? '🇺🇸' : '🇪🇺'}</span>
                  <span>{m === 'USA' ? 'USA' : 'Europe'}</span>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-60 text-base">
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
