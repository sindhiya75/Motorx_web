import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ShieldAlert, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  KeyRound, 
  ArrowLeft,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useToast } from '../../context/ToastContext';
import { requestAdminForgotPassword, resetAdminPassword } from '../../services/adminApi';

export default function AdminLogin() {
  // Mode: 'login' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Recovery form state
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { loginAdmin } = useAdminAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Handler 1: Standard Admin Login
  const handleLoginSubmit = async (e) => {
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

  // Handler 2: Step 1 Request 2FA OTP Code
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await requestAdminForgotPassword(recoveryEmail);
      setSuccessMessage(res.message || 'Verification code dispatched to your email.');
      addToast('2-Step Verification Code sent to your email!', 'info');
      setMode('reset');
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please check email address.');
    } finally {
      setLoading(false);
    }
  };

  // Handler 3: Step 2 Verify OTP & Reset Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter matching passwords.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetAdminPassword(recoveryEmail, otpCode, newPassword);
      addToast(res.message || 'Password successfully updated!', 'success');
      // Reset form states and return to login
      setEmail(recoveryEmail);
      setPassword('');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setMode('login');
      setSuccessMessage('Password reset verified! Please sign in with your new password.');
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen sm:min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#061426] via-[#092244] to-[#040d1a] overflow-hidden">
      
      {/* Decorative Ambient Background Elements */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Subtle High-Tech Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 max-w-sm sm:max-w-md w-full bg-white/[0.98] backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] space-y-4 my-auto">
        
        {/* ==================================================================== */}
        {/* VIEW 1: STANDARD ADMIN LOGIN                                         */}
        {/* ==================================================================== */}
        {mode === 'login' && (
          <>
            {/* Header */}
            <div className="text-center space-y-2.5">
              <div className="w-12 h-12 bg-gradient-to-tr from-navy-deep via-navy to-primary text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-primary/20 ring-4 ring-blue-50 transition-transform duration-300 hover:scale-105">
                <Lock className="w-6 h-6 text-blue-300" />
              </div>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-primary text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Sparkles className="w-3 h-3 text-primary" />
                <span>SEVAL DRONES CONTROL PANEL</span>
              </div>

              <div className="space-y-0.5">
                <h1 className="text-xl sm:text-2xl font-black text-navy tracking-tight">
                  Admin Portal Access
                </h1>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium max-w-xs mx-auto">
                  Sign in with administrative credentials to manage store operations, inventory & orders.
                </p>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <div className="text-[11px]">{error}</div>
              </div>
            )}

            {/* Success Notification */}
            {successMessage && !error && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-[11px]">{successMessage}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Admin Email Address *
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sevaldrones.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 placeholder:text-gray-400 placeholder:font-normal"
                  />
                  <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-primary absolute left-3 top-3 transition-colors pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    Admin Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryEmail(email || '');
                      setError(null);
                      setSuccessMessage(null);
                      setMode('forgot');
                    }}
                    className="text-[10px] font-bold text-primary hover:text-primary-hover hover:underline transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 placeholder:text-gray-400 placeholder:font-normal font-mono"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 group-focus-within:text-primary absolute left-3 top-3 transition-colors pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-navy transition-colors p-0.5 rounded-lg focus:outline-none cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-navy via-primary to-primary-hover hover:from-navy-light hover:to-primary text-white font-extrabold text-xs rounded-xl transition-all duration-200 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
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
          </>
        )}

        {/* ==================================================================== */}
        {/* VIEW 2: STEP 1 - REQUEST 2-STEP VERIFICATION CODE                   */}
        {/* ==================================================================== */}
        {mode === 'forgot' && (
          <>
            <div className="text-center space-y-2.5">
              <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto border border-blue-200 shadow-sm">
                <KeyRound className="w-6 h-6" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-primary text-[10px] font-extrabold uppercase tracking-wider">
                <span>STEP 1 OF 2: VERIFICATION REQUEST</span>
              </div>

              <div className="space-y-0.5">
                <h2 className="text-xl font-black text-navy tracking-tight">
                  2-Step Password Recovery
                </h2>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium max-w-xs mx-auto">
                  Enter your registered administrator email to receive a secure 6-digit authentication code.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <div className="text-[11px]">{error}</div>
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Admin Registered Email *
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="name@sevaldrones.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-primary absolute left-3 top-3 transition-colors pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-primary/25 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>DISPATCHING 2FA CODE...</span>
                  </>
                ) : (
                  <>
                    <span>SEND 2-STEP VERIFICATION CODE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('login');
                }}
                className="w-full py-2 text-slate-600 hover:text-navy text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </form>
          </>
        )}

        {/* ==================================================================== */}
        {/* VIEW 3: STEP 2 - 2-STEP OTP CODE & NEW PASSWORD                     */}
        {/* ==================================================================== */}
        {mode === 'reset' && (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider">
                <span>STEP 2 OF 2: VERIFY & RECOVER</span>
              </div>

              <div className="space-y-0.5">
                <h2 className="text-xl font-black text-navy tracking-tight">
                  Enter 2FA Code & New Password
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Verification code sent to <strong className="text-navy">{recoveryEmail}</strong>
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <div className="text-[11px]">{error}</div>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  6-Digit Verification Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center py-2 text-lg font-mono font-extrabold tracking-[8px] bg-gray-50 border border-primary/50 text-navy rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    New Password *
                  </label>
                  <div className="relative group">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars"
                      className="w-full pl-2.5 pr-8 py-2 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:bg-white text-gray-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-navy p-0.5 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full p-2 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:bg-white text-gray-900 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-1 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>UPDATING CREDENTIALS...</span>
                  </>
                ) : (
                  <>
                    <span>CONFIRM & RESET PASSWORD</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Resend Code
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('login');
                  }}
                  className="text-[10px] font-bold text-slate-500 hover:text-navy cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </>
        )}

        {/* Security Notice Card */}
        <div className="pt-0.5">
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium bg-slate-50/90 border border-slate-200/80 py-1.5 px-3 rounded-xl shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>256-bit Encrypted Admin Tunnel • Rate-Limited Access</span>
          </div>
        </div>

      </div>
    </div>
  );
}
