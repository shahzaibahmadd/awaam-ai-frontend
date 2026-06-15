export default function ChatSubnav({ onSelect, onToggleSidebar }) {
  const items = [
    'DLIMS', 'NADRA', 'DGIP', 'Zameen', 'ECP', 'FBR', 'SECP', 'PSP', 'Punjab Police'
  ];

  return (
    <div className="sticky top-0 z-10 bg-gemini-bg pt-2">
      <div className="mx-auto max-w-3xl md:max-w-4xl px-4 flex items-center gap-4 border-b border-white/5">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors focus:outline-none"
          aria-label="Toggle Chat List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="flex-grow flex gap-6 overflow-x-auto no-scrollbar py-3">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onSelect?.(item)}
            className="group relative whitespace-nowrap py-3 text-[14px] font-medium text-gemini-text-secondary hover:text-gemini-text transition-colors"
          >
            {item}
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gemini-green scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full" />
          </button>
        ))}
      </div>
    </div>
  </div>
  );
}


