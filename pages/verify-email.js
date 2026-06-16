import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Link from 'next/link';
import api from '../lib/api';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Wait for the router query to be populated
    if (!router.isReady) return;

    if (!token) {
      setError('Verification token is missing. Please check the link in your email.');
      setLoading(false);
      return;
    }

    const performVerification = async () => {
      try {
        const res = await api.get('/auth/verify-email', {
          params: { token }
        });
        setSuccess(true);
        setMessage(res.data?.message || 'Email verified successfully!');
      } catch (err) {
        setError(
          err.response?.data?.message || 
          'Email verification failed. The link may have expired or is invalid.'
        );
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [router.isReady, token]);

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4 relative bg-[#131314]">
        {/* Glow element matching other pages */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px]" />

        <div className="max-w-md w-full bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-white mb-6">🇵🇰 Awaam AI</h2>

          {loading && (
            <div className="py-8 flex flex-col items-center gap-4">
              <svg className="animate-spin h-12 w-12 text-[#46DBA5]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-300 font-medium">Verifying your email address...</p>
              <p className="text-sm text-gray-500">This will only take a moment.</p>
            </div>
          )}

          {!loading && success && (
            <div className="py-6 flex flex-col items-center">
              {/* Success Badge */}
              <div className="w-16 h-16 bg-[#46DBA5]/10 border border-[#46DBA5]/25 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#46DBA5]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Verification Successful!</h3>
              <p className="text-gray-300 text-sm mb-6 max-w-xs leading-relaxed">
                {message || 'Your email has been verified. You can now access your account and explore Pakistani documents.'}
              </p>

              <Link 
                href="/login" 
                className="w-full bg-[#46DBA5] text-[#041B18] py-2.5 rounded-lg font-bold hover:bg-[#3bc493] transition-colors shadow-lg hover:shadow-[#46DBA5]/25"
              >
                Go to Login
              </Link>
            </div>
          )}

          {!loading && error && (
            <div className="py-6 flex flex-col items-center">
              {/* Error Badge */}
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/25 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Verification Failed</h3>
              <p className="text-gray-300 text-sm mb-6 max-w-xs leading-relaxed">
                {error}
              </p>

              <div className="w-full flex flex-col gap-2">
                <Link 
                  href="/register" 
                  className="w-full bg-white/5 border border-white/10 text-white py-2.5 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Register Again
                </Link>
                <Link 
                  href="/login" 
                  className="w-full text-gray-400 hover:text-white py-2 text-sm transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
