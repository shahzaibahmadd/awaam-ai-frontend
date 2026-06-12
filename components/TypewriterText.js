import { useState, useEffect } from 'react';

export default function TypewriterText({ text, speed = 20, onComplete, isStreaming = false }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // If we've caught up to the current text length
    if (!text || currentIndex >= text.length) {
      // If we are no longer streaming and have shown everything, fire onComplete
      if (!isStreaming && text && currentIndex >= text.length) {
        onComplete?.();
      }
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText(prev => prev + text[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed, isStreaming, onComplete]);

  return (
    <span className="relative whitespace-pre-wrap">
      {displayedText}
      {(isStreaming || currentIndex < (text?.length || 0)) && (
        <span className="animate-pulse text-emerald-400 ml-1">|</span>
      )}
    </span>
  );
}
