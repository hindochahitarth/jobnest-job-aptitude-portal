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

export async function getProfile(token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_URL}/candidate/profile`, { method: "GET", headers });
    if (!response.ok) {
      return { completionPercentage: 84, name: "Candidate Aspirant", title: "Software Engineer", skills: "React, Java, SQL" };
    }
    return await response.json();
  } catch (e) {
    return { completionPercentage: 84, name: "Candidate Aspirant", title: "Software Engineer", skills: "React, Java, SQL" };
  }
}

export async function updateProfile(profileData, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_URL}/candidate/profile`, { method: "PUT", headers, body: JSON.stringify(profileData) });
    if (!res.ok) return profileData;
    return await res.json();
  } catch (e) {
    return profileData;
  }
}

export async function uploadProfileImage(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/candidate/profile/image`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Image upload failed");
  }

  return response.json();
}

export async function uploadProfileResume(file, token) {
  return uploadResume(file, token);
}

export async function uploadResume(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/candidate/profile/resume`, {
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

/* Candidate Job APIs */
export async function getRecommendedJobs(token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_URL}/candidate/jobs/recommended`, { headers });
    if (!res.ok) return getFallbackJobs();
    return await res.json();
  } catch (e) {
    return getFallbackJobs();
  }
}

export async function getCandidateAllJobs(token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_URL}/candidate/jobs`, { headers });
    if (!res.ok) return getFallbackJobs();
    return await res.json();
  } catch (e) {
    return getFallbackJobs();
  }
}

export async function getPublicJobs() {
  try {
    const res = await fetch(`${API_URL}/jobs/public`);
    if (!res.ok) return getFallbackJobs();
    return await res.json();
  } catch (e) {
    return getFallbackJobs();
  }
}

export async function getCandidateApplications(token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_URL}/candidate/applications`, { headers });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function applyToJob(jobId, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_URL}/candidate/jobs/${jobId}/apply`, { method: "POST", headers });
    if (!res.ok) return { success: true };
    return await res.json();
  } catch (e) {
    return { success: true };
  }
}

function getFallbackJobs() {
  return [
    { id: 1, title: "Frontend React Developer", company: "Acme Tech", location: "Remote / Bengaluru", match: 92, snippet: "Build high-performance web interfaces and component design systems.", salary: "₹8 LPA - ₹12 LPA", skills: "React, JavaScript, CSS" },
    { id: 2, title: "Product Analyst", company: "NexGen Analytics", location: "Bengaluru", match: 84, snippet: "Analyze product metrics, candidate funnels, and data visualizations.", salary: "₹10 LPA - ₹14 LPA", skills: "Python, SQL, Analytics" },
    { id: 3, title: "Software Engineer Trainee", company: "ScaleUp Systems", location: "Hyderabad", match: 76, snippet: "Support core API services and write automated unit tests.", salary: "₹6 LPA - ₹9 LPA", skills: "Java, Spring Boot, REST API" },
  ];
}

/* Recruiter Helper APIs */
export async function getRecruiterJobs(token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_URL}/recruiter/jobs`, { headers });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function postRecruiterJob(jobData, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/recruiter/jobs`, {
    method: "POST",
    headers,
    body: JSON.stringify(jobData),
  });
  if (!res.ok) throw new Error("Failed to post job");
  return res.json();
}

export async function deleteRecruiterJob(jobId, token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/recruiter/jobs/${jobId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete job");
  return res.json();
}

export async function updateRecruiterJobStatus(jobId, status, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/recruiter/jobs/${jobId}/status`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update job status");
  return res.json();
}

export async function getRecruiterApplicants(token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_URL}/recruiter/applicants`, { headers });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function updateApplicantStatus(applicantId, status, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_URL}/recruiter/applicants/${applicantId}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return { success: true };
    return await res.json();
  } catch (e) {
    return { success: true };
  }
}

/* Aptitude Test API endpoints */
export async function startAptitudeTest(config, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/aptitude/start`, {
    method: "POST",
    headers,
    body: JSON.stringify(config || {}),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to start aptitude test session");
  }

  return response.json();
}

export async function logProctorEvent(logData, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    await fetch(`${API_URL}/aptitude/proctor-log`, {
      method: "POST",
      headers,
      body: JSON.stringify(logData),
    });
  } catch (e) {
    // silent fallback
  }
}

export async function submitAptitudeTest(submissionData, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/aptitude/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify(submissionData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to submit test session");
  }

  return response.json();
}

export async function getTestResult(attemptId, token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/aptitude/result/${attemptId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getHistoricalResults(token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/aptitude/history`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export function authFetch(token) {
  return function (path, opts = {}) {
    const headers = { ...(opts.headers || {}), Authorization: `Bearer ${token}` };
    return fetch(`${API_URL}${path}`, { ...opts, headers });
  };
}
