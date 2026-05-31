export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

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
