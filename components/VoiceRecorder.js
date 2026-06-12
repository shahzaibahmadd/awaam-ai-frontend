"use client";
import { useState, useRef, useEffect } from "react";

export default function VoiceRecorder({ onTranscribed, lang, holdToSpeak = true }) {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);
  const pointerDownRef = useRef(false);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch (e) { }
      recognitionRef.current = null;
    };
  }, []);

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn't support the Web Speech API. Please use Chrome or Edge.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = lang || navigator.language || "en-US";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (event) => {
      const text = event.results[0][0].transcript;
      onTranscribed?.(text);
      setRecording(false);
    };

    rec.onerror = (e) => {
      console.error("Speech error:", e);
      setRecording(false);
    };

    rec.onend = () => {
      setRecording(false);
      recognitionRef.current = null;
    };

    try {
      rec.start();
      recognitionRef.current = rec;
      setRecording(true);
    } catch (e) {
      console.error("Failed to start recognition:", e);
    }
  };

  const stopRecognition = () => {
    try {
      recognitionRef.current?.stop();
    } catch (e) { }
    recognitionRef.current = null;
    setRecording(false);
  };

  // Handlers for press-and-hold
  const handlePointerDown = (e) => {
    e.preventDefault();
    pointerDownRef.current = true;
    startRecognition();
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    if (!pointerDownRef.current) return;
    pointerDownRef.current = false;
    stopRecognition();
  };

  const handleKeyDown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!recording) startRecognition();
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (recording) stopRecognition();
    }
  };

  return (
    <button
      onPointerDown={holdToSpeak ? handlePointerDown : undefined}
      onPointerUp={holdToSpeak ? handlePointerUp : undefined}
      onPointerCancel={holdToSpeak ? handlePointerUp : undefined}
      onPointerLeave={holdToSpeak ? handlePointerUp : undefined}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${recording ? "bg-red-500" : "bg-emerald-600"} text-white shadow-lg shadow-emerald-900/20`}
      aria-pressed={recording}
      title={recording ? "Release to send" : "Hold to speak"}
    >
      <span>{recording ? "Release to Send" : "Hold to Speak"}</span>
      {recording ? (
        <span className="animate-pulse">🎙️</span>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
          <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
        </svg>
      )}
    </button>
  );
}
