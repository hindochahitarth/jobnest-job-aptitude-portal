# 🐛 JobNest — Comprehensive Bug Report & Missing Features

> **Project:** JobNest – Job & Aptitude Portal  
> **Date:** 14 August 2026  
> **Prepared By:** Development Review  
> **Status:** Ready for Team Assignment

---

## Table of Contents

1. [Critical Bugs (P0 — Must Fix)](#critical-bugs-p0)
2. [Major Bugs (P1 — High Priority)](#major-bugs-p1)
3. [Medium Bugs (P2 — Important)](#medium-bugs-p2)
4. [Minor Bugs (P3 — Low Priority)](#minor-bugs-p3)
5. [Missing Pages & Functionality](#missing-pages--functionality)
6. [Stub / Placeholder Components](#stub--placeholder-components)
7. [Static / Hardcoded Data Issues](#static--hardcoded-data-issues)

---

## Critical Bugs (P0)

### BUG-001: `/jobs` Page Accessible Without Login — Shows Logged-In UI

| Field | Details |
|-------|---------|
| **Severity** | 🔴 Critical |
| **Page** | `/jobs` |
| **File** | [App.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/App.jsx#L21) |
| **Component** | [Jobs.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/Jobs.jsx) |

**Description:**  
When a user navigates to `http://localhost:3000/jobs` (from Home page or by directly typing the URL), the Jobs page renders inside `DashboardLayout` — which includes the sidebar, topbar, logout button, and user avatar — making it appear as if the user is logged in, even though they never authenticated.

**Root Cause:**  
In [App.jsx line 21](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/App.jsx#L21), the route `if (path === "/jobs") return <JobsPage />;` renders `JobsPage` directly without any auth check. The `JobsPage` component (when `embed` is false) wraps itself in `<DashboardLayout>`, which shows the full dashboard shell with sidebar, user avatar, and logout button — regardless of auth state.

**How to Fix:**
1. Add an auth guard in `App.jsx` for the `/jobs` route — check if `user` exists from `AuthContext`
2. If user is **NOT** logged in → either redirect to `/login` or render `JobsPage` with a **public layout** (Navbar + Footer from landing page) instead of `DashboardLayout`
3. If user **IS** logged in → render with `DashboardLayout` as currently done

```diff
// In App.jsx Router()
- if (path === "/jobs") return <JobsPage />;
+ if (path === "/jobs") return <JobsGuard />;

// New component:
+ function JobsGuard() {
+   const { user } = useContext(AuthContext);
+   if (!user) {
+     // Show jobs with public layout (Navbar/Footer) — no dashboard shell
+     return <PublicJobsPage />;
+   }
+   return <JobsPage />;
+ }
```

---

### BUG-002: No Auth Protection on Any Route Except `/dashboard`

| Field | Details |
|-------|---------|
| **Severity** | 🔴 Critical |
| **Page** | All pages |
| **File** | [App.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/App.jsx#L10-L25) |

**Description:**  
Only `/dashboard` has an auth check via `DashboardSwitcher`. All other routes (`/jobs`, `/signup`, `/login`) have no guards. This means:
- A logged-in user can still visit `/login` and `/signup` (should redirect to dashboard)
- `/jobs` is accessible to everyone with a logged-in appearance (see BUG-001)

**Root Cause:**  
The [Router function](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/App.jsx#L10-L25) has no centralized route protection. Each route is a simple `if` check with no auth consideration.

**How to Fix:**
1. Create a `ProtectedRoute` wrapper component that checks auth state and redirects unauthenticated users to `/login`
2. Create a `GuestRoute` wrapper that redirects authenticated users away from `/login` and `/signup` to `/dashboard`
3. Apply these wrappers to the relevant routes in the Router

```jsx
function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) {
    window.history.pushState({}, "", "/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
    return null;
  }
  return children;
}

function GuestRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (user) {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
    return null;
  }
  return children;
}
```

---

### BUG-003: Logout Does Not Redirect User to Home/Login

| Field | Details |
|-------|---------|
| **Severity** | 🔴 Critical |
| **File** | [DashboardTopbar.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/components/layout/DashboardTopbar.jsx#L42) |
| **Context File** | [AuthContext.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/context/AuthContext.jsx#L40-L43) |

**Description:**  
When the user clicks "Logout", the `logout()` function clears `user` and `token` from state and localStorage but does **not** navigate the user to `/` or `/login`. The user stays on the `/dashboard` URL with a broken state — `DashboardSwitcher` eventually catches it and pushes to login, but there's a flash of broken UI.

**Root Cause:**  
The [logout function](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/context/AuthContext.jsx#L40-L43) only clears state, it doesn't trigger navigation. The `onClick={logout}` in [DashboardTopbar](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/components/layout/DashboardTopbar.jsx#L42) calls it without any redirect.

**How to Fix:**
```diff
// Option A: Add navigation after logout in DashboardTopbar.jsx
  onClick={() => {
    logout();
+   window.history.pushState({}, "", "/");
+   window.dispatchEvent(new PopStateEvent("popstate"));
  }}

// Option B: Add navigation inside AuthContext.logout()
  function logout() {
    setToken(null);
    setUser(null);
+   window.history.pushState({}, "", "/login");
+   window.dispatchEvent(new PopStateEvent("popstate"));
  }
```

---

### BUG-004: Token Not Validated on Page Refresh — Stale Auth State

| Field | Details |
|-------|---------|
| **Severity** | 🔴 Critical |
| **File** | [AuthContext.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/context/AuthContext.jsx#L7-L15) |

**Description:**  
On page refresh, the `AuthContext` restores `user` and `token` from `localStorage` without verifying if the token is still valid (not expired, not revoked). This means a user with an expired/invalid JWT will appear "logged in" but all API calls will fail with 401 errors.

**Root Cause:**  
The [useState initializer](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/context/AuthContext.jsx#L7-L15) blindly trusts localStorage values without any server-side token validation.

**How to Fix:**
1. Add a `useEffect` in `AuthContext` that runs on mount
2. Call a `/api/auth/me` or `/api/auth/validate` endpoint with the stored token
3. If the server returns 401/403, clear localStorage and set `user`/`token` to null
4. Show a loading state while validating

```jsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (token) {
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error("Invalid token");
      return res.json();
    })
    .then(userData => setUser(userData))
    .catch(() => { setToken(null); setUser(null); })
    .finally(() => setLoading(false));
  } else {
    setLoading(false);
  }
}, []);
```

> [!IMPORTANT]
> This also requires a backend endpoint `GET /api/auth/me` that returns the user profile based on the JWT — verify this exists on the backend.

---

## Major Bugs (P1)

### BUG-005: Navbar Always Shows "Sign In / Register" Even When Logged In

| Field | Details |
|-------|---------|
| **Severity** | 🟠 Major |
| **Page** | `/` (Home), `/jobs` (when public) |
| **File** | [Navbar.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/components/layout/Navbar.jsx#L51-L58) |

**Description:**  
The landing page Navbar always shows "Sign In" and "Register Free" buttons. When a user is logged in and navigates back to `/` (Home), they still see those buttons instead of "Dashboard" or "Logout".

**Root Cause:**  
The [Navbar](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/components/layout/Navbar.jsx) does not consume `AuthContext`. The actions are hardcoded to always show Sign In / Register.

**How to Fix:**
1. Import and use `useContext(AuthContext)` in `Navbar.jsx`
2. Conditionally render: if user is logged in → show "Go to Dashboard" and "Logout" buttons; if not → show "Sign In" and "Register Free"

```jsx
const { user, logout } = useContext(AuthContext);

// In nav-actions div:
{user ? (
  <>
    <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
      Dashboard
    </button>
    <button className="btn btn-ghost" onClick={() => { logout(); navigate("/"); }}>
      Logout
    </button>
  </>
) : (
  <>
    <button className="btn btn-ghost" onClick={() => navigate("/login")}>Sign In</button>
    <button className="btn btn-primary" onClick={() => navigate("/signup")}>Register Free</button>
  </>
)}
```

---

### BUG-006: Custom Router Doesn't Support Dashboard Sub-Routes Properly

| Field | Details |
|-------|---------|
| **Severity** | 🟠 Major |
| **Page** | `/dashboard/*` sub-pages |
| **File** | [App.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/App.jsx#L22) |

**Description:**  
The Router uses `path.startsWith("/dashboard")` to render `DashboardSwitcher`, which then renders the right Dashboard component. Inside the Dashboard, `window.location.pathname.replace("/dashboard", "")` is used to resolve the sub-section. This works, but if you **directly navigate** to `http://localhost:3000/dashboard/profile` (e.g., open a new tab), the page loads correctly. However, clicking sidebar links triggers a full route change via `popstate`, which causes the entire `Router` → `DashboardSwitcher` → `Dashboard` → sub-section to re-render from scratch — there's **no transition** and no state persistence between sub-pages.

**Root Cause:**  
The custom router in [App.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/App.jsx#L10-L25) is a basic `useState + popstate` listener that re-evaluates the entire component tree on every navigation. There is no proper SPA routing library (like React Router).

**How to Fix:**
1. **Short-term:** Move `useState` for the active sub-section inside the Dashboard components so sidebar clicks only update the inner section, not the whole app
2. **Long-term:** Integrate `react-router-dom` for proper SPA routing with nested routes, which also enables route transitions, lazy loading, and URL params

---

### BUG-007: Sidebar Active State Only Matches Exact `/dashboard` Path

| Field | Details |
|-------|---------|
| **Severity** | 🟠 Major |
| **File** | [Sidebar.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/components/layout/Sidebar.jsx#L28) |

**Description:**  
The sidebar item `active` class is applied using `currentPath === item.href`. This means only the item whose `href` exactly matches the current URL gets highlighted. For the "Feed & Overview" item (`href="/dashboard"`), it will be active on `/dashboard` but NOT on `/dashboard/` (with trailing slash). Sub-pages correctly deactivate it, but there's no `startsWith` fallback for nested matching.

**Root Cause:**  
[Line 28](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/components/layout/Sidebar.jsx#L28) uses strict equality: `currentPath === item.href`.

**How to Fix:**
```diff
- const isActive = currentPath === item.href || (currentPath === "/dashboard" && item.href === "/dashboard");
+ const isActive = item.href === "/dashboard"
+   ? (currentPath === "/dashboard" || currentPath === "/dashboard/")
+   : currentPath.startsWith(item.href);
```

---

### BUG-008: Footer Links Navigate Without Auth — Lead to Broken Dashboard Pages

| Field | Details |
|-------|---------|
| **Severity** | 🟠 Major |
| **File** | [Footer.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/components/landing/Footer.jsx#L16-L29) |

**Description:**  
Footer links like "Resume AI Builder" (`/dashboard/resume`), "Post a Job" (`/dashboard/post-job`), "Candidate Search" (`/dashboard/applicants`), etc. are plain `<a>` tags that do a full page navigation. Since there's no auth guard on these specific sub-routes (only `/dashboard` root is guarded), clicking these links from the home page will either:
- Show the dashboard UI without proper user data (if localStorage has stale data), OR
- Redirect to login (if `DashboardSwitcher` catches it)

Additionally, these `<a>` tags don't use the SPA navigation pattern (`pushState` + `popstate`), so they cause a **full page reload**.

**Root Cause:**  
Footer links use standard `<a href="...">` without `onClick` SPA navigation handlers, and dashboard sub-routes have no standalone auth guards.

**How to Fix:**
1. Add `onClick` handlers with `e.preventDefault()` and SPA navigation (like Navbar does)
2. For dashboard links: check auth state first, redirect to login if not authenticated
3. Or: make these footer links point to anchor sections on the home page instead

---

### BUG-009: Search Bar in DashboardTopbar Is Non-Functional

| Field | Details |
|-------|---------|
| **Severity** | 🟠 Major |
| **File** | [DashboardTopbar.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/components/layout/DashboardTopbar.jsx#L14-L17) |

**Description:**  
The search input in the dashboard topbar has no `value`, no `onChange` handler, and no `onSubmit` or search action. It's a completely non-functional UI element.

**How to Fix:**
1. Add local state for search term
2. Implement search functionality (filter jobs, skills, tests based on input)
3. Connect to either a backend search API or client-side filtering

---

### BUG-010: Notification Bell Is Non-Functional

| Field | Details |
|-------|---------|
| **Severity** | 🟠 Major |
| **File** | [DashboardTopbar.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/components/layout/DashboardTopbar.jsx#L22-L25) |

**Description:**  
The notification bell button (`🔔`) and its red dot indicator are purely decorative. Clicking it does nothing. There's no notification system, no dropdown, and no API integration.

**How to Fix:**
1. Create a `NotificationDropdown` component
2. Add `onClick` to toggle visibility
3. Later: integrate with backend notification API

---

## Medium Bugs (P2)

### BUG-011: Location Filter on Jobs Page Doesn't Actually Filter

| Field | Details |
|-------|---------|
| **Severity** | 🟡 Medium |
| **File** | [Jobs.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/Jobs.jsx#L18-L22) |

**Description:**  
The Jobs page has a location filter input field, but the `filteredJobs` logic only filters by `title` and `company`. The `location` state variable is captured but never used in the filter function.

**Root Cause:**  
[Filter logic on lines 18-22](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/Jobs.jsx#L18-L22) ignores the `location` state.

**How to Fix:**
```diff
  const filteredJobs = mockJobs.filter(
    (j) =>
-     j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
-     j.company.toLowerCase().includes(searchTerm.toLowerCase())
+     (j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
+      j.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
+     (location === "" || j.location.toLowerCase().includes(location.toLowerCase()))
  );
```

---

### BUG-012: Hero Search Navigates to `/jobs` With Query Params — Params Are Ignored

| Field | Details |
|-------|---------|
| **Severity** | 🟡 Medium |
| **File** | [Hero.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/components/landing/Hero.jsx#L10-L11) |
| **Related File** | [Jobs.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/Jobs.jsx) |

**Description:**  
The Hero search form navigates to `/jobs?q=React&loc=Bengaluru`, but the Jobs page (`Jobs.jsx`) never reads `window.location.search` or URL query parameters. The search terms from the landing page are completely lost.

**How to Fix:**
1. In `Jobs.jsx`, parse `URLSearchParams` on mount
2. Pre-populate `searchTerm` and `location` states from query params

```jsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("q")) setSearchTerm(params.get("q"));
  if (params.get("loc")) setLocation(params.get("loc"));
}, []);
```

---

### BUG-013: "Edit Profile" Button Does Nothing

| Field | Details |
|-------|---------|
| **Severity** | 🟡 Medium |
| **File** | [Profile.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/Profile.jsx#L47-L49) |

**Description:**  
The "✏️ Edit Profile" button on the Profile page has no `onClick` handler. Clicking it does nothing.

**How to Fix:**
1. Create an edit profile modal or inline editing mode
2. Connect to backend `PUT /api/candidate/profile` endpoint

---

### BUG-014: "Apply Now" and "Easy Apply" Only Show `alert()` — No Real Application Flow

| Field | Details |
|-------|---------|
| **Severity** | 🟡 Medium |
| **Files** | [Jobs.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/Jobs.jsx#L24-L26), [Overview.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/Overview.jsx#L75), [JobCard.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/components/job/JobCard.jsx#L44) |

**Description:**  
All job application buttons use `alert()` to simulate the action. There is no real application submission — no API call to backend, no tracking of applied jobs, no confirmation UI.

**How to Fix:**
1. Create an API service `applyToJob(jobId, token)`
2. Call `POST /api/candidate/apply` on the backend
3. Show a proper success toast/modal instead of `alert()`
4. Track applied jobs in the dashboard

---

### BUG-015: PostJob Form Only Shows `alert()` — No Backend Integration

| Field | Details |
|-------|---------|
| **Severity** | 🟡 Medium |
| **File** | [PostJob.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/recruiter/PostJob.jsx#L21-L26) |

**Description:**  
The recruiter "Post Job" form submission shows an `alert()` and navigates to `/dashboard`. No API call is made — the job is never actually created on the backend.

**How to Fix:**
1. Add `POST /api/recruiter/jobs` API call in `api.js`
2. Pass the auth token for authorization
3. Show success/error feedback properly
4. The posted job should appear in the recruiter's job listings

---

### BUG-016: PostJob Form Missing "Job Description" Textarea

| Field | Details |
|-------|---------|
| **Severity** | 🟡 Medium |
| **File** | [PostJob.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/recruiter/PostJob.jsx) |

**Description:**  
The form state has a `description` field, but there is no corresponding `<textarea>` in the form UI for entering the job description. A job posting without a description is incomplete.

**How to Fix:**
Add a textarea field before the submit button:
```jsx
<div className="input-group">
  <label>Job Description *</label>
  <textarea
    className="input-field"
    name="description"
    value={form.description}
    onChange={handleChange}
    rows={5}
    placeholder="Describe the role, responsibilities, and requirements..."
    required
  />
</div>
```

---

### BUG-017: Aptitude Test "Start Assessment" Only Shows `alert()` — No Test Engine

| Field | Details |
|-------|---------|
| **Severity** | 🟡 Medium |
| **File** | [Tests.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/Tests.jsx#L67) |

**Description:**  
Clicking "Start Assessment" on any test card shows `alert()`. There is no actual test-taking interface — no questions, no timer, no answer submission, no evaluation.

**How to Fix:**
1. Create a `TestEngine` component with question rendering, timer, and answer tracking
2. Create a route like `/dashboard/tests/:testId`
3. Connect to backend API for fetching questions and submitting answers

---

### BUG-018: AI Job Description Generator is Fully Hardcoded Client-Side

| Field | Details |
|-------|---------|
| **Severity** | 🟡 Medium |
| **File** | [AITools.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/recruiter/AITools.jsx#L8-L13) |

**Description:**  
The "Generate Optimized Job Specification" button generates a hardcoded string template on the client side. It doesn't call any AI/backend API. The output is always the same template with only the role title inserted.

**How to Fix:**
1. Create a backend endpoint `POST /api/recruiter/ai/generate-jd`
2. Integrate with Spring AI / OpenAI on the backend
3. Pass the role title and get back AI-generated content

---

### BUG-019: Resume Upload Error Silently Fakes Success

| Field | Details |
|-------|---------|
| **Severity** | 🟡 Medium |
| **File** | [ResumeBuilder.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/ResumeBuilder.jsx#L73-L87) |

**Description:**  
When the resume upload API fails (catch block), the code **fakes a success response** by populating `parsedProfile` with hardcoded mock data and showing a success message ("parsed successfully!"). The user has no idea the upload actually failed.

**Root Cause:**  
The catch block in [handleUpload](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/ResumeBuilder.jsx#L73-L87) is designed as a "client fallback" but it misleads the user.

**How to Fix:**
```diff
  } catch (err) {
-   // Robust client fallback parsing preview
-   setParsedProfile({ ... });
-   setMessage(`Resume "${selectedFile.name}" parsed successfully!`);
+   setMessage(err.message || "Resume upload failed. Please try again.");
+   setIsError(true);
  }
```

---

## Minor Bugs (P3)

### BUG-020: `useAuth` Hook Is Orphaned — Not Used Anywhere

| Field | Details |
|-------|---------|
| **Severity** | 🔵 Minor |
| **File** | [useAuth.js](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/hooks/useAuth.js) |

**Description:**  
The `useAuth` hook exists but is never imported or used in the project. The app uses `useContext(AuthContext)` directly everywhere. This is dead code that may confuse new team members.

**How to Fix:**
Either delete the file, or refactor it into a proper hook:
```jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
export function useAuth() {
  return useContext(AuthContext);
}
```
Then replace all `useContext(AuthContext)` calls with `useAuth()` for cleaner code.

---

### BUG-021: `AppRoutes.jsx` Is Not Used — Dead Code

| Field | Details |
|-------|---------|
| **Severity** | 🔵 Minor |
| **File** | [AppRoutes.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/routes/AppRoutes.jsx) |

**Description:**  
This file exports a `routes` array with only one entry (`/login`), but it's never imported or used anywhere. The actual routing is done inline in `App.jsx`.

**How to Fix:**  
Either delete this file, or refactor routing to use this file as the central route config.

---

### BUG-022: `Register.jsx` Is Just a Re-Export of `Signup.jsx`

| Field | Details |
|-------|---------|
| **Severity** | 🔵 Minor |
| **File** | [Register.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/auth/Register.jsx) |

**Description:**  
`Register.jsx` simply re-exports `Signup.jsx`. In `App.jsx`, the `/signup` route renders `<Register />` which internally renders `<Signup />`. This is unnecessary indirection.

**How to Fix:**
1. Import `Signup` directly in `App.jsx` for the `/signup` route
2. Delete `Register.jsx`, or keep it as an alias if both `/signup` and `/register` URLs are needed

---

### BUG-023: Profile Data Is Hardcoded — Not Fetched from Backend

| Field | Details |
|-------|---------|
| **Severity** | 🔵 Minor (but impacts UX) |
| **File** | [Profile.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/Profile.jsx) |

**Description:**  
The profile page shows hardcoded data: headline ("Computer Science Student • Full Stack Developer"), location ("Bengaluru, India"), skills (Quantitative Reasoning 94%, etc.), badges, and profile strength (84%). Only `name` and `email` come from `AuthContext`.

**How to Fix:**
1. Create a `GET /api/candidate/profile` backend endpoint
2. Fetch real profile data on mount
3. Allow editing and saving profile data

---

### BUG-024: README Says "Signup modal saves JWT and auto-navigates to dashboard" — Actually It Doesn't

| Field | Details |
|-------|---------|
| **Severity** | 🔵 Minor |
| **File** | [README.md line 183](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/README.md#L183) |

**Description:**  
The README states: _"On success the JWT and user object are saved to localStorage and the app navigates to /dashboard."_ But the actual `signup` function in `AuthContext` explicitly does NOT auto-login after signup (comment on line 29: "Do NOT auto-login after signup — user must log in explicitly"). The Signup page redirects to `/login` after a delay.

**How to Fix:**
Update the README to match actual behavior.

---

### BUG-025: `handleLinkClick` in Navbar Passes `(e, href)` But Button onClick Passes `(e)`

| Field | Details |
|-------|---------|
| **Severity** | 🔵 Minor |
| **File** | [Navbar.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/components/layout/Navbar.jsx#L52-L56) |

**Description:**  
The Sign In and Register Free buttons use `onClick={(e) => handleLinkClick(e, "/login")}`, but `handleLinkClick` calls `e.preventDefault()`. Since these are `<button>` elements (not `<a>` tags), calling `preventDefault()` on a button click is unnecessary and slightly inconsistent. It works, but is a code smell.

**How to Fix:**
Use `navigate()` directly instead of `handleLinkClick()` for buttons:
```jsx
<button onClick={() => navigate("/login")}>Sign In</button>
```

---

## Missing Pages & Functionality

> [!WARNING]
> The README documents several major features that have **no frontend implementation** at all. These need to be built from scratch.

| # | Missing Feature | Expected Route | Description | Priority |
|---|----------------|---------------|-------------|----------|
| MP-01 | **Aptitude Test Engine** | `/dashboard/tests/:testId` | Actual test-taking UI with questions, timer, answer selection, auto-submit | 🔴 P0 |
| MP-02 | **Test Results Detail Page** | `/dashboard/results/:testId` | Detailed scorecard for a specific test with section-wise breakdown | 🟠 P1 |
| MP-03 | **Job Detail Page** | `/jobs/:jobId` | Full job detail view with apply functionality (public + authenticated) | 🟠 P1 |
| MP-04 | **Application Tracking** | `/dashboard/applications` | List of jobs applied to with status tracking (Applied, In Review, Shortlisted, etc.) | 🟠 P1 |
| MP-05 | **AI Mock Interview Page** | `/dashboard/mock-interview` | AI-powered mock interview with questions and feedback | 🟡 P2 |
| MP-06 | **Settings/Account Page** | `/dashboard/settings` | User settings: change password, email preferences, delete account | 🟡 P2 |
| MP-07 | **Password Reset / Forgot Password** | `/forgot-password` | Forgot password flow with email OTP or reset link | 🟡 P2 |
| MP-08 | **Resume Template Builder** | `/dashboard/resume-builder` | ATS-friendly resume templates with PDF export (README: "Resume Template Builder") | 🟡 P2 |
| MP-09 | **Recruiter Candidate Detail View** | `/dashboard/applicants/:candidateId` | Full candidate profile view for recruiter with resume, scores, and match details | 🟡 P2 |
| MP-10 | **Privacy Policy Page** | `/privacy` | Legal page linked from Footer | 🔵 P3 |
| MP-11 | **Terms of Service Page** | `/terms` | Legal page linked from Footer | 🔵 P3 |
| MP-12 | **404 / Not Found Page** | Any unmatched route | Currently falls back to Home page silently — should show proper 404 | 🔵 P3 |
| MP-13 | **Contact Us / Support Page** | `/contact` | Not linked yet, but needed for a complete portal | 🔵 P3 |

---

## Stub / Placeholder Components

> [!NOTE]
> These files exist but contain empty or trivial placeholder implementations. They should either be properly implemented or removed.

| # | File | Current Content | What It Should Be |
|---|------|----------------|-------------------|
| ST-01 | [TestCard.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/components/candidate/TestCard.jsx) | Returns `<div>Test</div>` | A reusable test card component — or delete if `Tests.jsx` renders inline |
| ST-02 | [JobForm.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/components/recruiter/JobForm.jsx) | Returns `<form></form>` | A reusable job posting form — or delete if `PostJob.jsx` contains the form |
| ST-03 | [Header.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/components/common/Header.jsx) | Returns `<header>Jobnest</header>` | Either a proper header component or delete (Navbar.jsx is used instead) |
| ST-04 | [format.js](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/utils/format.js) | Single function `formatScore(value)` — never used | Either expand with real utility functions or delete |

---

## Static / Hardcoded Data Issues

> [!CAUTION]
> Almost every page uses hardcoded mock data instead of fetching from the backend API. This is the biggest systemic issue. Below is the full inventory:

| # | Page | File | Hardcoded Data | Backend API Needed |
|---|------|------|---------------|-------------------|
| SD-01 | Candidate Overview | [Overview.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/Overview.jsx#L8-L26) | `stats`, `performance`, `jobs` arrays, profile strength "84%", headline | `GET /api/candidate/dashboard/overview` |
| SD-02 | Jobs Page | [Jobs.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/Jobs.jsx#L6-L11) | `mockJobs` array with 4 hardcoded jobs | `GET /api/jobs?search=...&location=...` |
| SD-03 | Profile Page | [Profile.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/Profile.jsx) | Headline, skills, badges, profile strength, location | `GET /api/candidate/profile` |
| SD-04 | Tests Page | [Tests.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/Tests.jsx#L3-L8) | `testSuite` array, stat cards (94th %ile, 6/8 tests) | `GET /api/candidate/tests` |
| SD-05 | Results Page | [Results.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/Results.jsx#L3-L7) | `results` array | `GET /api/candidate/results` |
| SD-06 | Match Scores | [MatchScores.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/MatchScores.jsx#L3-L8) | `breakdown` array | `GET /api/candidate/match-scores` |
| SD-07 | Interview Prep | [InterviewPrep.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/InterviewPrep.jsx#L3-L7) | `prepTopics` array | `GET /api/candidate/interview-prep` |
| SD-08 | Resume Builder | [ResumeBuilder.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/candidate/ResumeBuilder.jsx#L14-L21) | `parsedProfile` initial state | Already partially connected (upload + fetch) ✅ |
| SD-09 | Recruiter Overview | [Overview.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/recruiter/Overview.jsx#L6-L25) | `stats`, `hiresData`, `openJobs` | `GET /api/recruiter/dashboard/overview` |
| SD-10 | Recruiter Applicants | [Applicants.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/recruiter/Applicants.jsx#L5-L10) | `initialApplicants` array | `GET /api/recruiter/applicants` |
| SD-11 | Recruiter Shortlisted | [Shortlisted.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/recruiter/Shortlisted.jsx#L3-L6) | `shortlisted` array | `GET /api/recruiter/shortlisted` |
| SD-12 | Recruiter Reports | [Reports.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/recruiter/Reports.jsx#L5-L10) | `analytics` array, metrics | `GET /api/recruiter/reports` |
| SD-13 | AI Tools | [AITools.jsx](file:///h:/CSPIT_CE/SEM-7/SGP/jobnest-job-aptitude-portal/frontend/src/pages/recruiter/AITools.jsx#L10-L12) | Client-side JD generation template | `POST /api/recruiter/ai/generate-jd` |

---

## Summary Statistics

| Category | Count |
|----------|-------|
| 🔴 Critical Bugs (P0) | 4 |
| 🟠 Major Bugs (P1) | 6 |
| 🟡 Medium Bugs (P2) | 9 |
| 🔵 Minor Bugs (P3) | 6 |
| **Total Bugs** | **25** |
| Missing Pages | 13 |
| Stub Components | 4 |
| Pages with Hardcoded Data | 13 |

---

## Recommended Fix Order

1. **First Sprint — Auth & Routing (P0):** Fix BUG-001 through BUG-004 — these are security and fundamental UX issues
2. **Second Sprint — Navigation & Layout (P1):** Fix BUG-005 through BUG-010 — navbar state, sidebar, footer links, logout redirect
3. **Third Sprint — Feature Completion (P2):** Fix BUG-011 through BUG-019 — search filters, API integrations, form completions
4. **Fourth Sprint — Missing Pages (MP):** Build the aptitude test engine, job detail page, application tracking
5. **Ongoing — Data Integration (SD):** Replace hardcoded data with backend API calls as each endpoint is built
