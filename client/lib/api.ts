export async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("ph_token") : null;

  const headers = new Headers(init?.headers as HeadersInit || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // If body is a plain object, stringify it and set JSON header
  let body = init?.body;
  if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof URLSearchParams) && !(body instanceof Blob)) {
    try {
      body = JSON.stringify(body);
      headers.set("Content-Type", "application/json");
    } catch (e) {
      // fall back to original body if stringify fails
    }
  }

  const res = await fetch(input, { ...init, headers, body } as RequestInit);

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  let data: any;
  if (contentType.includes("application/json")) data = await res.json();
  else data = await res.text();

  if (!res.ok) {
    const errMsg = (data && (data.error || data.message)) || res.statusText || "Request failed";
    const err: any = new Error(errMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
