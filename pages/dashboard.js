
// pages/dashboard.js
import dynamic from 'next/dynamic';

import Layout from '../components/Layout';
// Load LiquidEther only on client to avoid SSR bundle and heavy initialization on server
const LiquidEther = dynamic(() => import('../components/LiquidEther'), { ssr: false, loading: () => null });
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { getToken } from '../lib/auth';

export default function Dashboard() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [chatStats, setChatStats] = useState({ total: 0, today: 0 });
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  // client-only background control
  const [isClient, setIsClient] = useState(false);
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push('/login');
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboardData();
    }
  }, [isLoggedIn]);

  const fetchDashboardData = async () => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch user stats (includes user data and chat stats)
      const statsRes = await api.get('/user/stats', { headers });
      setUserData(statsRes.data.user);
      setChatStats({
        total: statsRes.data.totalChats,
        today: statsRes.data.todayChats
      });

      // Fetch recent chats separately
      const chatsRes = await api.get('/chats', { headers });
      setRecentChats(chatsRes.data.slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Fallback data if API fails
      setUserData({ username: 'Guest', email: 'guest@example.com', createdAt: new Date() });
      setChatStats({ total: 0, today: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Defer background initialization to idle and only show on wider screens
  useEffect(() => {
    setIsClient(typeof window !== 'undefined');
    if (typeof window === 'undefined') return;

    // lower the minimum width so the background appears on more screens/devices
    const MIN_WIDTH = 640; // was 900 — show on typical laptop/tablet widths
    const schedule = () => {
      const shouldShow = window.innerWidth >= MIN_WIDTH;
      // initialize sooner so users see the background quickly; keep a conservative timeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => setShowBackground(shouldShow), { timeout: 300 });
      } else {
        setTimeout(() => setShowBackground(shouldShow), 120);
      }
    };

    schedule();
    const onResize = () => setShowBackground(window.innerWidth >= MIN_WIDTH);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (authLoading || !isLoggedIn) {
    return (
      <Layout>
        <div className="flex-1 grid place-items-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 grid place-items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const demoLinks = [
    { title: 'Start a new chat', href: '/chat' },
    { title: 'See information', href: '/info' },
    { title: 'DLIMS status', href: '/chat' },
    { title: 'NADRA services', href: '/chat' },
  ];

  return (
    <Layout>
      <div className="relative w-full">
        {/* Liquid Ether background (client-only, deferred, wide screens) */}
        {isClient && showBackground && (
          <div className="absolute inset-0 -z-0">
            <LiquidEther
              // lighter green palette for better visibility
              colors={['#A7F3D0', '#6EE7B7', '#34D399']}
              // lowered interaction/force
              mouseForce={12}
              cursorSize={60}
              isViscous={false}
              viscous={12}
              // far fewer iterations -> much faster
              iterationsViscous={6}
              iterationsPoisson={6}
              // lower resolution -> smaller FBOs and faster rendering
              resolution={0.35}
              isBounce={false}
              // keep demo but lower intensity/speed for performance
              autoDemo={true}
              autoSpeed={0.35}
              autoIntensity={1.6}
              takeoverDuration={0.25}
              autoResumeDelay={3000}
              autoRampDuration={0.6}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-6xl w-full px-4 py-8 space-y-8">
          {/* Welcome Section */}
          <section className="animate-fadeIn">
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-[#46DBA5] to-emerald-400">
              Welcome back, {userData?.name || userData?.username || 'Guest'}!
            </h1>
            <p className="mt-1 text-gray-400">Here's your personalized dashboard with insights and quick access.</p>
          </section>

          {/* Stats Cards */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fadeIn">
            <div className="rounded-2xl border border-white/5 bg-gemini-surface/80 backdrop-blur-md p-5 transition-all duration-300 hover:border-gemini-green/20 hover:scale-[1.01]">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Chats</h3>
              <p className="mt-2 text-3xl font-bold text-gemini-green">{chatStats.total}</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-gemini-surface/80 backdrop-blur-md p-5 transition-all duration-300 hover:border-gemini-green/20 hover:scale-[1.01]">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Today's Chats</h3>
              <p className="mt-2 text-3xl font-bold text-gemini-green">{chatStats.today}</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-gemini-surface/80 backdrop-blur-md p-5 transition-all duration-300 hover:border-gemini-green/20 hover:scale-[1.01]">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Account Status</h3>
              <p className="mt-2 text-base font-bold text-gemini-green">✓ Active</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-gemini-surface/80 backdrop-blur-md p-5 transition-all duration-300 hover:border-gemini-green/20 hover:scale-[1.01]">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Member Since</h3>
              <p className="mt-2 text-base font-bold text-gray-200">
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '2025'}
              </p>
            </div>
          </section>

          {/* Profile & Usage Section */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-gemini-surface/60 backdrop-blur-md p-5 transition-all duration-300 hover:border-gemini-green/10">
              <h3 className="text-lg font-bold text-gray-100 mb-3 border-b border-white/5 pb-2">Your Profile</h3>
              <dl className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between"><dt>Name</dt><dd className="text-gray-200 font-medium">{userData?.name || userData?.username || 'Guest'}</dd></div>
                <div className="flex justify-between"><dt>Email</dt><dd className="text-gray-200 font-medium">{userData?.email || 'guest@example.com'}</dd></div>
                <div className="flex justify-between"><dt>Status</dt><dd className="text-gemini-green font-medium">Online</dd></div>
              </dl>
            </div>

            <div className="rounded-2xl border border-white/5 bg-gemini-surface/60 backdrop-blur-md p-5 transition-all duration-300 hover:border-gemini-green/10">
              <h3 className="text-lg font-bold text-gray-100 mb-3 border-b border-white/5 pb-2">Usage Insights</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {chatStats.today > 0
                  ? `You've been active today with ${chatStats.today} chat${chatStats.today > 1 ? 's' : ''}.`
                  : 'Start your first chat today to get personalized insights.'
                }
              </p>
              {chatStats.total > 0 && (
                <p className="mt-3 text-xs text-gemini-green/80 font-semibold bg-gemini-green/5 py-1 px-2.5 rounded-lg border border-gemini-green/10 w-fit">
                  Average: {Math.round(chatStats.total / Math.max(1, Math.floor((Date.now() - new Date(userData?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))))} chats/day
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/5 bg-gemini-surface/60 backdrop-blur-md p-5 transition-all duration-300 hover:border-gemini-green/10">
              <h3 className="text-lg font-bold text-gray-100 mb-3 border-b border-white/5 pb-2">Tips & Tricks</h3>
              <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
                <li>Ask in Urdu or English</li>
                <li>Prefix with department: "NADRA: family registration"</li>
                <li>Use specific keywords for better results</li>
              </ul>
            </div>
          </section>

          {/* Recent Activity */}
          {recentChats.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gemini-green"></span>
                Recent Activity
              </h2>
              <div className="space-y-3">
                {recentChats.map((chat, index) => (
                  <div key={chat._id || index} className="rounded-xl border border-white/5 bg-gemini-surface/50 hover:bg-gemini-surface/80 p-4 transition-all duration-300 hover:border-gemini-green/15">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-100">{chat.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{chat.lastMessage?.slice(0, 80) || 'No messages yet'}...</p>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Government Services Overview */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gemini-green"></span>
              Government Services
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {['DLIMS', 'NADRA', 'DGIP', 'Zameen', 'ECP', 'FBR', 'SECP', 'PSP'].map((service) => (
                <div key={service} className="rounded-xl border border-white/5 bg-gemini-surface/50 p-5 text-center transition-all duration-300 hover:border-gemini-green/20 hover:scale-[1.02] hover:bg-gemini-surface/80">
                  <h4 className="text-base font-bold text-gray-100">{service}</h4>
                  <p className="text-xs text-gray-400 mt-1">Government Service</p>
                  <a href="/chat" className="text-xs text-gemini-green font-semibold hover:text-[#3bb88b] mt-3 inline-block transition-colors">
                    Ask about {service} →
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gemini-green"></span>
              Quick Actions
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {demoLinks.map(link => (
                <a key={link.title} href={link.href} className="rounded-xl border border-white/5 bg-gemini-surface/50 hover:bg-gemini-surface/80 p-5 text-sm font-semibold text-gray-300 hover:border-gemini-green/20 hover:text-white transition-all duration-300 hover:scale-[1.02] flex justify-between items-center">
                  <span>{link.title}</span>
                  <span className="text-gemini-green">→</span>
                </a>
              ))}
            </div>
          </section>

          {/* News & Updates */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gemini-green"></span>
              Latest Updates
            </h2>
            <div className="space-y-3">
              <div className="rounded-xl border border-white/5 bg-gemini-surface/50 p-4 hover:border-gemini-green/10 transition-colors">
                <h4 className="text-sm font-semibold text-gray-100">New DLIMS Features</h4>
                <p className="text-xs text-gray-400 mt-1">Updated information about DLIMS services and requirements.</p>
                <span className="text-xs text-gray-500 font-medium mt-1 inline-block">2 days ago</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-gemini-surface/50 p-4 hover:border-gemini-green/10 transition-colors">
                <h4 className="text-sm font-semibold text-gray-100">NADRA Process Updates</h4>
                <p className="text-xs text-gray-400 mt-1">Streamlined procedures for CNIC applications.</p>
                <span className="text-xs text-gray-500 font-medium mt-1 inline-block">1 week ago</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-gemini-surface/50 p-4 hover:border-gemini-green/10 transition-colors">
                <h4 className="text-sm font-semibold text-gray-100">System Maintenance</h4>
                <p className="text-xs text-gray-400 mt-1">Scheduled maintenance completed successfully.</p>
                <span className="text-xs text-gray-500 font-medium mt-1 inline-block">2 weeks ago</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}