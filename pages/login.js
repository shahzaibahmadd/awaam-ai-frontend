import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { 
        email, 
        password 
      });

      if (res.data && res.data.token) {
        login(res.data.token); // Use the context to login
      } else {
        setError(res.data?.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot reach server.');
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/5">
          <h2 className="text-2xl font-bold text-white text-center mb-6">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition-colors"
            >
              Login
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-4">
            Don't have an account?{' '}
            <Link 
              href={router.query.redirect_query ? `/register?redirect_query=${encodeURIComponent(router.query.redirect_query)}` : "/register"} 
              className="text-green-400 hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}