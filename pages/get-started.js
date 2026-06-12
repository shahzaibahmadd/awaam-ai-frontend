import Layout from '../components/Layout';
import Link from 'next/link';

export default function GetStartedPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
            Welcome to <span className="text-emerald-400">Awaam AI</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Your intelligent assistant for Pakistani government services. Get instant, accurate answers about DLIMS, NADRA, DGIP, Zameen, and more.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <div className="rounded-2xl border border-emerald-900/40 bg-gray-900/60 p-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-3">🚀 What We Offer</h3>
            <ul className="space-y-2 text-gray-400">
              <li>• Instant answers to government service questions</li>
              <li>• Step-by-step guidance for document processes</li>
              <li>• Updated information from official sources</li>
              <li>• Support in both Urdu and English</li>
              <li>• Secure and private conversations</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-900/40 bg-gray-900/60 p-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-3">🎯 Popular Services</h3>
            <div className="grid grid-cols-2 gap-2">
              {['DLIMS', 'NADRA', 'DGIP', 'Zameen', 'ECP', 'FBR'].map((service) => (
                <span key={service} className="text-sm bg-emerald-900/20 text-emerald-300 px-3 py-1 rounded-full text-center">
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-100 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8">Choose how you'd like to begin your journey with Awaam AI</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link 
              href="/login" 
              className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-500 transition-colors text-center"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="flex-1 bg-gray-800 text-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors text-center"
            >
              Register
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Already have an account? <Link href="/login" className="text-emerald-400 hover:text-emerald-300">Sign in here</Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}
