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

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
                        ? { ...msg, content: parsed.reply, isTyping: false }
                        : msg
                    ));
                  } else {
                    setMessages((prev) => prev.map(msg =>
                      msg.id === aiMessageId
                        ? { ...msg, isTyping: false }
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
                        ? { ...msg, content: parsed.reply, isTyping: false }
                        : msg
                    ));
                  } else {
                    setMessages((prev) => prev.map(msg =>
                      msg.id === aiMessageId
                        ? { ...msg, isTyping: false }
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
    <Layout>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-900 text-gray-100">
        <ChatSidebar
          chats={chats}
          selectedChatId={selectedChat?._id}
          onSelectChat={openChat}
          onNewChat={startNewChat}
          showArchived={showArchived}
          setShowArchived={setShowArchived}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
          onArchiveChat={archiveChat}
        />

        <main className="flex-1 flex flex-col min-w-0 bg-gray-900">
          <ChatSubnav onSelect={(dept) => setInput(`${dept}: `)} />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-3xl mx-auto space-y-6">
              {(!selectedChat || !selectedChat._id || messages.length === 0) ? (
                <div className="mt-20 space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-2">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-gemini-green to-emerald-400">
                      Hello, {userData?.name ? userData.name.split(' ')[0] : 'User'}
                    </h1>
                    <p className="text-2xl text-gray-400">How can I help you today?</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Suggestion Cards */}
                    {['How do I renew my license?', 'Check vehicle registration', 'Property tax calculator', 'Apply for domicile'].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(suggestion)}
                        className="text-left p-4 rounded-xl bg-gemini-surface hover:bg-gemini-hover transition-colors border border-transparent hover:border-gray-700 text-gray-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={msg.id || i} className={`group flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-gemini-green flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                      </div>
                    )}
                    <div className="flex flex-col max-w-[80%]">
                      <div className={`rounded-2xl px-5 py-3.5 leading-relaxed shadow-md ${msg.role === 'user'
                        ? 'bg-teal-700/80 text-white rounded-tr-sm backdrop-blur-sm' // Bluish Green for User
                        : 'bg-cyan-800/60 text-gray-100 backdrop-blur-sm' // Greenish Blue for AI
                        }`}>
                        <div className="whitespace-pre-wrap">
                          {msg.content}
                          {msg.role === 'ai' && msg.isTyping && (
                            <span className="animate-pulse text-emerald-400 ml-1">|</span>
                          )}
                        </div>
                      </div>
                      {msg.role === 'ai' && msg.responseTime && (
                        <span className="text-xs text-gray-500 mt-1 ml-2">{msg.responseTime}s</span>
                      )}
                    </div>
                  </div>
                ))
              )}
              {loading && <div className="ml-12 text-gray-400 animate-pulse">Thinking...</div>}
            </div>
          </div>

          <div className="p-4 bg-gray-900 sticky bottom-0">
            <div className={`max-w-3xl mx-auto bg-gemini-surface rounded-3xl flex items-center gap-2 px-4 py-2 ring-1 ring-gray-700/50 focus-within:ring-gemini-green/50 transition-shadow ${loading ? 'opacity-50' : ''}`}>
              <button className="p-2 rounded-full hover:bg-gemini-hover text-gray-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
                placeholder="Enter a prompt here"
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none text-gray-100 placeholder-gray-500 h-12"
              />

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
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-white shadow-lg ${ttsEnabled
                  ? 'bg-teal-700 shadow-teal-900/20'
                  : 'bg-teal-600 hover:bg-teal-500 shadow-teal-900/20'
                  }`}
                title="Hold to Listen"
              >
                {ttsEnabled ? (
                  <>
                    <span>Listening...</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 animate-pulse">
                      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 2.485.735 4.817 2.018 6.772.33 1.134 1.455 1.728 2.555 1.728h1.275l5.242 5.242c.875.875 2.385.253 2.385-1.002V13.5h.525c.82 0 1.625.32 2.228.895.534.51.817 1.25.817 2.095v.015c0 .845-.283 1.585-.817 2.095-.603.575-1.408.895-2.228.895H13.25c-1.243 0-2.25 1.007-2.25 2.25s1.007 2.25 2.25 2.25h1.59c1.64 0 3.25-.64 4.455-1.79 1.25-1.19 1.955-2.915 1.955-4.805v-.015c0-1.89-.705-3.615-1.955-4.805A6.02 6.02 0 0015.375 14h-.5V4.06zM13.5 4.06v9.44m0-9.44c1.243 0 2.25 1.007 2.25 2.25v2.25" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Hold to Listen</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.74 3.63 8.25 4.51 8.25H6.75z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </>
                )}
              </button>

              <VoiceRecorder onTranscribed={(text) => setInput(prev => prev + " " + text)} />
              {input.trim() && (
                <button onClick={sendMessage} className="p-2 rounded-full bg-gemini-green text-black hover:bg-gemini-green-dark transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              )}
            </div>
            {/* Disclaimer Removed */}
          </div>
        </main>
      </div>
    </Layout>
  );
}
