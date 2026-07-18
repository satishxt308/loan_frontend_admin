import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, LogIn } from 'lucide-react';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
 
  // Static credentials
  const validCredentials = {
    email: 'admindata@pswb.com',
    password: '123admin'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === validCredentials.email && password === validCredentials.password) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/50 mb-2">
            <img
  src="/logo.png"
  alt="PSWB Logo"
  className="w-8 h-8 object-contain"
/>
          </div>
          <h1 className="text-3xl font-bold text-amber-400">PSWB Admin</h1>
          <p className="text-gray-400">Transforming Agriculture · Empowering Farmers</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700 px-8 py-4 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-0 text-center">Admin Login</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 text-white placeholder-gray-500"
                  placeholder="admin@pswb.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 text-white placeholder-gray-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="w-full cursor-pointer flex items-center justify-center gap-2 py-2 px-4 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors font-semibold text-gray-900"
            >
              <LogIn className="w-5 h-5" />
              Login to Dashboard
            </button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          © 2024 PSWB Business Private Limited. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;