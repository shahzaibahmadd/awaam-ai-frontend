import { useRef, useEffect } from 'react';

export default function ChatInput({ input, setInput, onSubmit, isLoading }) {
  const textareaRef = useRef(null);

  // Auto-resize the textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  return (
    <form
      onSubmit={onSubmit}
      className="sticky bottom-0 left-0 right-0 p-4 bg-gray-900/80 backdrop-blur-md"
    >
      <div className="container mx-auto max-w-3xl flex items-center bg-gray-800 rounded-xl border border-gray-700 p-2 shadow-lg">
        <textarea
          ref={textareaRef}
          rows="1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about any Pakistani document..."
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
          className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none p-2 max-h-40 overflow-y-auto"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-green-600 text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-50 hover:bg-green-700 focus:outline-none transition-colors"
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </form>
  );
}