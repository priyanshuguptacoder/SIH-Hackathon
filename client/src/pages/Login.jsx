import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Factory,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import LoginImage from '../assets/LoginImage.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data: result } = await api.post('/auth/login', {
        email,
        password,
      });

      login(result.data.token, {
        id: result.data.userId,
        name: result.data.name,
        email: result.data.email,
        role: result.data.role,
      });

      navigate('/dashboard');
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

      {/* ================= LEFT SIDE ================= */}
      <div className="w-full md:w-1/2 min-h-screen flex flex-col justify-center items-center px-6 md:px-10 lg:px-16 bg-white relative z-10">

        <div className="w-full max-w-[420px]">

          {/* Brand Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-[#4f378a]" />
              </div>

              <h1 className="text-[28px] md:text-[30px] font-bold tracking-tight text-[#4f378a]">
                Industrial Portal
              </h1>
            </div>

            <h2 className="text-2xl leading-8 font-semibold text-[#1d1b20] mb-2">
              Secure Industrial Login
            </h2>

            <p className="text-sm leading-5 text-[#494551]">
              Enter your credentials to access the compliance portal.
            </p>
          </div>

          {/* ================= LOGIN FORM ================= */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs tracking-wide font-semibold text-[#494551]"
              >
                EMAIL
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#7a7582] group-focus-within:text-[#4f378a] transition-colors" />
                </div>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#fdf7ff] border border-[#cbc4d2] rounded-lg text-[#1d1b20] placeholder-[#7a7582] focus:outline-none focus:ring-2 focus:ring-[#4f378a] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs tracking-wide font-semibold text-[#494551]"
                >
                  PASSWORD
                </label>

                <Link
                  to="#"
                  className="text-sm text-[#4f378a] hover:text-[#6750a4] font-semibold transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#7a7582] group-focus-within:text-[#4f378a] transition-colors" />
                </div>

                <input
                  id="password"
                  name="password"
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

            {/* Sign In */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#4f378a] hover:bg-[#6750a4] disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* ================= SIGN UP ================= */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#494551]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#4f378a] font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="absolute bottom-6 w-full text-center">
          <p className="text-xs tracking-wide font-semibold text-[#7a7582]">
            © 2026 Industrial Approval & Compliance Management Platform
          </p>
        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="hidden md:block w-1/2 min-h-screen relative overflow-hidden bg-[#ece6ee]">

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${LoginImage})`,
          }}
        />

        {/* Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* ================= BOTTOM CENTER CONTENT ================= */}
        <div className="absolute bottom-12 lg:bottom-16 left-1/2 -translate-x-1/2 w-[90%] flex justify-center text-white">

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 w-full max-w-[500px]">

            <Factory className="w-8 h-8 text-[#ffdf93] mb-3" />

            <h3 className="text-2xl font-bold mb-2">
              Streamlining Industrial Governance
            </h3>

            <p className="text-sm leading-5 text-white/80 max-w-[420px]">
              Simplifying industrial approvals and compliance for India’s manufacturing sector.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;