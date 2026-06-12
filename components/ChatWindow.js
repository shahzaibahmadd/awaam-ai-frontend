// components/ChatWindow.js
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Message from './Message';
import ChatInput from './ChatInput';
import axios from 'axios'; // Using axios

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const examplePrompts = [
  'How to make a new Passport?',
  'What documents do I need for a CNIC?',
  'Summarize the new property tax law.',
];

// Accept chatId and onChatCreated as props
export default function ChatWindow({ chatId, onChatCreated }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const { token } = useAuth();
  const messagesEndRef = useRef(null);

  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Effect to fetch messages when chatId changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId || !token) {
        setMessages([]); // Clear messages if no chat selected or not logged in
        return;
      }
      setIsFetchingMessages(true);
      setMessages([]); // Clear previous messages immediately
      try {
        const res = await axios.get(`${API_BASE}/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Adapt based on your backend response structure
        // Assuming res.data.messages is the array
        const fetchedMessages = res.data.messages.map(msg => ({
          sender: msg.role === 'user' ? 'user' : 'ai',
          text: msg.content
        }));
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([{ sender: 'ai', text: 'Could not load messages for this chat.' }]);
      } finally {
        setIsFetchingMessages(false);
      }
    };

    fetchMessages();
  }, [chatId, token]); // Re-run when chatId or token changes

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    // Ensure input has text, not loading, and user is logged in
    if (!input.trim() || isLoading || !token) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let newChatId = chatId;

      const url = !chatId
        ? `${API_BASE}/chats/new`
        : `${API_BASE}/chats/${chatId}/message`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: input, sessionId: chatId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let aiMessageAdded = false;
      let buffer = "";

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

                // Initial newly created chat ID payload
                if (parsed.chat && !chatId) {
                  newChatId = parsed.chat._id;
                  if (onChatCreated) onChatCreated(newChatId);
                }

                // Chunk payload
                if (parsed.chunk) {
                  if (!aiMessageAdded) {
                    setMessages((prev) => [...prev, { sender: 'ai', text: parsed.chunk }]);
                    aiMessageAdded = true;
                  } else {
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastIdx = newMessages.length - 1;
                      if (newMessages[lastIdx].sender === 'ai') {
                        newMessages[lastIdx] = {
                          ...newMessages[lastIdx],
                          text: newMessages[lastIdx].text + parsed.chunk
                        };
                      }
                      return newMessages;
                    });
                  }
                }

                if (parsed.done) {
                  // Fallback in case chunk stream failed but we got standard reply text
                  if (!aiMessageAdded && parsed.reply) {
                    setMessages((prev) => [...prev, { sender: 'ai', text: parsed.reply }]);
                    aiMessageAdded = true;
                  }
                }

                if (parsed.error) {
                  throw new Error(parsed.message || "Error from server");
                }

              } catch (e) {
                console.warn("Error parsing stream chunk JSON:", e.message);
              }
            }
          }
        }
      }

    } catch (error) {
      console.error("Send message failed:", error);
      const errorMsg = 'Sorry, could not send message.';
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: errorMsg },
      ]);
      // If creating a new chat failed, remove the user's optimistic message
      if (!chatId) {
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  };


  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     if (!input.trim() || isLoading || !token) return;

  //     const userMessage = { sender: 'user', text: input };
  //     setMessages((prev) => [...prev, userMessage]);
  //     setInput('');
  //     setIsLoading(true);

  //     try {
  //       let replyText;
  //       let newChatId = chatId; // Assume existing chat unless created

  //       if (!chatId) {
  //         // --- Create NEW chat ---
  //         const res = await axios.post(
  //           `${API_BASE}/chats/new`,
  //           { message: input },
  //           { headers: { Authorization: `Bearer ${token}` } }
  //         );
  //         // Assuming backend returns { chat: { _id: '...' }, reply: '...' }
  //         replyText = res.data.reply;
  //         newChatId = res.data.chat._id; // Get the ID of the newly created chat
  //         // Call the callback to update the parent's state
  //         if (onChatCreated) {
  //           onChatCreated(newChatId);
  //         }

  //       } else {
  //         // --- Add message to EXISTING chat ---
  //         const res = await axios.post(
  //           `${API_BASE}/chats/${chatId}/message`,
  //           { message: input, sessionId: chatId }, // Send sessionId if needed by backend
  //           { headers: { Authorization: `Bearer ${token}` } }
  //         );
  //         // Assuming backend returns { reply: '...' }
  //         replyText = res.data.reply;
  //       }

  //       setMessages((prev) => [
  //         ...prev,
  //         { sender: 'ai', text: replyText },
  //       ]);

  //     } catch (error) {
  //       console.error("Send message failed:", error);
  //       const errorMsg = error.response?.data?.message || 'Sorry, could not send message.';
  //       setMessages((prev) => [
  //         ...prev,
  //         { sender: 'ai', text: errorMsg },
  //       ]);
  //       // Optional: If creating a new chat failed, remove the user's message
  //       if (!chatId) {
  //          setMessages((prev) => prev.slice(0, -1)); // Remove the optimistic user message
  //       }
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };


  const handleExampleClick = (prompt) => {
    setInput(prompt);
  };

  // Decide whether to show welcome screen or chat messages
  const showWelcome = !chatId && messages.length === 0 && !isFetchingMessages;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="container mx-auto max-w-3xl">
          {isFetchingMessages ? (
            <div className="text-center text-gray-400 mt-20">Loading messages...</div>
          ) : showWelcome ? (
            <div className="text-center mt-20">
              <h1 className="text-4xl font-bold text-white mb-4">Awaam AI</h1>
              <p className="text-lg text-gray-400 mb-12">
                Your AI assistant for Pakistani public documents.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleExampleClick(prompt)}
                    className="bg-gray-800 border border-gray-700 p-4 rounded-lg text-left hover:bg-gray-700 transition-colors"
                  >
                    <p className="font-semibold text-white">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : messages.length === 0 && !isLoading ? (
            <div className="text-center text-gray-400 mt-20">Send a message to start the chat.</div>
          ) : (
            messages.map((msg, index) => (
              <Message key={index} sender={msg.sender} text={msg.text} />
            ))
          )}

          {isLoading && <Message sender="ai" text="…" />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}