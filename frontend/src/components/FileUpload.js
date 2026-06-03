import React, { useState } from "react";
import axios from "axios";
import "./FileUpload.css";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      alert("Select PDF File");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8080/upload",
        formData
      );

      setMessage(response.data.message);
    } catch (error) {
      setMessage("Upload Failed");
      console.error(error);
    }
  };

 return (
  <div className="card upload-box">
    <h2>📄 Upload Legal Document</h2>

    <div className="upload-area">
      Drag & Drop PDF Here
      <br />
      or Select File
    </div>

    <input
      type="file"
      accept=".pdf"
      onChange={(e) =>
        setFile(e.target.files[0])
      }
    />

    <button
      className="upload-btn"
      onClick={handleUpload}
    >
      Upload Document
    </button>

    <p className="success-msg">
      {message}
    </p>
  </div>
);
}

export default FileUpload;