import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export default function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("chatMessages")) || [];
    setMessages(saved);
  }, []);

  // Listen to messages from server
  useEffect(() => {
    socket.on("message", (msg) => {
      const updated = [...messages, msg];

      setMessages(updated);
      localStorage.setItem("chatMessages", JSON.stringify(updated));
    });

    return () => socket.off("message");
  }, [messages]);

  // Send message to backend
  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("chatmessage", message);
    setMessage("");
  };

  return (
    <div style={styles.container}>
      <h2>Chat App</h2>

      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <p key={i} style={styles.msg}>
            {m}
          </p>
        ))}
      </div>

      <div style={styles.row}>
        <input
          style={styles.input}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
        />
        <button style={styles.btn} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { width: "400px", margin: "40px auto", fontFamily: "Arial" },
  chatBox: {
    border: "1px solid #ccc",
    height: "300px",
    overflowY: "auto",
    padding: "10px",
    background: "#fafafa",
  },
  msg: {
    background: "#fff",
    padding: "8px",
    margin: "5px 0",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  row: { display: "flex", marginTop: "10px", gap: "10px" },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #aaa",
    borderRadius: "4px",
  },
  btn: {
    padding: "10px 15px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
