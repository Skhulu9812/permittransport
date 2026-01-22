
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, Lock, User as UserIcon, Loader2, Globe, Building2, Info, KeyRound } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulated network delay for professional feel
    setTimeout(() => {
      const foundUser = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
      
      if (foundUser && foundUser.password === password) {
        onLogin(foundUser);
      } else {
        setError('Verification failed. Invalid ID or PIN.');
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f2] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Structural Accents */}
      <div className="absolute top-0 left-0 w-full h-2 bg-yellow-600"></div>
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#064e3b 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="w-full max-w-lg z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Government Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 bg-white border-4 border-emerald-800 rounded-full flex items-center justify-center shadow-xl">
                <ShieldCheck className="w-12 h-12 text-emerald-900" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-yellow-600 p-1.5 rounded-full border-2 border-white">
                <Globe className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-emerald-950 uppercase tracking-tight">
            Public Transport Authority
          </h1>
          <p className="text-emerald-700 font-medium text-sm mt-1 uppercase tracking-widest">
            National Permit Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-none border-t-[6px] border-t-yellow-600 border border-emerald-100 shadow-[0_20px_50px_rgba(6,78,59,0.1)] overflow-hidden">
          <div className="bg-emerald-50/50 border-b border-emerald-100 px-10 py-4 flex justify-between items-center">
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em]">Secure Access Gateway</span>
            <Building2 className="w-4 h-4 text-emerald-200" />
          </div>

          <form onSubmit={handleLogin} className="p-10 space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">User Identification</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-600 text-emerald-300">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  className="w-full bg-white border-2 border-emerald-50 rounded-lg py-3.5 pl-12 pr-4 text-emerald-950 focus:border-emerald-600 focus:ring-0 outline-none transition-all placeholder:text-emerald-100"
                  placeholder="Username (e.g., admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">Security PIN / Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-600 text-emerald-300">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  className="w-full bg-white border-2 border-emerald-50 rounded-lg py-3.5 pl-12 pr-4 text-emerald-950 focus:border-emerald-600 focus:ring-0 outline-none transition-all placeholder:text-emerald-100"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 flex items-center gap-2 animate-in shake duration-300">
                <span className="text-red-700 text-xs font-bold">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-900 hover:bg-emerald-800 disabled:bg-emerald-300 text-white font-bold py-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <span className="text-sm tracking-widest uppercase">Sign In to Dashboard</span>
                </>
              )}
            </button>
            
            {/* Deployment Hints */}
            <div className="mt-6 space-y-3">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 flex items-start gap-3">
                <Info className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-emerald-900 uppercase">Registry Status</p>
                  <p className="text-[10px] text-emerald-700/60 leading-relaxed">System identity verified by hardware hash. If access is revoked, contact your local station administrator.</p>
                </div>
              </div>
              
              <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-3 flex items-start gap-3">
                <KeyRound className="w-4 h-4 text-yellow-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-yellow-900 uppercase">Support Credentials</p>
                  <p className="text-[10px] text-yellow-700/80 font-mono">admin / pta123</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Legal Footer */}
        <div className="mt-10 text-center px-4">
          <p className="text-[11px] text-emerald-800/40 leading-relaxed max-w-sm mx-auto">
            <strong className="text-emerald-800/60">NOTICE:</strong> This system is monitored. All activities are logged against the assigned personnel identification number.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
