// export default function Navbar() {
//   return (
//     <nav className="navbar">
//       <div className="navbar-left">
//         <h1 className="logo">AI Document Guide</h1>
//       </div>
//       <div className="navbar-right">
//         <a href="/login" className="nav-link">Login</a>
//         <a href="/register" className="nav-link">Register</a>
//       </div>

//       <style jsx>{`
//         .navbar {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 1rem 2rem;
//           background: #171717;
//           color: white;
//         }
//         .logo {
//           font-size: 1.5rem;
//           font-weight: bold;
//         }
//         .navbar-right {
//           display: flex;
//           gap: 1rem;
//         }
//         .nav-link {
//           background: #0070f3;
//           padding: 0.5rem 1rem;
//           border-radius: 5px;
//           color: white;
//           text-decoration: none;
//           transition: background 0.2s;
//         }
//         .nav-link:hover {
//           background: #0059c1;
//         }
//       `}</style>
//     </nav>
//   );
// }

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-20 border-b border-emerald-900/40 bg-gradient-to-b from-gray-900/80 to-gray-900/40 backdrop-blur-xl">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <span className="absolute inset-0 rounded-xl blur-md bg-emerald-500/30 group-hover:bg-emerald-400/40 transition-colors" />
              <span className="text-lg font-bold text-emerald-300">AI</span>
            </span>
            <span className="text-lg sm:text-xl font-semibold tracking-tight text-gray-100">
              Awaam AI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            {!isLoggedIn && (
              <>
                <Link href="/" className="nav-link">Home</Link>
                <Link href="/info" className="nav-link">About</Link>
                <Link href="/get-started" className="button-primary">Get Started</Link>
              </>
            )}
            {isLoggedIn && (
              <>
                <Link href="/dashboard" className={`nav-link ${router.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
                <Link href="/news" className={`nav-link ${router.pathname === '/news' ? 'active' : ''}`}>News</Link>
                <Link href="/chat" className={`nav-link ${router.pathname === '/chat' ? 'active' : ''}`}>Chat</Link>
                <Link href="/tracker" className={`nav-link ${router.pathname === '/tracker' ? 'active' : ''}`}>Tracker</Link>
                <button onClick={logout} className="button-danger">Logout</button>
              </>
            )}
          </div>
        </div>

        <button aria-label="Menu" className="md:hidden text-gray-200 hover:text-white transition-colors" onClick={() => setMenuOpen(v => !v)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`md:hidden origin-top transition-all duration-300 ${menuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'} bg-gray-900/80 backdrop-blur-xl border-t border-gray-800`}>
        <div className="px-4 py-3 flex flex-col gap-2">
          {!isLoggedIn && (
            <>
              <Link href="/" className="nav-link w-full">Home</Link>
              <Link href="/info" className="nav-link w-full">About</Link>
              <Link href="/get-started" className="button-primary w-full text-center">Get Started</Link>
            </>
          )}
          {isLoggedIn && (
            <>
              <Link href="/dashboard" className={`nav-link w-full ${router.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
              <Link href="/news" className={`nav-link w-full ${router.pathname === '/news' ? 'active' : ''}`}>News</Link>
              <Link href="/chat" className={`nav-link w-full ${router.pathname === '/chat' ? 'active' : ''}`}>Chat</Link>
              <Link href="/tracker" className={`nav-link w-full ${router.pathname === '/tracker' ? 'active' : ''}`}>Tracker</Link>
              <button onClick={logout} className="button-danger w-full text-left">Logout</button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .nav-link { 
          @apply relative px-3 py-2 text-sm md:text-[18px] rounded-md text-gray-300 hover:text-white transition-all duration-200; 
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: #34d399; /* emerald-400 */
          transition: width 0.3s ease;
        }
        .nav-link:hover::after, .nav-link.active::after {
          width: 100%;
        }
        .nav-link.active {
          color: white;
          font-weight: 600;
        }
        .button-primary { 
          @apply px-4 py-2 rounded-md text-sm md:text-[18px] font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25; 
        }
        .button-secondary { 
          @apply px-4 py-2 rounded-md text-sm md:text-[18px] font-medium bg-gray-800 text-gray-200 hover:bg-gray-700 transition-all duration-200 hover:scale-105; 
        }
        .button-danger { 
          @apply px-4 py-2 rounded-md text-sm md:text-[18px] font-medium bg-red-600 text-white hover:bg-red-500 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25; 
        }
      `}</style>
    </header>
  );
}