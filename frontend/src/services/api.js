const API_URL = "http://localhost:8080/api";

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
    throw new Error("Signup failed");
  }

  return response.json();
}
