import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000 // 2 minutes for large audio / LLM pipelines
});

// Attach bearer token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("voicefir_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // System Health
  getHealth: async () => {
    const res = await apiClient.get("/health");
    return res.data;
  },

  // Auth / Officer
  getProfile: async () => {
    const res = await apiClient.get("/auth/profile");
    return res.data;
  },

  getAvailableOfficers: async () => {
    const res = await apiClient.get("/auth/officers");
    return res.data;
  },

  // Transcription
  transcribeAudio: async (formData) => {
    const res = await apiClient.post("/transcription/transcribe", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data;
  },

  // Live Multilingual Translation
  translateText: async (text, targetLang) => {
    const groqKey = localStorage.getItem("voicefir_groq_api_key");
    const res = await apiClient.post("/transcription/translate", {
      text,
      targetLang,
      groqApiKey: groqKey
    });
    return res.data;
  },

  // FIR Operations
  generateFIR: async (payload) => {
    const res = await apiClient.post("/fir/generate", payload);
    return res.data;
  },

  getAllFIRs: async () => {
    const res = await apiClient.get("/fir");
    return res.data;
  },

  getFIRById: async (id) => {
    const res = await apiClient.get(`/fir/${id}`);
    return res.data;
  },

  updateFIR: async (id, payload) => {
    const res = await apiClient.put(`/fir/${id}`, payload);
    return res.data;
  },

  approveFIR: async (id) => {
    const res = await apiClient.post(`/fir/${id}/approve`);
    return res.data;
  },

  getPDFUrl: (id, language = "en") => {
    return `${API_BASE_URL}/fir/${id}/pdf?language=${language}`;
  }
};

export default api;
