const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const sendAIMessage = async (message, token) => {
  const response = await fetch(`${API_URL}/api/admin/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get AI response");
  }

  return data.message;
};