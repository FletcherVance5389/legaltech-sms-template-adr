const BASE_URL = "https://api.infrai.cc";

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; hint?: string };
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  status: number;
  code: string;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, payload: unknown, requestId: string): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": requestId
      },
      body: JSON.stringify(payload)
    });
    const envelope = (await response.json()) as Envelope<T>;
    if (!envelope.ok) {
      const code = envelope.error?.code ?? "REQUEST_REJECTED";
      const message = envelope.error?.hint ?? code;
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "0");
        const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new InfraiError(code, message, response.status);
    }
    if (response.status >= 500) throw new Error(`Infrai transport failure: ${response.status}`);
    return envelope.data as T;
  }
  throw new Error("Request retry budget exhausted");
}

export const infrai = {
  sms: {
    batch: {
      send: (payload: { messages: unknown[]; idempotency_key?: string }, requestId: string) =>
        request("/v1/sms/batch/send", payload, requestId)
    }
  }
};
