import React, { useState } from "react";
import axios from "axios";
import "./ChatBox.css";

function ChatBox() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = {
      sender: "User",
      text: question
    };

    setMessages((prev) => [
      ...prev,
      userMessage
    ]);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8080/ask",
        {
          question: question
        }
      );

      const botMessage = {
        sender: "Bot",
        text: response.data.answer
      };

      setMessages((prev) => [
        ...prev,
        botMessage
      ]);
    } catch (error) {
      console.error(error);

      const botMessage = {
        sender: "Bot",
        text: "Error fetching answer"
      };

      setMessages((prev) => [
        ...prev,
        botMessage
      ]);
    }

    setQuestion("");
  };

  return (
  <div className="card chat-container">
    <div className="chat-header">
      💬 Legal Chat Assistant
    </div>

    <div className="chat-window">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={
            msg.sender === "User"
              ? "user-msg"
              : "bot-msg"
          }
        >
          {msg.text}
        </div>
      ))}
    </div>

    <div className="chat-input">
      <input
        type="text"
        placeholder="Ask about contracts, laws, compliance..."
        value={question}
        onChange={(e) =>
          setQuestion(e.target.value)
        }
      />

      <button onClick={askQuestion}>
        Send
      </button>
    </div>
  </div>
);
}

export default ChatBox;