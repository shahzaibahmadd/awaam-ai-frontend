import Head from 'next/head';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>🇵🇰 Awaam AI</title>
        <meta name="description" content="AI Assistant for Pakistani Documents" />
        <link rel="icon" href="/favicon.ico" /> {/* Make sure to have a favicon in /public */}
      </Head>

      {/* App background and subtle radial gradient */}
      <div className="relative bg-gray-900 text-gray-100 min-h-screen flex flex-col font-sans">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute left-0 right-0 top-[-10%] mx-auto h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
        <Navbar />
        {/* Main content area with padding-top to offset the fixed navbar */}
        {/* We use h-screen and pt-[57px] to make the content fill the viewport */}
        <main className="flex-1 flex flex-col pt-[57px] h-screen">
          {children}
        </main>
      </div>
    </>
  );
}