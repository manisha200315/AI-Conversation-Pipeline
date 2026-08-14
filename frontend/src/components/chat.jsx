import {
  useState,
  useRef,
  useEffect,
} from "react";

import Message from "./Message";
import Input from "./Input";

function Chat() {
  // ==========================================
  // CHAT STATE
  // ==========================================

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  // ==========================================
  // CONVERSATION HISTORY
  // ==========================================

  const [conversations, setConversations] =
    useState(() => {
      try {
        const saved = localStorage.getItem(
          "ai-conversations"
        );

        return saved
          ? JSON.parse(saved)
          : [];
      } catch {
        return [];
      }
    });

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState(null);

  // ==========================================
  // SPEECH
  // ==========================================

  const speechQueue = useRef([]);

  const speechBuffer = useRef("");

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [isPaused, setIsPaused] =
    useState(false);

  // ==========================================
  // SAVE HISTORY
  // ==========================================

  useEffect(() => {
    localStorage.setItem(
      "ai-conversations",
      JSON.stringify(conversations)
    );
  }, [conversations]);

  const cleanTextForSpeech = (text) => {
    return text
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/```[\s\S]*?```/g, "")
      .replace(
        /\[([^\]]+)\]\([^)]+\)/g,
        "$1"
      )
      .replace(
        /^\s*[-*+]\s+/gm,
        ""
      )
      .replace(
        /^\s*\d+\.\s+/gm,
        ""
      )
      .replace(
        /^\s*>\s+/gm,
        ""
      )
      .replace(
        /^\s*[-*_]{3,}\s*$/gm,
        ""
      )
      .replace(/[#*_~`]/g, "")
      .replace(/\s+/g, " ")

      .trim();
  };
  const processSpeechQueue = () => {
    if (
      window.speechSynthesis.speaking
    ) {
      return;
    }

    if (
      speechQueue.current.length === 0
    ) {
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }

    const sentence =
      speechQueue.current.shift();

    const cleanSentence =
      cleanTextForSpeech(sentence);

    if (!cleanSentence) {
      processSpeechQueue();
      return;
    }

    const utterance =
      new SpeechSynthesisUtterance(
        cleanSentence
      );
    utterance.rate = 1;

    utterance.pitch = 1;

    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      processSpeechQueue();
    };

    utterance.onerror = () => {
      processSpeechQueue();
    };

    window.speechSynthesis.speak(
      utterance
    );
  };
  const speakSentence = (sentence) => {
    const cleanSentence =
      cleanTextForSpeech(sentence);

    if (!cleanSentence) {
      return;
    }

    speechQueue.current.push(
      cleanSentence
    );

    setIsSpeaking(true);

    processSpeechQueue();
  };
  const processSpeechBuffer = (text) => {
    speechBuffer.current += text;

    const sentenceRegex =
      /(.+?[.!?])(\s+|$)/g;

    let match;

    let lastIndex = 0;

    while (
      (match =
        sentenceRegex.exec(
          speechBuffer.current
        )) !== null
    ) {
      const sentence =
        match[1].trim();

      if (sentence) {
        speakSentence(sentence);
      }

      lastIndex =
        sentenceRegex.lastIndex;
    }

    if (lastIndex > 0) {
      speechBuffer.current =
        speechBuffer.current.slice(
          lastIndex
        );
    }
  };

  const finishSpeech = () => {
    if (
      speechBuffer.current.trim()
    ) {
      speakSentence(
        speechBuffer.current
      );

      speechBuffer.current = "";
    }

    processSpeechQueue();
  };

  const pauseSpeaking = () => {
    if (
      window.speechSynthesis.speaking
    ) {
      window.speechSynthesis.pause();

      setIsPaused(true);
    }
  };
  const resumeSpeaking = () => {
    if (
      window.speechSynthesis.paused
    ) {
      window.speechSynthesis.resume();

      setIsPaused(false);
    }
  };
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();

    speechQueue.current = [];

    speechBuffer.current = "";

    setIsSpeaking(false);

    setIsPaused(false);
  };
  const createConversation = (
    firstMessage
  ) => {
    const id = Date.now();

    const title =
      firstMessage.length > 40
        ? firstMessage.substring(
            0,
            40
          ) + "..."
        : firstMessage;

    const conversation = {
      id,
      title,
      messages: [],
    };

    setConversations(
      (previous) => [
        conversation,
        ...previous,
      ]
    );

    setActiveConversationId(id);

    return id;
  };
  const updateConversationHistory = (
    conversationId,
    newMessages
  ) => {
    setConversations(
      (previous) =>
        previous.map(
          (conversation) => {
            if (
              conversation.id !==
              conversationId
            ) {
              return conversation;
            }

            return {
              ...conversation,
              messages:
                newMessages,
            };
          }
        )
    );
  };
  const newChat = () => {
    stopSpeaking();

    setMessages([]);

    setLoading(false);

    setActiveConversationId(null);
  };
  const openConversation = (
    conversation
  ) => {
    stopSpeaking();

    setActiveConversationId(
      conversation.id
    );

    setMessages(
      conversation.messages || []
    );

    setLoading(false);
  };
  const sendMessage = async (
    userMessage
  ) => {
    if (!userMessage.trim()) {
      return;
    }

    setLoading(true);
    stopSpeaking();
    let conversationId =
      activeConversationId;

    if (!conversationId) {
      conversationId =
        createConversation(
          userMessage
        );
    }

    const userMessageObject = {
      role: "user",
      content: userMessage,
    };

    const assistantMessageObject = {
      role: "assistant",
      content: "",
    };

    const newMessages = [
      ...messages,
      userMessageObject,
      assistantMessageObject,
    ];

    setMessages(newMessages);

    updateConversationHistory(
      conversationId,
      newMessages
    );

    try {
      const response = await fetch(
        "http://localhost:5000/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to connect to backend"
        );
      }

      if (!response.body) {
        throw new Error(
          "Streaming is not supported"
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let buffer = "";
      while (true) {
        const {
          value,
          done,
        } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(
          value,
          {
            stream: true,
          }
        );

        const events =
          buffer.split("\n\n");

        buffer =
          events.pop() || "";

        for (
          const event of events
        ) {
          if (
            !event.startsWith(
              "data: "
            )
          ) {
            continue;
          }

          const jsonString =
            event.substring(6);

          try {
            const data =
              JSON.parse(
                jsonString
              );

            // AI finished
            if (data.done) {
              finishSpeech();
              continue;
            }

            // backend error
            if (data.error) {
              throw new Error(
                data.error
              );
            }
            if (data.text) {
              setMessages(
                (previous) => {
                  const updated = [
                    ...previous,
                  ];

                  const lastIndex =
                    updated.length -
                    1;

                  updated[
                    lastIndex
                  ] = {
                    ...updated[
                      lastIndex
                    ],

                    content:
                      updated[
                        lastIndex
                      ].content +
                      data.text,
                  };
                  updateConversationHistory(
                    conversationId,
                    updated
                  );

                  return updated;
                }
              );
              processSpeechBuffer(
                data.text
              );
            }
          } catch (error) {
            console.error(
              "Stream error:",
              error
            );
          }
        }
      }

      finishSpeech();
    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      const errorMessage =
        "Sorry, something went wrong while connecting to the AI.";

      setMessages(
        (previous) => {
          const updated = [
            ...previous,
          ];

          const lastIndex =
            updated.length - 1;

          if (lastIndex >= 0) {
            updated[
              lastIndex
            ] = {
              ...updated[
                lastIndex
              ],
              content:
                errorMessage,
            };
          }

          updateConversationHistory(
            conversationId,
            updated
          );

          return updated;
        }
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="chat-page">

      {

      }

      <aside className="history-sidebar">

        <div className="history-brand">

          <div className="history-logo">
            ✦
          </div>

          <div>
            <h2>
              AI Conversation
            </h2>

            <span>
              Assistant
            </span>
          </div>

        </div>

        <button
          className="new-chat-button"
          onClick={newChat}
        >
          <span>＋</span>
          New Chat
        </button>

        {/* HISTORY */}

        <div className="history-label">
          Conversation History
        </div>

        <div className="history-list">

          {conversations.length ===
          0 ? (
            <div className="no-history">
              No conversations yet
            </div>
          ) : (
            conversations.map(
              (conversation) => (
                <button
                  key={
                    conversation.id
                  }
                  className={`history-item ${
                    activeConversationId ===
                    conversation.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    openConversation(
                      conversation
                    )
                  }
                >
                  <span className="history-icon">
                    💬
                  </span>

                  <span className="history-title">
                    {
                      conversation.title
                    }
                  </span>
                </button>
              )
            )
          )}

        </div>

        <div className="history-footer">
          <strong>
            Gemini AI
          </strong>

          <span>
            Streaming + Voice
          </span>
        </div>

      </aside>

      {/* ======================================
          CHAT
      ====================================== */}

      <main className="chat-main">

        <div className="chat-container">

          {/* HEADER */}

          <header className="chat-header">

            <div>
              <h1>
                AI Conversation Pipeline
              </h1>

              <p>
                Streaming AI response with
                real-time speech
              </p>
            </div>

            <div className="connection-status">
              <span></span>
              AI Online
            </div>

          </header>

          {/* MESSAGES */}

          <div className="messages-container">

            {messages.length ===
              0 && (
              <div className="welcome-message">

                <div className="welcome-icon">
                  🤖
                </div>

                <h2>
                  Welcome!
                </h2>

                <p>
                  Ask me anything. I'll
                  generate and speak the
                  response while it is being
                  generated.
                </p>

                <div className="welcome-features">
                  <span>
                    ⚡ Streaming
                  </span>

                  <span>
                    🔊 Real-time Voice
                  </span>

                  <span>
                    🎙️ Voice Input
                  </span>
                </div>

              </div>
            )}

            {messages.map(
              (message, index) => (
                <Message
                  key={index}
                  role={
                    message.role
                  }
                  content={
                    message.content
                  }
                />
              )
            )}

            {loading && (
              <div className="streaming-indicator">

                <span className="loading-dot"></span>

                AI is generating
                response...

              </div>
            )}

          </div>

          {/* SPEECH CONTROLS */}

          <div className="speech-controls">

            <div className="speech-info">

              {isSpeaking &&
                !isPaused && (
                  <>
                    <span className="sound-icon">
                      🔊
                    </span>

                    <span>
                      Speaking
                    </span>
                  </>
                )}

              {isPaused && (
                <>
                  <span>
                    ⏸️
                  </span>

                  <span>
                    Speech paused
                  </span>
                </>
              )}

              {!isSpeaking &&
                !isPaused && (
                  <>
                    <span>
                      🔈
                    </span>

                    <span>
                      Speech ready
                    </span>
                  </>
                )}

            </div>

            <div className="speech-buttons">

              {isSpeaking &&
                !isPaused && (
                  <button
                    className="pause-button"
                    onClick={
                      pauseSpeaking
                    }
                  >
                    ⏸ Pause
                  </button>
                )}

              {isPaused && (
                <button
                  className="resume-button"
                  onClick={
                    resumeSpeaking
                  }
                >
                  ▶ Resume
                </button>
              )}

              <button
                className="stop-button"
                onClick={
                  stopSpeaking
                }
                disabled={
                  !isSpeaking &&
                  !isPaused
                }
              >
                ⏹ Stop
              </button>

              <span className="speed-badge">
                1×
              </span>

            </div>

          </div>

          {/* INPUT */}

          <Input
            onSend={sendMessage}
            disabled={loading}
          />

        </div>

      </main>

    </div>
  );
}

export default Chat;