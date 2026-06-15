import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchNews = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      // const response = await axios.get(`http://localhost:5000/api/news${query ? `?keyword=${query}` : ''}`);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await axios.get(`${API_BASE_URL}/news${query ? `?keyword=${query}` : ''}`);

      if (response.data && response.data.success) {
        setNews(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news feed. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNews(search);
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diffMs = new Date() - new Date(dateStr);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return `Just now`;
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} days ago`;
  };

  return (
    <Layout>
      <main className="max-w-6xl mx-auto px-4 md:px-6 flex-1 w-full relative z-10 pt-16 pb-12 bg-transparent">

        {/* Page Header matching 'Good Evening, Pakistanio!' vibe */}
        <header className="mb-12 text-center md:text-left flex flex-col items-center md:items-start">
          <p className="text-emerald-500/80 font-bold tracking-[0.2em] text-xs uppercase mb-3">PAKISTAN GOVERNMENT & NEWS SERVICES</p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Daily Insights, <span className="text-emerald-400">Awaam News!</span>
          </h1>
          <p className="text-[16px] text-gray-400 max-w-2xl font-medium">
            Stay informed with AI-enhanced, unbiased news updates. We actively distill the latest public notices, legal happenings, and general country news into an easy-to-read format.
          </p>
        </header>

        {/* Dynamic Search Bar styled like Chat Input */}
        <form onSubmit={handleSearch} className="mb-12 flex items-center justify-center md:justify-start w-full relative group max-w-3xl">
          <div className="relative w-full flex items-center bg-[#131A26] rounded-full border border-gray-700/50 hover:border-emerald-500/40 focus-within:border-emerald-500/70 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all shadow-sm pl-6 pr-2 py-2.5">
            <input
              type="text"
              placeholder="Type a keyword or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-0 text-sm md:text-base font-medium py-1"
            />
            <div className="flex gap-2">
              {/* Search Button matching the circular send button */}
              <button
                type="submit"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 flex-shrink-0"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </div>
          </div>
        </form>

        {/* Status Messaging */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/10 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 animate-fade-in max-w-3xl">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="text-red-400 font-medium text-sm">{error}</span>
          </div>
        )}

        {/* News Cards Layout */}
        {!loading && !error && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-20">
            {news.length === 0 ? (
              <div className="break-inside-avoid w-full text-center py-16 bg-[#131A26] rounded-[24px] border border-gray-800 shadow-xl">
                <svg className="mx-auto h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16h8M8 12h8m-9 8h10a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-300 mb-1">No News Found</h3>
                <p className="text-gray-500 text-sm">Adjust filters or wait for the next cron job sweep.</p>
              </div>
            ) : (
              news.map((item, index) => (
                <Link
                  href={`/news/${item._id}`}
                  key={item._id}
                  className="break-inside-avoid bg-[#131A26] border border-gray-800 hover:border-emerald-600/40 
                  rounded-[24px] p-6 shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] cursor-pointer transition-all duration-300 group flex flex-col relative block"
                >
                  <div className="flex justify-between items-center mb-4 gap-2">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold uppercase tracking-wider rounded-md ring-1 ring-emerald-500/30 whitespace-nowrap">
                      {item.category}
                    </span>
                    <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
                      <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>

                  <h2 className="text-[18px] font-bold mb-3 leading-snug text-gray-100 group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h2>

                  {/* Subtle separator inside card */}
                  <div className="w-full h-px bg-gray-800/80 mb-3" />

                  <p className="text-gray-400 text-[14px] leading-[1.65] mb-5 flex-grow font-medium">
                    {item.enhancedContent}
                  </p>

                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-800/80">
                    <div className="flex items-center gap-2.5">
                      {item.sourceLogo ? (
                        <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center p-0.5 overflow-hidden ring-1 ring-gray-700">
                          <img src={item.sourceLogo} alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center text-[10px] font-extrabold text-emerald-500">
                          {item.source.substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <span className="text-[12px] font-semibold text-gray-400">
                        {item.source}
                      </span>
                    </div>

                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(item.originalLink, '_blank'); }}
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      Article
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </main>
    </Layout>
  );
}
