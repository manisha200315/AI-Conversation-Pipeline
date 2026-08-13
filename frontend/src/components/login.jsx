import { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    onLogin();
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-card">
          <div className="login-icon">🤖</div>

          <h1>AI Conversation</h1>

          <p className="login-subtitle">
            Your intelligent voice conversation assistant
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email or Phone</label>

              <input
                type="text"
                placeholder="Enter your email or phone"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="login-button">
              Login
            </button>
          </form>

          <p className="login-note">
            AI Conversation Pipeline
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;