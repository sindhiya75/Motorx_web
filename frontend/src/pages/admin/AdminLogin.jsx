import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@motorx.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { loginAdmin } = useAdminAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const admin = await loginAdmin(email, password);
      addToast(`Welcome back, ${admin.name}!`, 'success', 'Admin Authenticated');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-hero">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-navy text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7 text-blue-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-primary text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> MOTORX Control Panel
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
            Admin Portal Access
          </h1>
          <p className="text-xs text-gray-500">
            Sign in with your administrative credentials to manage store operations, inventory & orders.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Admin Email *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@motorx.com"
                className="w-full pl-10 pr-3 py-3 text-xs font-medium bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-3 text-xs font-medium bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-navy hover:bg-navy-light text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              <>
                <span>SIGN IN TO ADMIN PORTAL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Footer Notice */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-gray-600 space-y-1">
          <div className="font-bold text-navy">Default Demo Credentials:</div>
          <div>Email: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 text-primary">admin@motorx.com</code></div>
          <div>Password: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 text-primary">Admin@123</code></div>
        </div>

      </div>
    </div>
  );
}
