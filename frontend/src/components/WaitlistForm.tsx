import { useState } from "react";
import type { FormEvent } from "react";
import { joinWaitlist } from "../lib/api";

type Status = "idle" | "loading" | "success" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const result = await joinWaitlist(trimmed);
      setStatus("success");
      setMessage(result.message);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <form className="waitlist-form" onSubmit={handleSubmit} noValidate>
      <label className="waitlist-form__label" htmlFor="waitlist-email">
        Email address
      </label>
      <div className="waitlist-form__row">
        <input
          id="waitlist-email"
          className="waitlist-form__input"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") {
              setStatus("idle");
              setMessage("");
            }
          }}
          disabled={isLoading || isSuccess}
          required
          aria-invalid={status === "error"}
          aria-describedby="waitlist-feedback"
        />
        <button
          className="waitlist-form__button"
          type="submit"
          disabled={isLoading || isSuccess}
        >
          {isLoading ? "Joining…" : isSuccess ? "Joined" : "Join the waitlist"}
        </button>
      </div>

      <div
        id="waitlist-feedback"
        className={`waitlist-form__feedback waitlist-form__feedback--${status}`}
        role={status === "error" ? "alert" : "status"}
        aria-live="polite"
      >
        {message || (status === "idle" ? "We'll only email you when the course opens." : "\u00A0")}
      </div>
    </form>
  );
}
