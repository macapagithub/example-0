const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export interface WaitlistResponse {
  message: string;
  entry: {
    email: string;
    createdAt: string;
  };
}

export interface WaitlistError {
  error: string;
}

export async function joinWaitlist(email: string): Promise<WaitlistResponse> {
  const response = await fetch(`${API_BASE}/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = (await response.json()) as WaitlistResponse | WaitlistError;

  if (!response.ok) {
    const message = "error" in data ? data.error : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as WaitlistResponse;
}
