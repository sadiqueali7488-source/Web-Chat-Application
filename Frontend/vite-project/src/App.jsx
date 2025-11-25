import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [channel, setChannel] = useState("general");
  const [user, setUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [joined, setJoined] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user") || "";
    const savedMessages =
      JSON.parse(localStorage.getItem("messages_general")) || [];

    setUser(savedUser);
    setMessages(savedMessages);

    if (savedUser) {
      setJoined(true);
      socket.emit("joinChannel", "general");
    }
  }, []); // 👈 Run only once

  useEffect(() => {
    if (user) localStorage.setItem("user", user);
    localStorage.setItem("messages_general", JSON.stringify(messages));
  }, [user, messages]);

  
  useEffect(() => {
    const handleNewMsg = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleUserJoined = (msg) => {
      setMessages((prev) => [...prev, { user: "System", message: msg }]);
    };

    socket.on("newMessage", handleNewMsg);
    socket.on("userJoined", handleUserJoined);

    return () => {
      socket.off("newMessage", handleNewMsg);
      socket.off("userJoined", handleUserJoined);
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Join chat
  const joinChannel = () => {
    if (user.trim()) {
      setJoined(true);
      socket.emit("joinChannel", "general");
    }
  };

  // Send message
  const sendMessage = () => {
    if (!input.trim()) return;

    const msg = {
      channel: "general",
      user,
      message: input,
      time: new Date().toISOString(),
    };

    socket.emit("sendMessage", msg);
    setInput("");
  };

  // UI
  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "#E0E0E0",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
      }}
    >
      <div
        style={{
          width: 480,
          backgroundColor: "#1E1E1E",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!joined ? (
          <div style={{ padding: 30, textAlign: "center" }}>
            <h2 style={{ marginBottom: 20 }}>Join Chat</h2>

            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Enter your name"
              style={{
                width: "80%",
                padding: 12,
                backgroundColor: "#2C2C2C",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                marginBottom: 20,
              }}
            />

            <button
              onClick={joinChannel}
              disabled={!user.trim()}
              style={{
                padding: "12px 24px",
                backgroundColor: "#4CAF50",
                border: "none",
                color: "#fff",
                fontWeight: "600",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Join #{channel}
            </button>
          </div>
        ) : (
          <>
            <header
              style={{
                padding: "16px",
                backgroundColor: "#292929",
                borderBottom: "1px solid #333",
                fontWeight: 600,
              }}
            >
              Channel: #{channel}
            </header>

            {/* Chat Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 20,
                gap: 12,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#121212",
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.user === user ? "flex-end" : "flex-start",
                    backgroundColor:
                      msg.user === "System"
                        ? "#444"
                        : msg.user === user
                        ? "#4CAF50"
                        : "#2E2E2E",
                    padding: "10px 16px",
                    borderRadius: 16,
                    maxWidth: "75%",
                    color: "#fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                  }}
                >
                  {msg.user !== "System" && (
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.7,
                        marginBottom: 4,
                      }}
                    >
                      {msg.user}
                    </div>
                  )}

                  <div>{msg.message}</div>

                  {msg.time && (
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 10,
                        textAlign: "right",
                        opacity: 0.6,
                      }}
                    >
                      {new Date(msg.time).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <footer
              style={{
                display: "flex",
                padding: 16,
                backgroundColor: "#292929",
                borderTop: "1px solid #333",
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 24,
                  border: "none",
                  backgroundColor: "#212121",
                  color: "#fff",
                  marginRight: 10,
                }}
              />

              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#4CAF50",
                  border: "none",
                  color: "#fff",
                  borderRadius: 24,
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
