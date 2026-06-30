import { useState } from "react";
import { LogoMark } from "./LogoMark";

const PASSKEY = "6474";

export function AuthLock({ onUnlock }) {
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (passkey === PASSKEY) {
      setError("");
      onUnlock();
      return;
    }

    setPasskey("");
    setError("Wrong passkey");
  };

  return (
    <main className="lock-screen">
      <form className="lock-card" onSubmit={handleSubmit}>
        <LogoMark className="lock-logo" />
        <div>
          <p className="eyebrow">Private Fleet App</p>
          <h1>Santosh</h1>
          <p className="muted">Enter passkey to open the mobile dashboard.</p>
        </div>

        <label className="field">
          <span>Passkey</span>
          <input
            autoFocus
            inputMode="numeric"
            maxLength={8}
            type="password"
            value={passkey}
            onChange={(event) => setPasskey(event.target.value)}
            placeholder="0000"
          />
        </label>

        <p className="form-error" aria-live="polite">
          {error}
        </p>

        <button className="primary-button" type="submit">
          Unlock App
        </button>
      </form>
    </main>
  );
}
