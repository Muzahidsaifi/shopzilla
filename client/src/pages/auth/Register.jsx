import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, ShoppingCart, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=form, 2=otp
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Step 1: Register and send OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setRegisteredEmail(form.email);
      setStep(2);
      startResendTimer();
      toast.success(`OTP sent to ${form.email}!`, { icon: '📧' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        email: registeredEmail,
        otp: otpString
      });
      localStorage.setItem('token', res.data.token);
      toast.success('Email verified! Welcome to ShopZilla 🎉');
      navigate('/');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // OTP input handling
  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // Auto focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
    }
  };

  // Resend OTP timer
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    try {
      await api.post('/auth/resend-otp', { email: registeredEmail });
      toast.success('New OTP sent!', { icon: '📧' });
      startResendTimer();
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 hero-mesh">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-gradient">ShopZilla</span>
          </Link>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Registration Form */}
          {step === 1 && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="glass-card p-8"
            >
              <h2 className="font-display font-bold text-2xl mb-1">Create Account</h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                Join ShopZilla — OTP will be sent to your email ✉️
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name */}
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full Name *"
                    className="input-field pl-10"
                    required
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email Address *"
                    className="input-field pl-10"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone Number (optional)"
                    className="input-field pl-10"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password (min 6 chars) *"
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-primary-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Info box */}
                <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-xl p-3 text-sm">
                  <Mail size={14} className="mt-0.5 flex-shrink-0" />
                  <span>A 6-digit OTP will be sent to your email to verify your account.</span>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Send OTP <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-500 font-semibold hover:underline">Login</Link>
              </p>
            </motion.div>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="glass-card p-8"
            >
              {/* Success icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
                  <Mail size={28} className="text-white" />
                </div>
              </div>

              <h2 className="font-display font-bold text-2xl text-center mb-1">Check Your Email</h2>
              <p className="text-[var(--text-secondary)] text-sm text-center mb-2">
                OTP sent to
              </p>
              <p className="text-primary-500 font-semibold text-center mb-6 text-sm">{registeredEmail}</p>

              <form onSubmit={handleVerifyOTP}>
                {/* OTP Boxes */}
                <div className="flex gap-3 justify-center mb-6" onPaste={handleOTPPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 
                        bg-[var(--bg-secondary)] transition-all duration-200 outline-none
                        ${digit ? 'border-primary-500 text-primary-500' : 'border-[var(--border)]'}
                        focus:border-primary-500 focus:ring-2 focus:ring-primary-400/30`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><CheckCircle size={16} /> Verify OTP</>
                  )}
                </button>
              </form>

              {/* Resend */}
              <div className="text-center">
                <p className="text-sm text-[var(--text-secondary)] mb-2">Didn't receive the OTP?</p>
                <button
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0}
                  className="flex items-center gap-2 mx-auto text-sm font-semibold text-primary-500 disabled:text-[var(--text-muted)] hover:underline disabled:no-underline transition-colors"
                >
                  <RefreshCw size={14} className={resendTimer > 0 ? 'animate-spin' : ''} />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              {/* Change email */}
              <button
                onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); }}
                className="w-full text-center text-xs text-[var(--text-muted)] hover:text-primary-500 mt-4 transition-colors"
              >
                ← Change email address
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
