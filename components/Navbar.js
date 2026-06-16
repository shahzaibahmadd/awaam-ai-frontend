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
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  const navItems = isLoggedIn
    ? [
        { name: 'Dashboard', url: '/dashboard' },
        { name: 'News', url: '/news' },
        { name: 'Chat', url: '/chat' },
        { name: 'Tracker', url: '/tracker' },
        { name: 'Logout', url: '#', onClick: logout }
      ]
    : [
        { name: 'Home', url: '/' },
        { name: 'About', url: '/info' },
        { name: 'Get Started', url: '/get-started' }
      ];

  useEffect(() => {
    const currentItem = navItems.find(item => item.url !== '#' && router.pathname === item.url);
    if (currentItem) {
      setActiveTab(currentItem.name);
    } else {
      setActiveTab('');
    }
  }, [router.pathname, isLoggedIn]);

  return (
    <header className="fixed top-0 left-0 right-0 z-20 border-b border-gemini-green/10 bg-gemini-bg/80 backdrop-blur-md w-full max-w-full overflow-hidden">
      <nav className="mx-auto max-w-6xl w-full px-4 py-3 flex items-center justify-between overflow-hidden">
        <Link href="/" className="shrink-0">
          <div className="flex items-center gap-3.5 group cursor-pointer select-none">
            {/* Dynamic Graphic Container */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#46DBA5]/20 to-[#051e1a]/90 border border-[#46DBA5]/30 shadow-[0_0_20px_rgba(70,219,165,0.08)] group-hover:border-[#46DBA5]/60 group-hover:shadow-[0_0_25px_rgba(70,219,165,0.2)] transition-all duration-300 ease-out">
              
              {/* Subtle Ambient Background Radial Glow inside the box */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#46DBA5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Geometric Tech-Crescent SVG */}
              <svg 
                className="w-5.5 h-5.5 text-[#46DBA5] transform group-hover:scale-105 group-hover:-rotate-6 transition-all duration-300 ease-out" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Main sleek geometric curve */}
                <path d="M12 3a9 9 0 1 0 9 9 9.75 9.75 0 0 0-.67-3.47" />
                {/* Sharp inner AI nodes connecting path */}
                <path d="M12 8l4 4-4 4" className="stroke-[1.8] opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                {/* Micro floating tech spark node */}
                <circle cx="12" cy="8" r="1" fill="#46DBA5" className="animate-pulse" />
              </svg>

              {/* Outer Blur Ring active on hover */}
              <div className="absolute -inset-0.5 rounded-xl bg-[#46DBA5]/20 opacity-0 group-hover:opacity-100 blur-md transition-all duration-300 -z-10" />
            </div>

            {/* Brand Text Typography Layout */}
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-tight">
                Awaam <span className="bg-gradient-to-r from-[#46DBA5] to-emerald-300 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="text-[10px] font-medium tracking-widest text-gray-500 uppercase transition-colors group-hover:text-gray-400">
                Civic Assistant
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 backdrop-blur-md py-1 px-1 rounded-full shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.url}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
                setActiveTab(item.name);
              }}
              className={`relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors ${
                activeTab === item.name ? 'text-[#46DBA5]' : 'text-gray-400 hover:text-[#46DBA5]'
              }`}
            >
              <span className="relative z-10">{item.name}</span>
              {activeTab === item.name && (
                <motion.div
                  layoutId="navbar-lamp"
                  className="absolute inset-0 w-full bg-[#46DBA5]/5 rounded-full -z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#46DBA5] rounded-t-full">
                    <div className="absolute w-12 h-6 bg-[#46DBA5]/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-4 bg-[#46DBA5]/10 rounded-full blur-sm top-0" />
                  </div>
                </motion.div>
              )}
            </Link>
          ))}
        </div>

        <button aria-label="Menu" className="md:hidden text-gray-200 hover:text-white transition-colors shrink-0 p-1" onClick={() => setMenuOpen(v => !v)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100 py-3 border-t border-gray-800' : 'max-h-0 opacity-0 overflow-hidden'} bg-gray-900/95 backdrop-blur-xl`}>
        <div className="px-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.url}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
                setActiveTab(item.name);
                setMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-full text-sm font-semibold transition-colors block ${
                activeTab === item.name ? 'bg-[#46DBA5]/10 text-[#46DBA5]' : 'text-gray-400 hover:text-[#46DBA5]'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .button-primary { 
          @apply px-4 py-2 rounded-md text-sm md:text-[18px] font-bold bg-[#46DBA5] text-teal-950 hover:bg-[#3bb88b] transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-[#46DBA5]/25; 
        }
        .button-secondary { 
          @apply px-4 py-2 rounded-md text-sm md:text-[18px] font-medium bg-gemini-surface text-gray-200 hover:bg-gemini-hover transition-all duration-200 hover:scale-105; 
        }
        .button-danger { 
          @apply px-4 py-2 rounded-md text-sm md:text-[18px] font-medium bg-red-600/80 text-white hover:bg-red-500 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25; 
        }
      `}</style>
    </header>
  );
}