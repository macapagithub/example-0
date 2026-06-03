import { Hono } from "hono";
import { cors } from "./middleware/cors";
import { waitlistStore } from "./services/waitlist";
import { isValidEmail } from "./services/validation";
import type { Env } from "./types/env";

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: (c) => c.env.CORS_ORIGIN ?? "http://localhost:5173",
  }),
);

app.get("/health", (c) =>
  c.json({ status: "ok", service: "waitly-api", timestamp: new Date().toISOString() }),
);

app.post("/waitlist", async (c) => {
  let payload: unknown;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const email = (payload as { email?: unknown } | null)?.email;

  if (!isValidEmail(email)) {
    return c.json({ error: "A valid email is required" }, 400);
  }

  const entry = await waitlistStore.addEmail(email);
  return c.json({ message: "You're on the list", entry }, 201);
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
