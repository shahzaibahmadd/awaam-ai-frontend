// components/ChatSidebar.js
import { useState, useEffect, useRef } from 'react';

export default function ChatSidebar({
  chats,
  selectedChatId,
  onSelectChat,
  onNewChat,
  showArchived,
  setShowArchived,
  onDeleteChat,
  onRenameChat,
  onArchiveChat,
  isOpen,
  onToggleSidebar
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const sidebarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRenameSubmit = (chatId) => {
    onRenameChat(chatId, editTitle);
    setEditingChatId(null);
  };

  const handleHamburgerClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onToggleSidebar?.();
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Resolve Tailwind compilation bug by using full literals for width classes
  const widthClass = isCollapsed ? 'w-72 md:w-20' : 'w-72 md:w-72';
  // Check if screen is mobile to force text visibility
  const showText = !isCollapsed || (typeof window !== "undefined" && window.innerWidth < 768);

  return (
    <aside ref={sidebarRef} className={`flex flex-col h-full bg-gemini-surface transition-all duration-300 rounded-r-2xl border-r border-gray-800 absolute md:static z-30 inset-y-0 left-0 ${isOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full md:translate-x-0'} ${widthClass}`}>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between text-gray-400">
          <button onClick={handleHamburgerClick} className="p-2 hover:bg-gemini-hover rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          {showText && <span className="text-sm font-medium text-gray-200">Awaam</span>}
        </div>

        <button
          onClick={onNewChat}
          className={`flex items-center gap-3 bg-[#009689] hover:bg-[#007F73] text-white rounded-xl py-3 transition-all ${(isCollapsed && (typeof window !== "undefined" && window.innerWidth >= 768)) ? 'justify-center px-3' : 'px-4'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {showText && <span className="text-sm font-medium">New chat</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1 no-scrollbar pb-20">
        {/* Active Chats Section */}
        {showText && !showArchived && <h3 className="px-4 text-xs font-medium text-gemini-text-secondary mt-2 mb-2">Recent</h3>}

        {chats.filter(c => showArchived ? c.archived : !c.archived).map((chat) => (
          <div
            key={chat._id}
            className={`group relative flex items-center gap-3 px-4 py-2 rounded-full cursor-pointer transition-colors text-sm ${selectedChatId === chat._id
              ? 'bg-gemini-green/10 text-gemini-green font-medium'
              : 'text-gemini-text hover:bg-gemini-hover'
              }`}
          >
            {editingChatId === chat._id ? (
              <input
                autoFocus
                className="flex-1 bg-transparent border border-gemini-green rounded px-2 py-1 text-white outline-none"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRenameSubmit(chat._id);
                  if (e.key === 'Escape') setEditingChatId(null);
                }}
                onBlur={() => handleRenameSubmit(chat._id)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="flex-1 flex items-center gap-3 overflow-hidden" onClick={() => onSelectChat(chat)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0 text-emerald-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.1.103.148.258.109.4l-.56 2.01a.75.75 0 00.947.923l2.217-.74c.141-.047.3-.021.417.07A8.96 8.96 0 0012 20.25z" />
                </svg>
                {showText && <span className="truncate">{chat.title || "New Chat"}</span>}
              </div>
            )}

            {showText && !editingChatId && (
              <div className="relative">
                <button
                  className="p-1 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === chat._id ? null : chat._id);
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                </button>

                {/* Dropdown Menu */}
                {activeMenuId === chat._id && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col py-1">
                    <button
                      className="text-left px-3 py-2 text-xs hover:bg-gray-700 text-gray-200 flex items-center gap-2"
                      onClick={(e) => { e.stopPropagation(); setEditTitle(chat.title || ""); setEditingChatId(chat._id); setActiveMenuId(null); }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      Rename
                    </button>
                    <button
                      className="text-left px-3 py-2 text-xs hover:bg-gray-700 text-gray-200 flex items-center gap-2"
                      onClick={(e) => { e.stopPropagation(); onArchiveChat(chat._id, !chat.archived); setActiveMenuId(null); }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                      {chat.archived ? "Unarchive" : "Archive"}
                    </button>
                    <button
                      className="text-left px-3 py-2 text-xs hover:bg-gray-700 text-red-400 flex items-center gap-2"
                      onClick={(e) => { e.stopPropagation(); onDeleteChat(chat._id); setActiveMenuId(null); }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {showText && (
          <button onClick={() => setShowArchived(!showArchived)} className="w-full text-left px-4 py-2 text-xs text-gemini-text-secondary hover:text-white mt-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            {showArchived ? "Hide Archived" : "Show Archived"}
          </button>
        )}
      </div>

      <div className="mt-auto p-2 border-t border-gray-800/50">
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-gemini-text hover:bg-gemini-hover transition-colors ${(isCollapsed && (typeof window !== "undefined" && window.innerWidth >= 768)) ? 'justify-center' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          {showText && <span className="text-sm">Help</span>}
        </button>
      </div>
    </aside>
  );
}