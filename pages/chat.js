"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../lib/api";
import { getToken } from "../lib/auth";
import Layout from "../components/Layout";
import ChatSubnav from "../components/ChatSubnav";
import ChatSidebar from "../components/ChatSidebar"; // Imported
import TypewriterText from "../components/TypewriterText";
import VoiceRecorder from "../components/VoiceRecorder";

export default function ChatPage() {
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (router.isReady && router.query.prompt) {
      setInput(router.query.prompt);
      
      const { prompt, ...queryWithoutPrompt } = router.query;
      router.replace(
        {
          pathname: router.pathname,
          query: queryWithoutPrompt,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [router.isReady, router.query.prompt]);

  useEffect(() => {
    if (!isMounted) return;
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const initChats = async () => {
      await fetchUserProfile();
      const chatsData = await fetchChats();

      if (router.isReady && router.query.id && chatsData) {
        const targetChat = chatsData.find(c => c._id === router.query.id);
        if (targetChat) {
          openChat(targetChat);
        }
      }
    };
    initChats();

  }, [isMounted, router.isReady, router.query.id]);

  const fetchUserProfile = async () => {
    try {
      const token = getToken();
      const res = await api.get('/user/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.user) {
        setUserData(res.data.user);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  const fetchChats = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return [];
      }
      const res = await api.get("/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(res.data);
      return res.data;
    } catch (err) {
      console.error("fetchChats error:", err.response?.status, err.message);
      if (err.response?.status === 401) {
        router.push("/login");
      }
      return [];
    }
  };

  const startNewChat = () => {
    setSelectedChat({ _id: null, title: "New Chat" });
    setMessages([]);
  };

  const openChat = async (chat) => {
    try {
      const token = getToken();
      const res = await api.get(`/chats/${chat._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedChat(res.data);
      setMessages(res.data.messages);
    } catch (err) {
      console.error("openChat error:", err.message);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const startTime = Date.now();

    // Add a placeholder for the AI message
    const aiMessageId = Date.now().toString();
    setMessages((prev) => [...prev, {
      role: "ai",
      content: "",
      id: aiMessageId,
      isTyping: true
    }]);
    setTypingMessageId(aiMessageId);

    try {
      const token = getToken();

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const url = (!selectedChat || !selectedChat._id)
        ? `${API_BASE}/chats/new`
        : `${API_BASE}/chats/${selectedChat._id}/message`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg.content,
          sessionId: selectedChat?._id
        })
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let buffer = "";
      let firstChunkReceived = false;
      let ttfb = null;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Keep the last partial line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (!dataStr) continue;

              try {
                const parsed = JSON.parse(dataStr);

                if (parsed.chat && (!selectedChat || !selectedChat._id)) {
                  setSelectedChat(parsed.chat);
                }

                if (parsed.chunk) {
                  if (!firstChunkReceived && parsed.chunk.trim().length > 0) {
                    ttfb = ((Date.now() - startTime) / 1000).toFixed(1);
                    firstChunkReceived = true;
                  }
                  setMessages((prev) => prev.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, content: msg.content + parsed.chunk, responseTime: ttfb || msg.responseTime }
                      : msg
                  ));
                }

                if (parsed.done) {
                  if (parsed.reply) {
                    setMessages((prev) => prev.map(msg =>
                      msg.id === aiMessageId
                        ? { ...msg, content: parsed.reply, isTyping: false, responseTime: parsed.responseTime || msg.responseTime }
                        : msg
                    ));
                  } else {
                    setMessages((prev) => prev.map(msg =>
                      msg.id === aiMessageId
                        ? { ...msg, isTyping: false, responseTime: parsed.responseTime || msg.responseTime }
                        : msg
                    ));
                  }
                  setTypingMessageId(null);
                }
              } catch (e) {
                console.warn("Parse error:", e);
              }
            }
          }
        }
      }
      fetchChats();
    } catch (err) {
      console.error("Send message failed:", err);
      // Remove placeholder on error
      setMessages((prev) => prev.filter(msg => msg.id !== aiMessageId));
    } finally {
      setLoading(false);
    }
  };

  const sendMessageWithText = async (text) => {
    if (!text || !text.trim()) return;
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const startTime = Date.now();

    // Add a placeholder for the AI message
    const aiMessageId = Date.now().toString();
    setMessages((prev) => [...prev, {
      role: "ai",
      content: "",
      id: aiMessageId,
      isTyping: true
    }]);
    setTypingMessageId(aiMessageId);

    try {
      const token = getToken();

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const url = (!selectedChat || !selectedChat._id)
        ? `${API_BASE}/chats/new`
        : `${API_BASE}/chats/${selectedChat._id}/message`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg.content,
          sessionId: selectedChat?._id
        })
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let buffer = "";
      let firstChunkReceived = false;
      let ttfb = null;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Keep the last partial line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (!dataStr) continue;

              try {
                const parsed = JSON.parse(dataStr);

                if (parsed.chat && (!selectedChat || !selectedChat._id)) {
                  setSelectedChat(parsed.chat);
                }

                if (parsed.chunk) {
                  if (!firstChunkReceived && parsed.chunk.trim().length > 0) {
                    ttfb = ((Date.now() - startTime) / 1000).toFixed(1);
                    firstChunkReceived = true;
                  }
                  setMessages((prev) => prev.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, content: msg.content + parsed.chunk, responseTime: ttfb || msg.responseTime }
                      : msg
                  ));
                }

                if (parsed.done) {
                  if (parsed.reply) {
                    setMessages((prev) => prev.map(msg =>
                      msg.id === aiMessageId
                        ? { ...msg, content: parsed.reply, isTyping: false, responseTime: parsed.responseTime || msg.responseTime }
                        : msg
                    ));
                  } else {
                    setMessages((prev) => prev.map(msg =>
                      msg.id === aiMessageId
                        ? { ...msg, isTyping: false, responseTime: parsed.responseTime || msg.responseTime }
                        : msg
                    ));
                  }
                  setTypingMessageId(null);
                }
              } catch (e) {
                console.warn("Parse error:", e);
              }
            }
          }
        }
      }
      fetchChats();
    } catch (err) {
      console.error("Send message failed:", err);
      // Remove placeholder on error
      setMessages((prev) => prev.filter(msg => msg.id !== aiMessageId));
    } finally {
      setLoading(false);
    }
  };

  function speakText(text) {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.error("TTS failed:", e);
    }
  }

  const deleteChat = async (chatId) => {
    if (!confirm("Are you sure you want to delete this chat?")) return;
    try {
      const token = getToken();
      await api.delete(`/chats/${chatId}`, { headers: { Authorization: `Bearer ${token}` } });
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (selectedChat?._id === chatId) startNewChat();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const renameChat = async (chatId, newTitle) => {
    try {
      const token = getToken();
      await api.patch(`/chats/${chatId}`, { title: newTitle }, { headers: { Authorization: `Bearer ${token}` } });
      setChats((prev) => prev.map((c) => (c._id === chatId ? { ...c, title: newTitle } : c)));
      if (selectedChat?._id === chatId) setSelectedChat((prev) => ({ ...prev, title: newTitle }));
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  const archiveChat = async (chatId, archivedStatus = true) => {
    try {
      const token = getToken();
      await api.patch(`/chats/${chatId}`, { archived: archivedStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setChats((prev) => prev.map((c) => (c._id === chatId ? { ...c, archived: archivedStatus } : c)));
      if (selectedChat?._id === chatId) {
        if (archivedStatus) startNewChat(); // if archiving active chat, close it
        else fetchChats(); // reload if restoring
      }
    } catch (err) {
      console.error("Archive failed:", err);
    }
  };

  return (
    <Layout noScroll={true}>
      <div className="relative flex w-full h-[calc(100vh-57px)] overflow-hidden bg-transparent text-gray-100">
        <ChatSidebar
          chats={chats}
          selectedChatId={selectedChat?._id}
          onSelectChat={(chat) => { openChat(chat); setIsSidebarOpen(false); }}
          onNewChat={() => { startNewChat(); setIsSidebarOpen(false); }}
          showArchived={showArchived}
          setShowArchived={setShowArchived}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
          onArchiveChat={archiveChat}
          isOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          />
        )}

        <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
          <ChatSubnav
            onSelect={(dept) => setInput(`${dept}: `)}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-32 md:pb-40">
            <div className="max-w-3xl md:max-w-4xl mx-auto space-y-8 w-full px-4 md:px-0">
              {(!selectedChat || !selectedChat._id || messages.length === 0) ? (
                <div className="mt-16 space-y-10 animate-in fade-in duration-500">
                  <div className="space-y-3">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-[#46DBA5] to-emerald-400">
                      Hello, {userData?.name ? userData.name.split(' ')[0] : 'User'}
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-400/90 font-medium">How can I help you today?</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Suggestion Cards */}
                    {['How do I renew my license?', 'Check vehicle registration', 'Property tax calculator', 'Apply for domicile'].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(suggestion)}
                        className="text-left p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-lg hover:shadow-emerald-950/20 transition-all duration-300 text-gray-200 text-sm font-medium hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between gap-4"
                      >
                        <span className="flex-grow">{suggestion}</span>
                        <span className="self-end p-2 bg-white/5 text-[#46DBA5] rounded-xl group-hover:bg-[#46DBA5] group-hover:text-teal-950 transition-all duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                          </svg>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={msg.id || i} className={`group flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-lg bg-gemini-green/10 ring-1 ring-gemini-green/30 flex items-center justify-center shrink-0 font-extrabold text-gemini-green text-xs mt-1 select-none">
                        AI
                      </div>
                    )}
                    <div className={`flex flex-col ${msg.role === 'user' ? 'max-w-[85%] sm:max-w-[70%]' : 'max-w-[90%] flex-1'}`}>
                      <div className={`leading-relaxed caret-transparent select-text cursor-default ${msg.role === 'user'
                        ? 'bg-[#0A3F38]/80 text-gray-100 rounded-3xl px-5 py-3 border border-[#46DBA5]/25 shadow-md backdrop-blur-sm'
                        : 'text-gray-100 text-[15px] sm:text-[16px] leading-7 mt-1.5'
                        }`}>
                        <div className="whitespace-pre-wrap">
                          {msg.content}
                          {msg.role === 'ai' && msg.isTyping && (
                            <span className="inline-block animate-pulse text-[#46DBA5] ml-1 font-bold">|</span>
                          )}
                        </div>
                      </div>
                      {msg.role === 'ai' && msg.responseTime && (
                        <div className="text-xs text-gray-500 mt-1 pl-1 font-mono select-none">
                          {msg.responseTime}s response time
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex gap-4 items-start ml-12 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-gemini-green/10 ring-1 ring-gemini-green/30 flex items-center justify-center shrink-0 font-extrabold text-gemini-green text-xs mt-1 select-none">
                    AI
                  </div>
                  <div className="flex-1 space-y-3 max-w-md mt-2">
                    <div className="h-2.5 bg-gradient-to-r from-[#46DBA5]/20 via-[#46DBA5]/50 to-[#46DBA5]/20 rounded-full w-3/4 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                    <div className="h-2.5 bg-gradient-to-r from-[#46DBA5]/20 via-[#46DBA5]/50 to-[#46DBA5]/20 rounded-full w-1/2 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                    <div className="h-2.5 bg-gradient-to-r from-[#46DBA5]/20 via-[#46DBA5]/50 to-[#46DBA5]/20 rounded-full w-5/6 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-t from-[#131314] via-[#131314]/95 to-transparent absolute bottom-0 left-0 right-0 z-10 pt-8 pb-6">
            <div className={`max-w-3xl md:max-w-4xl mx-auto bg-white/5 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-between w-full gap-2 px-3 sm:px-4 py-2 hover:border-white/20 focus-within:border-[#46DBA5]/30 focus-within:ring-1 focus-within:ring-[#46DBA5]/20 transition-all duration-300 ${loading ? 'opacity-50' : ''}`}>
              <button className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-300 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
                placeholder="Enter a prompt here"
                disabled={loading}
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-gray-100 placeholder-gray-500 h-12 px-2 text-sm sm:text-base"
              />

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* TTS Toggle Button - Plays last AI message */}
                <button
                  onClick={() => {
                    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
                    if (ttsEnabled) {
                      window.speechSynthesis.cancel();
                      setTtsEnabled(false);
                    } else {
                      const lastAiMsg = [...messages].reverse().find(m => m.role === 'ai');
                      if (lastAiMsg && lastAiMsg.content) {
                        setTtsEnabled(true);
                        const utter = new SpeechSynthesisUtterance(lastAiMsg.content);
                        utter.onend = () => setTtsEnabled(false);
                        window.speechSynthesis.cancel();
                        window.speechSynthesis.speak(utter);
                      }
                    }
                  }}
                  className={`flex items-center justify-center gap-1.5 px-3 h-9 text-xs rounded-full transition-all duration-300 select-none ${ttsEnabled
                    ? 'bg-gemini-green text-gemini-bg font-bold shadow-lg shadow-gemini-green/20'
                    : 'bg-gemini-green/10 hover:bg-gemini-green/20 text-gemini-green border border-gemini-green/20'
                    }`}
                  title="Hold to Listen"
                >
                  {ttsEnabled ? (
                    <>
                      <span className="hidden sm:inline">Listening...</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 animate-pulse">
                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 2.485.735 4.817 2.018 6.772.33 1.134 1.455 1.728 2.555 1.728h1.275l5.242 5.242c.875.875 2.385.253 2.385-1.002V13.5h.525c.82 0 1.625.32 2.228.895.534.51.817 1.25.817 2.095v.015c0 .845-.283 1.585-.817 2.095-.603.575-1.408.895-2.228.895H13.25c-1.243 0-2.25 1.007-2.25 2.25s1.007 2.25 2.25 2.25h1.59c1.64 0 3.25-.64 4.455-1.79 1.25-1.19 1.955-2.915 1.955-4.805v-.015c0-1.89-.705-3.615-1.955-4.805A6.02 6.02 0 0015.375 14h-.5V4.06zM13.5 4.06v9.44m0-9.44c1.243 0 2.25 1.007 2.25 2.25v2.25" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Hold to Listen</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.74 3.63 8.25 4.51 8.25H6.75z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </>
                  )}
                </button>

                <VoiceRecorder onTranscribed={(text) => setInput(prev => prev + " " + text)} />
                {input.trim() && (
                  <button onClick={sendMessage} className="h-9 w-9 flex items-center justify-center rounded-full bg-gemini-green text-gemini-bg hover:bg-gemini-green-dark transition-all duration-300 hover:scale-105 shrink-0 shadow-lg shadow-gemini-green/25">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite linear;
        }
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </Layout>
  );
}
