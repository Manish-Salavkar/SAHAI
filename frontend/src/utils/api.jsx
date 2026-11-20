// sahai/src/utils/api.jsx

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  // Use Vite env variable, fallback to localhost if missing
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole"); // Added this to keep it in sync with App.jsx

    window.location.href = "/";
    return null; // Return null so components know the request was aborted
  }

  return response;
}