import ReactMarkdown from "react-markdown";

function Message({ role, content }) {
  return (
    <div className={`message-row ${role}`}>
      <div className="message">
        <div className="message-role">
          {role === "user" ? "You" : "AI"}
        </div>

        <div className="message-content">
          {role === "assistant" ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;