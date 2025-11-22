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
    socket.on("newMessage", (msg) => {
      setMessages((msgs) => [...msgs, msg]);
    });

    socket.on("userJoined", (msg) => {
      setMessages((msgs) => [...msgs, { user: "System", message: msg }]);
    });

    return () => {
      socket.off("newMessage");
      socket.off("userJoined");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinChannel = () => {
    if (user.trim()) {
      socket.emit("joinChannel", channel);
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("sendMessage", { channel, message: input, user });
      setInput("");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "#E0E0E0",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          backgroundColor: "#1E1E1E",
          borderRadius: 12,
          width: 480,
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {!joined ? (
          <div style={{ padding: 30, textAlign: "center" }}>
            <h2 style={{ marginBottom: 20, fontWeight: "600" }}>Join Chat</h2>
            <input
              placeholder="Enter your name"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              style={{
                width: "80%",
                padding: "12px 16px",
                borderRadius: 8,
                border: "none",
                outline: "none",
                fontSize: 16,
                boxShadow: "inset 0 0 6px rgba(255,255,255,0.1)",
                marginBottom: 20,
                backgroundColor: "#2C2C2C",
                color: "#E0E0E0",
              }}
              autoFocus
            />
            <button
              onClick={joinChannel}
              style={{
                padding: "12px 24px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "#4CAF50",
                color: "#fff",
                fontWeight: "600",
                fontSize: 16,
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#45a049")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#4CAF50")
              }
              disabled={!user.trim()}
            >
              Join #{channel}
            </button>
          </div>
        ) : (
          <>
            <header
              style={{
                padding: "20px",
                backgroundColor: "#292929",
                borderBottom: "1px solid #333",
                fontWeight: "600",
                fontSize: 20,
                color: "#FFF",
              }}
            >
              Channel: #{channel}
            </header>
            <div
              style={{
                flexGrow: 1,
                overflowY: "auto",
                padding: "20px 24px",
                backgroundColor: "#121212",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.user === user ? "flex-end" : "flex-start",
                    backgroundColor:
                      msg.user === "System"
                        ? "#3B3B3B"
                        : msg.user === user
                        ? "#4CAF50"
                        : "#2E2E2E",
                    color: msg.user === user ? "#fff" : "#ccc",
                    padding: "10px 16px",
                    borderRadius: "16px",
                    maxWidth: "75%",
                    wordBreak: "break-word",
                    fontSize: 14,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
                  }}
                >
                  {msg.user !== "System" && (
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        marginBottom: 4,
                        opacity: 0.75,
                      }}
                    >
                      {msg.user}
                    </div>
                  )}
                  <div>{msg.message}</div>
                  {msg.time && (
                    <div
                      style={{
                        fontSize: 10,
                        textAlign: "right",
                        opacity: 0.5,
                        marginTop: 6,
                      }}
                    >
                      {new Date(msg.time).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <footer
              style={{
                display: "flex",
                padding: 16,
                backgroundColor: "#292929",
                borderTop: "1px solid #333",
              }}
            >
              <input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                style={{
                  flexGrow: 1,
                  padding: "12px 16px",
                  borderRadius: 24,
                  border: "none",
                  outline: "none",
                  fontSize: 16,
                  backgroundColor: "#212121",
                  color: "#E0E0E0",
                  marginRight: 12,
                  boxShadow: "inset 0 0 6px rgba(255,255,255,0.1)",
                }}
                autoFocus
              />
              <button
                onClick={sendMessage}
                style={{
                  padding: "12px 24px",
                  borderRadius: 24,
                  border: "none",
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#45a049")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#4CAF50")
                }
                disabled={!input.trim()}
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
