import React from "react";
import "./App.css";
import FileUpload from "./components/FileUpload";
import ChatBox from "./components/ChatBox";

function App() {
  return (
    <div className="app">
      <h1 className="app-title">
        ⚖️ Legal AI Assistant
      </h1>

      <div className="main-layout">
        <FileUpload />
        <ChatBox />
      </div>
    </div>
  );
}

export default App;