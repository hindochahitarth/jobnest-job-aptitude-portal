const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export async function signup(data) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Signup failed");
  }

  return response.json();
}

export async function login(credentials) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Login failed");
  }

  return response.json();
}

export async function uploadResume(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/candidate/resume/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Resume upload failed");
  }

  return response.json();
}

export async function getLatestResume(token) {
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/candidate/resume/latest`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export function authFetch(token) {
  return function (path, opts = {}) {
    const headers = { ...(opts.headers || {}), Authorization: `Bearer ${token}` };
    return fetch(`${API_URL}${path}`, { ...opts, headers });
  };
}
