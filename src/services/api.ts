export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  // Only set Content-Type to JSON if body is a string (meaning we stringified it)
  if (typeof options.body === 'string') {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = "API Error";
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
    } catch (e) {
      // Ignora erro se a resposta não for JSON
    }
    throw new Error(errorMsg);
  }

  // Algumas requisições (como DELETE) podem não retornar corpo
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
