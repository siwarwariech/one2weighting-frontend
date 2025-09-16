import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/api"; // 🔥 utilise ton backend

// petite fonction pour ID unique de conversation
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [conversationId] = useState<string>(generateId());
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role: "user" | "bot", content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    addMessage("user", userMessage);
    setInput("");

    try {
      // 🔥 Appel ton backend
      const res = await sendChatMessage(userMessage, conversationId);
      addMessage("bot", res.reply);
    } catch (err) {
      addMessage("bot", "⚠️ Backend Error: " + (err as Error).message);
    }
  };

  return (
    <div>
      {/* bouton flottant */}
      <button className="chat-btn" onClick={() => setOpen(!open)}>
        💬
      </button>

      {open && (
        <div className="chat-popup">
          <div className="chat-header">
            <h4>Assistant</h4>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                {m.role === "bot" ? "🤖 " : ""}{m.content}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={input}
              placeholder="Ask me something..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}

      {/* styles */}
      <style>{`
        .chat-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #07793a;
          color: white;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .chat-popup {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 350px;
          height: 450px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          background: #07793a;
          color: white;
          padding: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-body {
          flex: 1;
          padding: 10px;
          overflow-y: auto;
          background: #f9fafb;
        }

        .msg {
          padding: 8px 12px;
          margin-bottom: 10px;
          border-radius: 10px;
          max-width: 80%;
          line-height: 1.4;
        }

        .msg.user {
          background: #ebf8ff;
          color: #07793a;
          align-self: flex-end;
        }

        .msg.bot {
          background: #e6fffa;
          color: #234e52;
          align-self: flex-start;
        }

        .chat-input {
          display: flex;
          border-top: 1px solid #ddd;
        }

        .chat-input input {
          flex: 1;
          border: none;
          padding: 10px;
          outline: none;
        }

        .chat-input button {
          background: #07793a;
          color: white;
          border: none;
          padding: 10px 15px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
