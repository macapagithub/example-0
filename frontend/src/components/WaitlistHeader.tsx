export function WaitlistHeader() {
  return (
    <header className="waitlist-header">
      <span className="waitlist-header__brand" aria-label="Waitly">
        <span className="waitlist-header__dot" aria-hidden="true" />
        Waitly
      </span>
      <a
        className="waitlist-header__cta"
        href="https://platzi.com/courses/cloudflare-workers/"
        target="_blank"
        rel="noreferrer noopener"
      >
        Platzi · Cloudflare Workers
      </a>
    </header>
  );
}
