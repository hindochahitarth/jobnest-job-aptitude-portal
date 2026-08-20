import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import * as api from "../../services/api";

const STEPS = [
  { key: "basic", label: "Basic Info" },
  { key: "skills", label: "Skills & Exp" },
  { key: "links", label: "Links & Files" },
  { key: "review", label: "Review" },
];

const EXPERIENCE_LEVELS = [
  { value: "ENTRY", label: "Entry Level", icon: "", desc: "0-1 years / Fresher" },
  { value: "MID", label: "Mid Level", icon: "", desc: "2-4 years experience" },
  { value: "SENIOR", label: "Senior Level", icon: "", desc: "5+ years experience" },
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const BACKEND_BASE = API_BASE.replace("/api", "");

export default function Profile() {
  const { user, token } = useContext(AuthContext);

  // Profile data from API
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wizard mode vs View mode
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(0);

  // Wizard form state
  const [form, setForm] = useState({
    headline: "",
    location: "",
    bio: "",
    techStack: [],
    experienceLevel: "",
    githubUrl: "",
    linkedinUrl: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const[resumePreviewUrl, setResumePreviewUrl] = useState(null);
  const [imageDrag, setImageDrag] = useState(false);
  const [resumeDrag, setResumeDrag] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3800);
  }, []);

  // Fetch profile on mount
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getProfile(token);
        if (cancelled) return;
        setProfile(data);
        if (!data.profileCompleted) {
          // Pre-fill wizard form with any existing data
          setForm({
            headline: data.headline || "",
            location: data.location || "",
            bio: data.bio || "",
            techStack: data.techStack || [],
            experienceLevel: data.experienceLevel || "",
            githubUrl: data.githubUrl || "",
            linkedinUrl: data.linkedinUrl || "",
          });
          setShowWizard(true);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProfile();
    return () => { cancelled = true; };
  }, [token]);

  // Cleanup toast timer
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Form handlers
  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleTagKeyDown(e) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,/g, "");
      if (newTag && !form.techStack.includes(newTag)) {
        updateField("techStack", [...form.techStack, newTag]);
      }
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && form.techStack.length > 0) {
      updateField("techStack", form.techStack.slice(0, -1));
    }
  }

  function removeTag(index) {
    updateField("techStack", form.techStack.filter((_, i) => i !== index));
  }

  // File handling
  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file (JPEG, PNG, GIF, WebP)", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5 MB", "error");
      return;
    }
    setImageFile(file);
  }

  function handleResumeChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Resume must be a PDF file", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Resume must be less than 10 MB", "error");
      return;
    }
    setResumeFile(file);
    if(resumePreviewUrl) URL.revokeObjectURL(resumePreviewUrl);
    setResumePreviewUrl(URL.createObjectURL(file));
  }

  function handleDrag(setter) {
    return {
      onDragOver: (e) => { e.preventDefault(); setter(true); },
      onDragEnter: (e) => { e.preventDefault(); setter(true); },
      onDragLeave: () => setter(false),
      onDrop: (e) => { e.preventDefault(); setter(false); },
    };
  }

  // Step validation
  function canProceed() {
    if (step === 0) {
      return form.headline.trim().length > 0;
    }
    if (step === 1) {
      return form.techStack.length > 0 && form.experienceLevel !== "";
    }
    return true;
  }

  // Submit profile
  async function handleSubmit() {
    setSubmitting(true);
    try {
      // 1. Upload image if selected
      if (imageFile) {
        await api.uploadProfileImage(imageFile, token);
      }

      // 2. Upload resume if selected
      if (resumeFile) {
        await api.uploadProfileResume(resumeFile, token);
      }

      // 3. Update profile info
      const updated = await api.updateProfile({
        headline: form.headline,
        location: form.location,
        bio: form.bio,
        techStack: form.techStack,
        experienceLevel: form.experienceLevel,
        githubUrl: form.githubUrl,
        linkedinUrl: form.linkedinUrl,
      }, token);

      setProfile(updated);
      setShowWizard(false);
      setStep(0);
      setImageFile(null);
      setResumeFile(null);
      showToast("Profile saved successfully! 🎉");
    } catch (err) {
      showToast(err.message || "Failed to save profile", "error");
    } finally {
      setSubmitting(false);
      if(resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
        setResumePreviewUrl(null);
    }
  }
  }
  // Edit mode
  function handleEditProfile() {
    if (profile) {
      setForm({
        headline: profile.headline || "",
        location: profile.location || "",
        bio: profile.bio || "",
        techStack: profile.techStack || [],
        experienceLevel: profile.experienceLevel || "",
        githubUrl: profile.githubUrl || "",
        linkedinUrl: profile.linkedinUrl || "",
      });
    }
    setStep(0);
    setImageFile(null);
    setResumeFile(null);
    if(resumePreviewUrl) {
      URL.revokeObjectURL(resumePreviewUrl);
      setResumePreviewUrl(null);
    }
    setShowWizard(true);
  }

  // ---- Render states ----

  // Loading
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner" />
        <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading your profile...</span>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <p style={{ color: "var(--error)", fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
          {error}
        </p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  // ---- Wizard View ----
  if (showWizard) {
    return (
      <div className="profile-wizard">
        {toast && <div className={`profile-toast ${toast.type}`}>{toast.message}</div>}

        <div className="profile-wizard-card">
          <div className="profile-wizard-header">
            <h2>Complete Your Profile</h2>
            <p>Help recruiters find you — fill in your details to get started</p>
          </div>

          {/* Stepper */}
          <div className="wizard-stepper" style={{ paddingBottom: 32 }}>
            {STEPS.map((s, i) => (
              <div key={s.key} className="wizard-step-item">
                {i > 0 && (
                  <div className={`wizard-step-connector${i <= step ? " completed" : ""}`} />
                )}
                <div style={{ position: "relative" }}>
                  <div
                    className={`wizard-step-circle${
                      i === step ? " active" : i < step ? " completed" : ""
                    }`}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span
                    className="wizard-step-label"
                    style={{ color: i === step ? "var(--primary)" : i < step ? "var(--success)" : undefined }}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="wizard-step-content" key={step}>
            {step === 0 && (
              <>
                <h3>Basic Information</h3>
                <p className="step-subtitle">Tell recruiters who you are</p>

                <div className="input-group">
                  <label>Professional Headline *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Full Stack Developer | CS Student | React Enthusiast"
                    value={form.headline}
                    onChange={(e) => updateField("headline", e.target.value)}
                    maxLength={255}
                  />
                </div>

                <div className="input-group">
                  <label>Location</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Bengaluru, India"
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    maxLength={255}
                  />
                </div>

                <div className="input-group">
                  <label>Bio / About</label>
                  <textarea
                    className="input-field"
                    placeholder="Write a short bio about yourself, your goals, and what you're looking for..."
                    value={form.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    rows={4}
                    maxLength={2000}
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h3>Skills & Experience</h3>
                <p className="step-subtitle">Add your tech stack and experience level</p>

                <div className="input-group">
                  <label>Tech Stack *</label>
                  <div className="tag-input-container">
                    {form.techStack.map((tag, i) => (
                      <span key={`${tag}-${i}`} className="tag-pill">
                        {tag}
                        <button type="button" onClick={() => removeTag(i)}>×</button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="tag-input-field"
                      placeholder={form.techStack.length === 0 ? "Type a skill and press Enter (e.g. React, Java, SQL...)" : "Add more..."}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                    />
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--text-subtle)" }}>
                    Press Enter or comma to add • {form.techStack.length} skill{form.techStack.length !== 1 ? "s" : ""} added
                  </span>
                </div>

                <div className="input-group" style={{ marginTop: 8 }}>
                  <label>Experience Level *</label>
                  <div className="experience-cards">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <div
                        key={level.value}
                        className={`experience-card${form.experienceLevel === level.value ? " selected" : ""}`}
                        onClick={() => updateField("experienceLevel", level.value)}
                      >
                        <span className="exp-icon">{level.icon}</span>
                        <span className="exp-label">{level.label}</span>
                        <span className="exp-lable" style={{ fontWeight: 600, dispaly: "block", marginButton: 4 }}>{level.desc}</span>
                        <span className="exp-desc">{level.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3>Links & Uploads</h3>
                <p className="step-subtitle">Add your online presence and resume</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>GitHub URL</label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://github.com/username"
                      value={form.githubUrl}
                      onChange={(e) => updateField("githubUrl", e.target.value)}
                    />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>LinkedIn URL</label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://linkedin.com/in/username"
                      value={form.linkedinUrl}
                      onChange={(e) => updateField("linkedinUrl", e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Profile Photo</label>
                    <div
                      className={`file-drop-zone${imageDrag ? " drag-over" : ""}${imageFile || profile?.profileImageUrl ? " has-file" : ""}`}
                      {...handleDrag(setImageDrag)}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {/* <span className="drop-icon"></span>
                      <span className="drop-label"> */}
                      <span className="drop-label" style={{marginTop: 8}}>
                        {imageFile ? "Photo Selected" : profile?.profileImageUrl ? "Change Photo" : "Upload Photo"}
                      </span>
                      <span className="drop-hint">JPEG, PNG, WebP • Max 5 MB</span>
                      {imageFile && (
                        <span className="file-name">✓ {imageFile.name}</span>
                      )}
                      {!imageFile && profile?.profileImageUrl && (
                        <span className="file-name">✓ Current photo uploaded</span>
                      )}
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Resume (PDF)</label>
                    <div
                      className={`file-drop-zone${resumeDrag ? " drag-over" : ""}${resumeFile || profile?.resumeFileName ? " has-file" : ""}`}
                      {...handleDrag(setResumeDrag)}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleResumeChange}
                      />
                      {/* <span className="drop-icon">📄</span>
                      <span className="drop-label"> */}
                      <span className="drop-label" style={{marginTop: 8}}>
                        {resumeFile ? "Resume Selected" : profile?.resumeFileName ? "Change Resume" : "Upload Resume"}
                      </span>
                      <span className="drop-hint">PDF only • Max 10 MB</span>
                      {resumeFile && (
                        <span className="file-name">✓ {resumeFile.name}</span>
                      )}
                      {!resumeFile && profile?.resumeFileName && (
                        <span className="file-name">✓ {profile.resumeFileName}</span>
                      )}
                    </div>
                    {resumePreviewUrl && (
                      <div style={{marginTop:8}}>
                        <iframe src={resumePreviewUrl} width="100%" height="200" style={{border: "1px solid var(--surface-border)"}} title="Resume Preview" />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h3>Review Your Profile</h3>
                <p className="step-subtitle">Confirm your details before saving</p>

                <div className="profile-review-grid">
                  <ReviewRow label="Headline" value={form.headline} />
                  <ReviewRow label="Location" value={form.location} />
                  <ReviewRow label="Bio" value={form.bio} />
                  <ReviewRow
                    label="Tech Stack"
                    value={form.techStack.length > 0 ? form.techStack.join(", ") : null}
                  />
                  <ReviewRow
                    label="Experience"
                    value={EXPERIENCE_LEVELS.find((l) => l.value === form.experienceLevel)?.label}
                  />
                  <ReviewRow label="GitHub" value={form.githubUrl} />
                  <ReviewRow label="LinkedIn" value={form.linkedinUrl} />
                  <ReviewRow label="Photo" value={imageFile?.name || (profile?.profileImageUrl ? "Already uploaded" : null)} />
                  <ReviewRow label="Resume" value={resumeFile?.name || profile?.resumeFileName} />
                </div>
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="wizard-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                if (step > 0) setStep(step - 1);
                else if (profile?.profileCompleted) setShowWizard(false);
              }}
              disabled={step === 0 && !profile?.profileCompleted}
            >
              {step === 0 ? (profile?.profileCompleted ? "Cancel" : "") : "← Back"}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Profile"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- Completed Profile View ----
  const name = profile?.name || user?.name || "User";
  const email = profile?.email || user?.email || "";
  const initial = name.charAt(0).toUpperCase();
  const completionPct = profile?.completionPercentage ?? 0;
  const profileImageSrc = profile?.profileImageUrl
    ? `${BACKEND_BASE}${profile.profileImageUrl}`
    : null;

  return (
    <div className="dashboard-grid two-col">
      {toast && <div className={`profile-toast ${toast.type}`}>{toast.message}</div>}

      <div className="main-col" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* LinkedIn Style Profile Header */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ height: 120, background: "linear-gradient(135deg, #0a66c2 0%, #004182 100%)", position: "relative" }} />
          <div style={{ padding: "0 24px 24px", position: "relative" }}>
            {profileImageSrc ? (
              <img
                src={profileImageSrc}
                alt={name}
                className="profile-image-avatar"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : (
              <div style={{
                width: 90, height: 90, borderRadius: "50%", border: "4px solid #ffffff",
                background: "#0a66c2", color: "#fff", fontSize: 36, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: -45, marginBottom: 12, boxShadow: "var(--shadow-md)"
              }}>
                {initial}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-main)" }}>{name}</h2>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 2 }}>
                  {profile?.headline || "No headline set"}
                </p>
                <p style={{ fontSize: 13, color: "var(--text-subtle)", marginTop: 4 }}>
                  {profile?.location && ` ${profile.location} • `}{email}
                </p>
                {(profile?.githubUrl || profile?.linkedinUrl) && (
                  <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 13 }}>
                    {profile.githubUrl && (
                      <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                        style={{ color: "var(--text-muted)", textDecoration: "none" }}>
                         GitHub
                      </a>
                    )}
                    {profile.linkedinUrl && (
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                        style={{ color: "var(--text-muted)", textDecoration: "none" }}>
                        LinkedIn
                      </a>
                    )}
                  </div>
                )}
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleEditProfile}>
                Edit Profile
              </button>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--surface-border)", display: "flex", gap: 12, flexWrap: "wrap" }}>
              {profile?.experienceLevel && (
                <span className="badge-v2 primary">
                  {EXPERIENCE_LEVELS.find((l) => l.value === profile.experienceLevel)?.label || profile.experienceLevel}
                </span>
              )}
              {profile?.resumeFileName && (
                <span className="badge-v2 success"> Resume Uploaded</span>
              )}
              {completionPct === 100 && (
                <span className="badge-v2 success">✓ Profile Complete</span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Strength Meter */}
        <Card title="Profile Strength" icon="">
          <div className="profile-meter-box">
            <div className="meter-header">
              <span>Overall Completeness</span>
              <span>{completionPct}%</span>
            </div>
            <div className="meter-bar">
              <div className="meter-fill" style={{ width: `${completionPct}%` }} />
            </div>
            {completionPct < 100 && (
              <p className="meter-subtext">
                Complete your profile to get more visibility from recruiters. Add missing details to reach 100%.
              </p>
            )}
            {completionPct === 100 && (
              <p className="meter-subtext" style={{ color: "var(--success)" }}>
                Your profile is 100% complete! You'll get maximum visibility from recruiters.
              </p>
            )}
          </div>
        </Card>

        {/* Tech Stack */}
        {profile?.techStack && profile.techStack.length > 0 && (
          <Card title="Technical Skills" icon="">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {profile.techStack.map((skill, i) => (
                <span key={`${skill}-${i}`} className="badge-v2 primary" style={{ padding: "6px 12px", fontSize: 13 }}>
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Bio */}
        {profile?.bio && (
          <Card title="About" icon="">
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {profile.bio}
            </p>
          </Card>
        )}
      </div>

      <div className="side-col" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card title="Next Action Items" icon="">
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
            {!profile?.resumeFileName && (
              <li style={{ padding: 10, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                <strong>Upload your Resume</strong>
                <div style={{ color: "var(--text-subtle)", marginTop: 2 }}>Add a PDF resume for recruiter visibility</div>
              </li>
            )}
            {!profile?.profileImageUrl && (
              <li style={{ padding: 10, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                <strong>Add a Profile Photo</strong>
                <div style={{ color: "var(--text-subtle)", marginTop: 2 }}>Stand out with a professional photo</div>
              </li>
            )}
            {(!profile?.githubUrl || !profile?.linkedinUrl) && (
              <li style={{ padding: 10, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                <strong>Add Social Links</strong>
                <div style={{ color: "var(--text-subtle)", marginTop: 2 }}>Connect your GitHub and LinkedIn profiles</div>
              </li>
            )}
            {completionPct === 100 && (
              <li style={{ padding: 10, background: "var(--success-bg)", borderRadius: "var(--radius-sm)", color: "var(--success)" }}>
                <strong> All done!</strong>
                <div style={{ marginTop: 2 }}>Your profile is fully complete</div>
              </li>
            )}
            <li style={{ padding: 10, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
              <strong>Take an Aptitude Test</strong>
              <div style={{ color: "var(--text-subtle)", marginTop: 2 }}>Earn verified skill badges</div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

// Helper component for review rows
function ReviewRow({ label, value }) {
  return (
    <div className="review-row">
      <span className="review-label">{label}</span>
      <span className={`review-value${!value ? " empty" : ""}`}>
        {value || "Not provided"}
      </span>
    </div>
  );
}
