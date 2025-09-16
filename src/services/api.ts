// src/services/api.ts
import axios from "axios";
import qs from "qs";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
  paramsSerializer: params =>
    qs.stringify(params, { indices: false }) // turns {a:[1,2]} -> a=1&a=2

});


export const updateProjectStatus = async (projectId: number, status: string) => {
  const response = await api.put(`/api/projects/${projectId}/status`, {
    status: status
  });
  return response.data;
};








// Optional helper (if some places call it)
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("token");
  }
};

// Read token from either storage key
function getToken(): string | null {
  const t = localStorage.getItem("token");
  if (t) return t;
  const a = localStorage.getItem("auth");
  if (a) {
    try { return JSON.parse(a).access_token ?? null; } catch {}
  }
  return null;
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    // ensure headers object exists before assignment
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dev-only CORS smoke test
if (import.meta.env.DEV) {
  api.get("/test-cors")
    .then((r) => console.log("CORS test:", r.data))
    .catch((e) => console.error("CORS test error:", e));
}

export const sendChatMessage = async (message: string, conversationId: string) => {
  const response = await api.post("/chat", {
    message,
    conversation_id: conversationId,
  });
  return response.data;
};


export default api;
