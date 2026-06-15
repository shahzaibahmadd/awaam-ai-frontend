import Head from 'next/head';
import Navbar from './Navbar';
import BlobCursor from './BlobCursor';

export default function Layout({ children, noScroll = false }) {
  return (
    <>
      <Head>
        <title>🇵🇰 Awaam AI</title>
        <meta name="description" content="AI Assistant for Pakistani Documents" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" /> {/* Make sure to have a favicon in /public */}
      </Head>

      {/* App background and subtle radial gradient */}
      <div className={`relative bg-gemini-bg text-gray-100 min-h-screen flex flex-col font-sans max-w-full overflow-x-hidden ${noScroll ? 'h-screen overflow-hidden' : ''}`}>
        <div className="pointer-events-none absolute left-0 right-0 top-[-10%] mx-auto h-[40rem] w-[40rem] rounded-full bg-emerald-500/10 blur-[120px]" />
        
        {/* Custom GSAP-driven BlobCursor */}
        <BlobCursor 
          blobType="circle" 
          fastDuration={0.12} 
          fillColor="#46DBA5" 
          filterStdDeviation={40} 
          innerSizes={[0, 0, 0]} 
          opacities={[0.15, 0.10, 0.05]} 
          sizes={[160, 240, 200]} 
          slowDuration={0.5} 
          trailCount={3} 
          zIndex={-10} 
        />

        <Navbar />
        {/* Main content area with padding-top to offset the fixed navbar */}
        {/* We use h-screen and pt-[57px] to make the content fill the viewport */}
        <main className={`flex-1 flex flex-col pt-[57px] relative max-w-full overflow-x-hidden ${noScroll ? 'h-[calc(100vh-57px)] overflow-hidden' : ''}`}>
          <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl animate-float" />
          {children}
        </main>
      </div>
    </>
  );
}