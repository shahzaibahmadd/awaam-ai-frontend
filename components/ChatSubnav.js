export default function ChatSubnav({ onSelect }) {
  const items = [
    'DLIMS', 'NADRA', 'DGIP', 'Zameen', 'ECP', 'FBR', 'SECP', 'PSP', 'Punjab Police'
  ];

  return (
    <div className="sticky top-0 z-10 bg-gemini-bg pt-2">
      <div className="mx-auto max-w-3xl px-4 flex gap-6 overflow-x-auto no-scrollbar border-b border-gray-800">
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
  );
}


