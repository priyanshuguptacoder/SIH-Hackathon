import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import SignupImage from '../assets/SignupImage.png';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const { data: result } = await api.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword,
      });

      login(result.data.token, {
        id: result.data.userId,
        name: result.data.name,
        email: result.data.email,
        role: result.data.role,
      });

      navigate('/wizard');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        'Cannot connect to the authorization server.';

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex bg-[#fdf7ff] overflow-hidden">

      {/* =====================================================
          LEFT SIDE - REGISTRATION
      ===================================================== */}
      <div className="w-full md:w-1/2 min-h-screen flex flex-col justify-center items-center px-6 md:px-10 lg:px-16 bg-white relative z-10 overflow-y-auto">

        <div className="w-full max-w-[420px] py-8">

          {/* Brand */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <ShieldCheck className="w-8 h-8 text-[#4f378a]" />

              <h1 className="text-[28px] md:text-[30px] font-bold tracking-tight text-[#4f378a]">
                Industrial Portal
              </h1>
            </div>

            <h2 className="text-2xl leading-8 font-semibold text-[#1d1b20] mb-2">
              Create Account
            </h2>

            <p className="text-sm leading-5 text-[#494551]">
              Start your industrial journey with clear regulatory compliance.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-xs tracking-wide font-semibold text-[#494551]"
              >
                FULL NAME
              </label>

              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7582] group-focus-within:text-[#4f378a] transition-colors" />

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#fdf7ff] border border-[#cbc4d2] rounded-lg text-[#1d1b20] placeholder-[#7a7582] focus:outline-none focus:ring-2 focus:ring-[#4f378a] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-xs tracking-wide font-semibold text-[#494551]"
              >
                EMAIL ADDRESS
              </label>

              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7582] group-focus-within:text-[#4f378a] transition-colors" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#fdf7ff] border border-[#cbc4d2] rounded-lg text-[#1d1b20] placeholder-[#7a7582] focus:outline-none focus:ring-2 focus:ring-[#4f378a] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-xs tracking-wide font-semibold text-[#494551]"
              >
                PASSWORD
              </label>

              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7582] group-focus-within:text-[#4f378a] transition-colors" />

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-[#fdf7ff] border border-[#cbc4d2] rounded-lg text-[#1d1b20] placeholder-[#7a7582] focus:outline-none focus:ring-2 focus:ring-[#4f378a] focus:border-transparent transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7582] hover:text-[#4f378a] transition-colors"
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-xs tracking-wide font-semibold text-[#494551]"
              >
                CONFIRM PASSWORD
              </label>

              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7582] group-focus-within:text-[#4f378a] transition-colors" />

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-[#fdf7ff] border border-[#cbc4d2] rounded-lg text-[#1d1b20] placeholder-[#7a7582] focus:outline-none focus:ring-2 focus:ring-[#4f378a] focus:border-transparent transition-all"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7582] hover:text-[#4f378a] transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Create Account */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 mt-2 bg-[#4f378a] hover:bg-[#6750a4] disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Login */}
          <div className="mt-7 text-center">
            <p className="text-sm text-[#494551]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#4f378a] font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* =====================================================
          RIGHT SIDE - SIGNUP IMAGE
      ===================================================== */}
      <div className="hidden md:flex w-1/2 min-h-screen relative overflow-hidden items-center justify-center">

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${SignupImage})`,
          }}
        />

        {/* Purple Overlay */}
        <div className="absolute inset-0 bg-[#4f378a]/50" />

        {/* Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />

        {/* =================================================
            CENTER CONTENT
        ================================================= */}
        <div className="relative z-20 w-[86%] max-w-[560px] text-white">

          {/* Icon */}
          <ShieldCheck className="w-12 h-12 text-[#ffdf93] mb-6" />

          {/* Heading */}
          <h3 className="text-4xl lg:text-[42px] leading-tight font-bold tracking-tight mb-5">
            Faster Approvals.
            <br />
            Smarter Compliance.
          </h3>

          {/* Description */}
          <p className="text-base lg:text-lg leading-7 text-white/90 mb-8 max-w-[520px]">
            A unified platform to simplify industrial approvals,
            track regulatory requirements, and bring transparency
            to the compliance process.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">

            {/* Unified */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-4">
              <p className="text-xl lg:text-2xl font-bold text-[#ffdf93]">
                UNIFIED
              </p>

              <p className="text-xs lg:text-sm font-semibold tracking-wide uppercase text-white/80 mt-1">
                Approval Management
              </p>
            </div>

            {/* Transparent */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-4">
              <p className="text-xl lg:text-2xl font-bold text-[#ffdf93]">
                TRANSPARENT
              </p>

              <p className="text-xs lg:text-sm font-semibold tracking-wide uppercase text-white/80 mt-1">
                Compliance Tracking
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;