export function WaitlistHero() {
  return (
    <section className="waitlist-hero">
      <p className="waitlist-hero__eyebrow">Coming soon to Platzi</p>
      <h1 className="waitlist-hero__title">
        Master <span>Cloudflare Workers</span>, one request at a time.
      </h1>
      <p className="waitlist-hero__subtitle">
        Join the waitlist for the hands-on Platzi course that takes you from your first
        <code>fetch</code> handler to production-grade Workers — edge-native, serverless, and built
        to scale globally.
      </p>
      <ul className="waitlist-hero__bullets" aria-label="What you'll learn">
        <li>Build and deploy with <code>wrangler</code> from day one</li>
        <li>Wire Hono, D1, R2, KV, and Durable Objects into real apps</li>
        <li>Ship SSR React apps running on the Workers platform</li>
      </ul>
    </section>
  );
}
