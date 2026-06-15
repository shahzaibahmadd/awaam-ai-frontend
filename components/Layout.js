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
          fillColor="#46DBA5"
          trailCount={3}
          // sizes={[60, 125, 75]}
          // innerSizes={[20, 35, 25]}
          // innerColor="rgba(255,255,255,0.8)"
          // opacities={[0.55, 0.55, 0.55]}
          // filterStdDeviation={30}


          // 1. EXACTLY HALF THE ORIGINAL SIZES: [60, 125, 75] -> [30, 62, 37]
          sizes={[30, 62, 37]}

          // 2. HALVED INNER CORE DOT SIZES: [20, 35, 25] -> [10, 17, 12]
          innerSizes={[10, 17, 12]}
          innerColor="rgba(255,255,255,0.4)" // Softened core white to match the body transparency

          // 3. MORE TRANSLUCENT BACKGROUND BLEND (Reduced from solid 0.55 down to elegant 15-25% values)
          opacities={[0.55, 0.28, 0.22]}

          filterStdDeviation={15} // Halved from 30 to prevent the smaller blobs from completely melting away

          useFilter={true}
          fastDuration={0.1}
          slowDuration={0.5}
          zIndex={0}
        />

        <Navbar />
        {/* Main content area with padding-top to offset the fixed navbar */}
        {/* We use h-screen and pt-[57px] to make the content fill the viewport */}
        <main className={`flex-1 flex flex-col pt-[57px] relative z-10 max-w-full overflow-x-hidden ${noScroll ? 'h-[calc(100vh-57px)] overflow-hidden' : ''}`}>
          <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl animate-float" />
          {children}
        </main>
      </div>
    </>
  );
}