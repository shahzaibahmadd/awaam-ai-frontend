import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ChatSubnav({ activeTab: propActiveTab, onSelect, onToggleSidebar }) {
  const items = [
    'DLIMS', 'NADRA', 'DGIP', 'Zameen', 'ECP', 'FBR', 'SECP', 'PSP', 'Punjab Police'
  ];

  const [localActiveTab, setLocalActiveTab] = useState(items[0]);
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;

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
        <div className="flex-grow flex gap-2 overflow-x-auto no-scrollbar py-3">
          {items.map((item) => (
            <button
              key={item}
              onClick={() => {
                setLocalActiveTab(item);
                onSelect?.(item);
              }}
              className={`relative cursor-pointer text-sm font-semibold px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                activeTab === item ? 'text-[#46DBA5]' : 'text-gray-400 hover:text-[#46DBA5]'
              }`}
            >
              <span className="relative z-10">{item}</span>
              {activeTab === item && (
                <motion.div
                  layoutId="subnav-lamp"
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
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


