import type { Context, MiddlewareHandler } from "hono";

export interface CorsOptions {
  origin: string | ((c: Context) => string);
  methods?: string[];
  headers?: string[];
  maxAge?: number;
}

export function cors(options: CorsOptions): MiddlewareHandler {
  const resolveOrigin = (c: Context) =>
    typeof options.origin === "function" ? options.origin(c) : options.origin;
  const allowMethods = (options.methods ?? ["GET", "POST", "OPTIONS"]).join(", ");
  const allowHeaders = (options.headers ?? ["Content-Type", "Authorization"]).join(", ");
  const maxAge = String(options.maxAge ?? 86400);

  return async (c: Context, next) => {
    c.header("Access-Control-Allow-Origin", resolveOrigin(c));
    c.header("Vary", "Origin");
    c.header("Access-Control-Allow-Methods", allowMethods);
    c.header("Access-Control-Allow-Headers", allowHeaders);
    c.header("Access-Control-Max-Age", maxAge);

    if (c.req.method === "OPTIONS") {
      return c.body(null, 204);
    }

    await next();
  };
}
