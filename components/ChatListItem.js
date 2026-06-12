import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import { getToken } from '../lib/auth';

export default function ChatListItem({ chat, onSelect, isSelected, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title);
  const [showOptions, setShowOptions] = useState(false);

  const handleRename = async () => {
    try {
      await api.patch(
        `/chats/${chat._id}`,
        { title: newTitle },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to rename chat:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    try {
      await api.delete(`/chats/${chat._id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleArchive = async () => {
    try {
      await api.patch(
        `/chats/${chat._id}`,
        { archived: !chat.archived },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to archive chat:', err);
    }
  };

  return (
    <div
      className={`relative group rounded-xl p-3 transition-colors border ${
        isSelected 
          ? 'border-emerald-700 bg-emerald-900/20' 
          : chat.archived
          ? 'border-gray-800 hover:border-gray-700 bg-gray-900/30'
          : 'border-gray-800 hover:border-emerald-800 bg-gray-900/50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex-1 cursor-pointer"
          onClick={() => !isEditing && onSelect(chat)}
        >
          {isEditing ? (
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="w-full bg-gray-800 text-gray-100 px-2 py-1 rounded-md text-sm"
              autoFocus
            />
          ) : (
            <>
              <div className="text-sm font-medium text-gray-100 flex items-center gap-2">
                {chat.archived && <span className="text-xs text-gray-500">[Archived]</span>}
                {chat.title}
              </div>
              <div className="text-xs text-gray-500 truncate">{chat.lastMessage?.slice(0, 52) || 'No messages'}</div>
              <div className="text-[10px] text-gray-600">{new Date(chat.updatedAt).toLocaleString()}</div>
            </>
          )}
        </div>
        
        <button
          onClick={() => setShowOptions(!showOptions)}
          aria-label="Open chat options"
          title="Options"
          // Make the options button visible on all items (not only on hover)
          className="opacity-90 hover:opacity-100 transition-opacity ml-2 text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Options Menu */}
      {showOptions && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            <button
              onClick={() => {
                setShowOptions(false);
                setIsEditing(true);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              Rename
            </button>
            <button
              onClick={() => {
                setShowOptions(false);
                handleArchive();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              {chat.archived ? 'Unarchive' : 'Archive'}
            </button>
            <button
              onClick={() => {
                setShowOptions(false);
                handleDelete();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}