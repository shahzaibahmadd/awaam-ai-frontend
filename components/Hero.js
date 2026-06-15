import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Hero() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  // Keyboard shortcut: '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (isLoggedIn) {
      router.push(`/chat?prompt=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/login?redirect_query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative isolate min-h-[78vh] pt-16 md:pt-0 flex items-center justify-center overflow-hidden">
      <div className="mx-auto w-full max-w-3xl px-4 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">Pakistan Government Services</p>
        <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-100">
          <Split text="Good Evening," /> <span className="text-emerald-400"><Split text="Pakistanio!" delay={0.04} /></span>
        </h1>
        <p className="mt-3 text-gray-400 max-w-xl mx-auto">
          Ask anything about DLIMS, NADRA, DGIP, Zameen, and more. Awaam AI guides you with updated info and step‑by‑step answers.
        </p>

        {/* search / command input */}
        <form onSubmit={handleSearchSubmit} className="mt-8">
          <div className="group relative mx-auto flex max-w-xl items-center rounded-2xl border border-emerald-900/40 bg-gray-900/60 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-white/5 backdrop-blur-xl transition-colors hover:border-emerald-800">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent px-2 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none"
              placeholder="Type your request or command..."
            />
            <button type="submit" className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white ring-1 ring-emerald-500/40 transition-colors hover:bg-emerald-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M4.5 12a.75.75 0 01.75-.75h9.69l-3.72-3.72a.75.75 0 111.06-1.06l5 5a.75.75 0 010 1.06l-5 5a.75.75 0 11-1.06-1.06l3.72-3.72H5.25A.75.75 0 014.5 12z" />
              </svg>
            </button>
          </div>
          <div className="mt-3 flex justify-center gap-2 text-[12px] text-gray-500">
            <span className="kbd">/</span>
            <span>to focus •</span>
            <span className="kbd">Enter</span>
            <span>to send</span>
          </div>
        </form>

        {/* quick links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {['DLIMS','NADRA','DGIP','Zameen','ECP','FBR'].map((tag) => (
            <Link key={tag} href="/chat" className="rounded-full border border-emerald-900/40 bg-gray-900/50 px-3 py-1 text-xs text-gray-300 hover:text-white hover:border-emerald-800 transition-colors">
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Simple split-text animation utility (inspired by reactbits split-text)
function Split({ text, delay = 0.03 }) {
  return (
    <span aria-label={text} className="inline-block">
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className="inline-block will-change-transform"
          style={{
            transform: 'translateY(0.6em)',
            animation: `rise 600ms cubic-bezier(.2,.7,.2,1) forwards`,
            animationDelay: `${i * delay}s`,
          }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
      <style jsx>{`
        @keyframes rise { to { transform: translateY(0); } }
      `}</style>
    </span>
  );
}


