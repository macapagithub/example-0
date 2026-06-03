import { useEffect, useState } from "react";

export function WaitlistFooter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/health", { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { status?: string } | null) => {
        if (data?.status === "ok") setCount(1);
      })
      .catch(() => setCount(null));
    return () => ctrl.abort();
  }, []);

  return (
    <footer className="waitlist-footer">
      <span className="waitlist-footer__status">
        <span
          className={`waitlist-footer__dot ${count ? "is-ok" : "is-pending"}`}
          aria-hidden="true"
        />
        API {count ? "connected" : "checking…"}
      </span>
      <span className="waitlist-footer__meta">© {new Date().getFullYear()} Waitly</span>
    </footer>
  );
}
