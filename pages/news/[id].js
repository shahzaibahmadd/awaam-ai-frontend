import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '../../components/Navbar';

export default function SingleNews() {
  const router = useRouter();
  const { id } = router.query;
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchNewsItem = async () => {
      try {
        setLoading(true);
        // const response = await axios.get(`http://localhost:5000/api/news/${id}`);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        const response = await axios.get(`${API_BASE_URL}/api/news/${id}`);
        if (response.data && response.data.success) {
          setNews(response.data.data);
        } else {
          setError('News article could not be loaded.');
        }
      } catch (err) {
        console.error('Error fetching single news:', err);
        setError(err.response?.status === 404 ? 'News article not found.' : 'Error loading article from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsItem();
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Karachi',
      dateStyle: 'full',
      timeStyle: 'short'
    }).format(date) + " (PKT)";
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news?.title || 'Awaam AI News',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B111D] text-gray-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 md:px-6 flex-1 w-full relative z-10 pt-28 pb-20">

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-32 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            <p className="text-gray-400 font-medium animate-pulse">Loading Insight...</p>
          </div>
        )}

        {/* 404 / Error Block */}
        {error && (
          <div className="mt-10 bg-[#131A26] border border-red-500/30 p-8 rounded-[24px] text-center shadow-xl max-w-2xl mx-auto">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h2 className="text-2xl font-bold text-gray-200 mb-2">Error Retrieval</h2>
            <p className="text-red-400 mb-8">{error}</p>
            <Link href="/news" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-semibold transition-colors">
              Return to News Feed
            </Link>
          </div>
        )}

        {/* Successfully Fetched Content */}
        {!loading && !error && news && (
          <article className="max-w-4xl mx-auto bg-[#131A26] border border-gray-800 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden fade-in">
            {/* Subtle Top Gradient Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-90"></div>

            {/* Navigational Action Bar */}
            <div className="mb-8 flex justify-between items-center">
              <Link href="/news" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors font-semibold py-2 px-4 rounded-full hover:bg-gray-800/50 -ml-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to News
              </Link>

              <button onClick={handleShare} className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 bg-gray-800/40 hover:bg-gray-800 transition-colors font-medium py-2 px-4 rounded-full border border-gray-700 hover:border-emerald-500/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                Share
              </button>
            </div>

            {/* Header Title Section */}
            <header className="mb-10">
              <div className="flex flex-wrap gap-3 items-center mb-6">
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-extrabold uppercase tracking-widest rounded-lg ring-1 ring-emerald-500/30">
                  {news.category}
                </span>

                <span className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  {formatDate(news.createdAt)}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mb-8 leading-tight text-white tracking-tight">
                {news.title}
              </h1>

              {/* Organized Source Reporting Meta container */}
              <div className="flex flex-wrap justify-between items-center py-4 border-y border-gray-800/80 bg-[#0F1520] -mx-4 px-4 rounded-xl">
                <div className="flex items-center gap-3">
                  {news.sourceLogo ? (
                    <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center p-1 overflow-hidden ring-1 ring-gray-700 shadow-sm">
                      <img src={news.sourceLogo} alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-gray-800 flex items-center justify-center text-xs font-black text-emerald-500 border border-gray-700">
                      {news.source.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-0.5">Reported By</p>
                    <p className="text-sm text-gray-200 font-bold">{news.source}</p>
                  </div>
                </div>

                <a
                  href={news.originalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 py-2 px-5 rounded-lg transition-colors border border-emerald-500/20"
                >
                  Read Original Source
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </header>

            {/* AI Enhanced Deep Reading Body */}
            <div className="prose prose-invert prose-emerald max-w-none">
              <p className="text-lg md:text-xl leading-[1.8] text-gray-300 font-medium whitespace-pre-wrap">
                {news.enhancedContent}
              </p>
            </div>

          </article>
        )}
      </main>
    </div>
  );
}
