import { useState } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../lib/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name, 
        email, 
        password
      });

      if (res.data) {
        setShowSuccessToast(true);
        setLoading(false);
        setTimeout(() => {
          const redirectQuery = router.query.redirect_query;
          if (redirectQuery) {
            router.push(`/login?redirect_query=${encodeURIComponent(redirectQuery)}`);
          } else {
            router.push('/login');
          }
        }, 2000);
      } else {
        setLoading(false);
        setError('Registration failed.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Cannot reach server.');
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {showSuccessToast && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-md animate-fadeIn">
            <svg className="w-6 h-6 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-white">Registration successful!</span>
              <span className="text-xs text-emerald-400/90 font-medium">Congrats! Please login to continue.</span>
            </div>
          </div>
        )}

        <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white text-center mb-6">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account?{' '}
            <Link 
              href={router.query.redirect_query ? `/login?redirect_query=${encodeURIComponent(router.query.redirect_query)}` : "/login"} 
              className="text-green-400 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </Layout>
  );
}