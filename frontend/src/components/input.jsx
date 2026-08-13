import { useState, useRef } from "react";

function Input({ onSend, disabled }) {
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const text = message.trim();

    if (!text || disabled) {
      return;
    }

    onSend(text);
    setMessage("");
  };

  const startVoiceInput = () => {
    if (disabled) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript;
      }

      setMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
  };

  return (
    <form className="chat-input-area" onSubmit={handleSubmit}>
      <div className="chat-input-wrapper">

        {/* Microphone */}
        <button
          type="button"
          className={`mic-button ${
            listening ? "listening" : ""
          }`}
          onClick={startVoiceInput}
          disabled={disabled}
          title="Speak your question"
        >
          {listening ? "🔴" : "🎤"}
        </button>

        {/* Search / Chat input */}
        <input
          type="text"
          className="chat-search-input"
          placeholder={
            listening
              ? "Listening..."
              : "Type your question here..."
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
        />

        {/* Send */}
        <button
          type="submit"
          className="send-button"
          disabled={disabled || !message.trim()}
        >
          {disabled ? "..." : "➤"}
        </button>

      </div>
    </form>
  );
}

export default Input;