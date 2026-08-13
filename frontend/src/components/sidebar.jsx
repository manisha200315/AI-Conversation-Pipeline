function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          ✦
        </div>

        <div>
          <h2>AI Conversation</h2>
          <span>Assistant</span>
        </div>
      </div>

      <button
        className="new-chat-button"
        onClick={onNewChat}
      >
        <span>＋</span>
        New Chat
      </button>

      <div className="history-title">
        Conversation History
      </div>

      <div className="conversation-list">
        {conversations.length === 0 ? (
          <div className="empty-history">
            No conversations yet
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`conversation-item ${
                activeConversationId === conversation.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onSelectConversation(conversation.id)
              }
            >
              <span className="conversation-icon">
                💬
              </span>

              <span className="conversation-title">
                {conversation.title}
              </span>
            </button>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <div>Gemini AI</div>
        <span>Streaming + Voice</span>
      </div>
    </aside>
  );
}

export default Sidebar;