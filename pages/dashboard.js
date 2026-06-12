
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
      <div className="relative">
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

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 space-y-8">
          {/* Welcome Section */}
          <section>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
              Welcome back, {userData?.name || userData?.username || 'Guest'}!
            </h1>
            <p className="mt-1 text-gray-400">Here's your personalized dashboard with insights and quick access.</p>
          </section>

          {/* Stats Cards */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-emerald-900/40 bg-gray-900/60 p-5">
              <h3 className="text-lg font-semibold text-gray-100">Total Chats</h3>
              <p className="mt-2 text-2xl font-bold text-emerald-400">{chatStats.total}</p>
            </div>

            <div className="rounded-2xl border border-emerald-900/40 bg-gray-900/60 p-5">
              <h3 className="text-lg font-semibold text-gray-100">Today's Chats</h3>
              <p className="mt-2 text-2xl font-bold text-emerald-400">{chatStats.today}</p>
            </div>

            <div className="rounded-2xl border border-emerald-900/40 bg-gray-900/60 p-5">
              <h3 className="text-lg font-semibold text-gray-100">Account Status</h3>
              <p className="mt-2 text-sm text-emerald-400">✓ Active</p>
            </div>

            <div className="rounded-2xl border border-emerald-900/40 bg-gray-900/60 p-5">
              <h3 className="text-lg font-semibold text-gray-100">Member Since</h3>
              <p className="mt-2 text-sm text-gray-400">
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '2025'}
              </p>
            </div>
          </section>

          {/* Profile & Usage Section */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-emerald-900/40 bg-gray-900/60 p-5">
              <h3 className="text-lg font-semibold text-gray-100">Your Profile</h3>
              <dl className="mt-3 space-y-1 text-sm text-gray-400">
                <div className="flex justify-between"><dt>Name</dt><dd className="text-gray-200">{userData?.name || userData?.username || 'Guest'}</dd></div>
                <div className="flex justify-between"><dt>Email</dt><dd className="text-gray-200">{userData?.email || 'guest@example.com'}</dd></div>
                <div className="flex justify-between"><dt>Status</dt><dd className="text-emerald-400">Online</dd></div>
              </dl>
            </div>

            <div className="rounded-2xl border border-emerald-900/40 bg-gray-900/60 p-5">
              <h3 className="text-lg font-semibold text-gray-100">Usage Insights</h3>
              <p className="mt-2 text-sm text-gray-400">
                {chatStats.today > 0
                  ? `You've been active today with ${chatStats.today} chat${chatStats.today > 1 ? 's' : ''}.`
                  : 'Start your first chat today to get personalized insights.'
                }
              </p>
              {chatStats.total > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Average: {Math.round(chatStats.total / Math.max(1, Math.floor((Date.now() - new Date(userData?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))))} chats/day
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-emerald-900/40 bg-gray-900/60 p-5">
              <h3 className="text-lg font-semibold text-gray-100">Tips & Tricks</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-400">
                <li>Ask in Urdu or English</li>
                <li>Prefix with department: "NADRA: family registration"</li>
                <li>Use specific keywords for better results</li>
              </ul>
            </div>
          </section>

          {/* Recent Activity */}
          {recentChats.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentChats.map((chat, index) => (
                  <div key={chat._id || index} className="rounded-xl border border-emerald-900/40 bg-gray-900/60 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-100">{chat.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{chat.lastMessage?.slice(0, 60) || 'No messages yet'}...</p>
                      </div>
                      <span className="text-xs text-gray-600">
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Government Services Overview */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Government Services</h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {['DLIMS', 'NADRA', 'DGIP', 'Zameen', 'ECP', 'FBR', 'SECP', 'PSP'].map((service) => (
                <div key={service} className="rounded-xl border border-emerald-900/40 bg-gray-900/60 p-4 text-center">
                  <h4 className="text-sm font-medium text-gray-100">{service}</h4>
                  <p className="text-xs text-gray-500 mt-1">Government Service</p>
                  <a href="/chat" className="text-xs text-emerald-400 hover:text-emerald-300 mt-2 inline-block">
                    Ask about {service} →
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Quick Actions</h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {demoLinks.map(link => (
                <a key={link.title} href={link.href} className="rounded-xl border border-emerald-900/40 bg-gray-900/60 p-4 text-sm text-gray-300 hover:border-emerald-800 hover:text-white transition-colors">
                  {link.title}
                </a>
              ))}
            </div>
          </section>

          {/* News & Updates */}
          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Latest Updates</h2>
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-900/40 bg-gray-900/60 p-4">
                <h4 className="text-sm font-medium text-gray-100">New DLIMS Features</h4>
                <p className="text-xs text-gray-400 mt-1">Updated information about DLIMS services and requirements.</p>
                <span className="text-xs text-gray-600">2 days ago</span>
              </div>
              <div className="rounded-xl border border-emerald-900/40 bg-gray-900/60 p-4">
                <h4 className="text-sm font-medium text-gray-100">NADRA Process Updates</h4>
                <p className="text-xs text-gray-400 mt-1">Streamlined procedures for CNIC applications.</p>
                <span className="text-xs text-gray-600">1 week ago</span>
              </div>
              <div className="rounded-xl border border-emerald-900/40 bg-gray-900/60 p-4">
                <h4 className="text-sm font-medium text-gray-100">System Maintenance</h4>
                <p className="text-xs text-gray-400 mt-1">Scheduled maintenance completed successfully.</p>
                <span className="text-xs text-gray-600">2 weeks ago</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}