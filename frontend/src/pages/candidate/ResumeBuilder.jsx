import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import * as api from "../../services/api";

/* ─────────────────────────────────────────────────────────────────────────────
   Default blank resume data
───────────────────────────────────────────────────────────────────────────── */
const BLANK_RESUME = {
  templateId: "classic-professional",
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedIn: "",
  portfolio: "",
  headline: "",
  summary: "",
  experience: [],
  education: [],
  skills: [],
  skillCategories: [],
  projects: [],
  certifications: [],
  achievements: [],
};

const BLANK_EXPERIENCE = {
  title: "", company: "", location: "", startDate: "", endDate: "",
  description: "", bullets: [],
};
const BLANK_EDUCATION = {
  degree: "", field: "", institution: "", location: "",
  startDate: "", endDate: "", gpa: "", honors: "",
};
const BLANK_PROJECT = { name: "", techStack: "", date: "", description: "", bullets: [] };
const BLANK_CERT = { name: "", issuer: "", date: "" };

/* ─────────────────────────────────────────────────────────────────────────────
   Template thumbnails (inline SVG previews)
───────────────────────────────────────────────────────────────────────────── */
const TEMPLATE_STYLES = {
  "classic-professional": { accent: "#1a1a1a", bg: "#fff", nameFont: "serif" },
  "modern-minimal":       { accent: "#3b5bdb", bg: "#fff", nameFont: "sans-serif" },
  "executive-professional": { accent: "#1a2744", bg: "#1a2744", nameFont: "serif", dark: true },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────────────────── */
export default function ResumeBuilder() {
  const { token, user } = useContext(AuthContext);

  // showPreview controls the preview panel (right side or overlay)
  const [showPreview, setShowPreview] = useState(false);
  // Active form section
  const [section, setSection] = useState("personal");

  // Resume data (the full form state)
  const [resume, setResume] = useState({
    ...BLANK_RESUME,
    fullName: user?.name || "",
    email: user?.email || "",
  });

  // Templates
  const [templates, setTemplates] = useState([]);

  // Preview HTML
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewing, setPreviewing] = useState(false);

  // PDF downloading
  const [downloading, setDownloading] = useState(false);

  // AI state per field
  const [aiLoading, setAiLoading] = useState({});
  const [aiMessage, setAiMessage] = useState("");

  const previewRef = useRef(null);

  // ── Load templates on mount ──────────────────────────────────────────────
  useEffect(() => {
    api.getResumeTemplates(token).then((data) => {
      if (data && data.length > 0) setTemplates(data);
      else setTemplates(FALLBACK_TEMPLATES);
    }).catch(() => setTemplates(FALLBACK_TEMPLATES));
  }, [token]);

  // ── Field updater ────────────────────────────────────────────────────────
  function setField(key, value) {
    setResume((prev) => ({ ...prev, [key]: value }));
  }

  // ── List item updater ────────────────────────────────────────────────────
  function updateListItem(listKey, index, field, value) {
    setResume((prev) => {
      const list = [...(prev[listKey] || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [listKey]: list };
    });
  }

  function addListItem(listKey, blank) {
    setResume((prev) => ({ ...prev, [listKey]: [...(prev[listKey] || []), { ...blank }] }));
  }

  function removeListItem(listKey, index) {
    setResume((prev) => {
      const list = [...(prev[listKey] || [])];
      list.splice(index, 1);
      return { ...prev, [listKey]: list };
    });
  }

  // ── Skills ───────────────────────────────────────────────────────────────
  const [skillInput, setSkillInput] = useState("");
  function addSkill(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const s = skillInput.trim().replace(/,$/, "");
      if (s && !resume.skills.includes(s)) {
        setField("skills", [...resume.skills, s]);
      }
      setSkillInput("");
    }
  }
  function removeSkill(idx) {
    setField("skills", resume.skills.filter((_, i) => i !== idx));
  }

  // ── Achievements ─────────────────────────────────────────────────────────
  const [achInput, setAchInput] = useState("");
  function addAchievement(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const s = achInput.trim();
      if (s) setField("achievements", [...resume.achievements, s]);
      setAchInput("");
    }
  }

  // ── Bullet helpers ────────────────────────────────────────────────────────
  function updateBullet(listKey, itemIndex, bulletIndex, value) {
    setResume((prev) => {
      const list = [...(prev[listKey] || [])];
      const bullets = [...(list[itemIndex].bullets || [])];
      bullets[bulletIndex] = value;
      list[itemIndex] = { ...list[itemIndex], bullets };
      return { ...prev, [listKey]: list };
    });
  }
  function addBullet(listKey, itemIndex) {
    setResume((prev) => {
      const list = [...(prev[listKey] || [])];
      const bullets = [...(list[itemIndex].bullets || []), ""];
      list[itemIndex] = { ...list[itemIndex], bullets };
      return { ...prev, [listKey]: list };
    });
  }
  function removeBullet(listKey, itemIndex, bulletIndex) {
    setResume((prev) => {
      const list = [...(prev[listKey] || [])];
      const bullets = [...(list[itemIndex].bullets || [])];
      bullets.splice(bulletIndex, 1);
      list[itemIndex] = { ...list[itemIndex], bullets };
      return { ...prev, [listKey]: list };
    });
  }

  // ── Preview ───────────────────────────────────────────────────────────────
  async function handlePreview() {
    setPreviewing(true);
    setShowPreview(true);
    try {
      const data = await api.previewResume(resume, token);
      setPreviewHtml(data.html || "");
    } catch {
      setPreviewHtml("<p style='padding:20px;color:red;'>Preview failed. Please check your data and try again.</p>");
    } finally {
      setPreviewing(false);
    }
  }

  // ── PDF Download ──────────────────────────────────────────────────────────
  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await api.downloadResumePdf(resume, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (resume.fullName || "Resume").replace(/\s+/g, "_") + "_Resume.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setAiMessage("PDF download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  // ── AI Assist ─────────────────────────────────────────────────────────────
  async function aiAssist(action, currentText = "", context = "") {
    const key = action;
    setAiLoading((prev) => ({ ...prev, [key]: true }));
    setAiMessage("");
    try {
      const res = await api.resumeAiAssist(
        { action, role: resume.headline || "Software Developer", currentText, context },
        token
      );
      if (res.success && res.result) {
        return res.result;
      }
      setAiMessage(res.message || "AI returned no result. Please try again.");
      return null;
    } catch (err) {
      setAiMessage("AI assist failed: " + err.message);
      return null;
    } finally {
      setAiLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function handleGenerateSummary() {
    const result = await aiAssist("generate_summary", "", `Name: ${resume.fullName}, Experience: ${resume.experience.map(e => e.title + " at " + e.company).join(", ")}`);
    if (result) setField("summary", result);
  }

  async function handleImproveSummary() {
    if (!resume.summary.trim()) { setAiMessage("Please write a summary first, then click Improve."); return; }
    const result = await aiAssist("improve_grammar", resume.summary);
    if (result) setField("summary", result);
  }

  async function handleSuggestSkills() {
    const result = await aiAssist("suggest_skills", "", resume.skills.join(", "));
    if (result) {
      const suggested = result.split(",").map(s => s.trim()).filter(s => s && !resume.skills.includes(s));
      setField("skills", [...resume.skills, ...suggested.slice(0, 12)]);
      setAiMessage(`✓ Added ${suggested.slice(0, 12).length} suggested skills. Review and remove any that don't apply to you.`);
    }
  }

  async function handleImproveExperience(index) {
    const exp = resume.experience[index];
    const text = exp.bullets?.length ? exp.bullets.join("\n") : exp.description;
    const result = await aiAssist("improve_bullets", text, `${exp.title} at ${exp.company}`);
    if (result) {
      const lines = result.split("\n").map(l => l.replace(/^[-•]\s*/, "").trim()).filter(Boolean);
      updateListItem("experience", index, "bullets", lines);
      setAiMessage("✓ Experience bullets improved. Review the changes above before saving.");
    }
  }

  async function handleImproveBullets(listKey, index) {
    const item = resume[listKey][index];
    const text = item.bullets?.length ? item.bullets.join("\n") : item.description;
    const result = await aiAssist("improve_bullets", text, item.name || item.title || "");
    if (result) {
      const lines = result.split("\n").map(l => l.replace(/^[-•]\s*/, "").trim()).filter(Boolean);
      updateListItem(listKey, index, "bullets", lines);
      setAiMessage("✓ Bullets improved. Review before saving.");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>AI Resume Builder</h2>
          <p style={{ fontSize: 13, color: "var(--text-subtle)", margin: 0 }}>
            Build, preview, and download a professional ATS-friendly resume with AI assistance
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setShowPreview(false)}
            style={{ fontWeight: !showPreview ? 700 : 400, borderColor: !showPreview ? "var(--primary)" : undefined }}>
            ✏️ Build
          </button>
          <button className="btn btn-outline" onClick={handlePreview} disabled={previewing}
            style={{ fontWeight: showPreview ? 700 : 400, borderColor: showPreview ? "var(--primary)" : undefined }}>
            {previewing ? "⏳ Loading…" : "👁️ Preview"}
          </button>
          <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
            {downloading ? "⏳ Generating…" : "⬇️ Download PDF"}
          </button>
        </div>
      </div>

      {/* AI message toast */}
      {aiMessage && (
        <div style={{
          padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: 13, fontWeight: 500,
          background: aiMessage.startsWith("✓") ? "var(--success-bg)" : "var(--error-bg)",
          color: aiMessage.startsWith("✓") ? "var(--success)" : "var(--error)",
          border: `1px solid ${aiMessage.startsWith("✓") ? "#6ee7b7" : "#fca5a5"}`,
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <span>{aiMessage}</span>
          <button onClick={() => setAiMessage("")} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>×</button>
        </div>
      )}

      {/* ── Main content: always show build form; preview as overlay modal ── */}
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
        {/* ── Side nav ── */}
        <div style={{
          width: 170, flexShrink: 0,
          background: "var(--surface)", borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)", padding: "8px 0", position: "sticky", top: 20
        }}>
          {SECTIONS.map((s) => (
            <button key={s.key} onClick={() => setSection(s.key)}
              style={{
                display: "block", width: "100%", textAlign: "left", padding: "9px 14px",
                background: section === s.key ? "var(--primary-soft)" : "none",
                color: section === s.key ? "var(--primary)" : "var(--text-main)",
                fontWeight: section === s.key ? 700 : 400,
                fontSize: 13, border: "none", cursor: "pointer",
                borderLeft: section === s.key ? "3px solid var(--primary)" : "3px solid transparent",
              }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* ── Form area ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {section === "template"  && <TemplateSelector templates={templates} resume={resume} setField={setField} />}
          {section === "personal"  && <PersonalSection resume={resume} setField={setField} />}
          {section === "summary"   && (
            <SummarySection resume={resume} setField={setField}
              onGenerate={handleGenerateSummary} onImprove={handleImproveSummary}
              aiLoading={aiLoading} />
          )}
          {section === "experience" && (
            <ExperienceSection resume={resume} addListItem={addListItem} removeListItem={removeListItem}
              updateListItem={updateListItem} addBullet={addBullet} removeBullet={removeBullet}
              updateBullet={updateBullet} onImprove={handleImproveExperience} aiLoading={aiLoading} />
          )}
          {section === "education" && (
            <EducationSection resume={resume} addListItem={addListItem} removeListItem={removeListItem}
              updateListItem={updateListItem} />
          )}
          {section === "skills"    && (
            <SkillsSection resume={resume} skillInput={skillInput} setSkillInput={setSkillInput}
              addSkill={addSkill} removeSkill={removeSkill} onSuggest={handleSuggestSkills}
              aiLoading={aiLoading} />
          )}
          {section === "projects"  && (
            <ProjectsSection resume={resume} addListItem={addListItem} removeListItem={removeListItem}
              updateListItem={updateListItem} addBullet={addBullet} removeBullet={removeBullet}
              updateBullet={updateBullet} onImprove={handleImproveBullets} aiLoading={aiLoading} />
          )}
          {section === "certs"     && (
            <CertsSection resume={resume} addListItem={addListItem} removeListItem={removeListItem}
              updateListItem={updateListItem} />
          )}
          {section === "achievements" && (
            <AchievementsSection resume={resume} setField={setField}
              achInput={achInput} setAchInput={setAchInput} addAchievement={addAchievement} />
          )}
        </div>
      </div>

      {/* ── Preview modal overlay ── */}
      {showPreview && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          padding: "20px 12px", overflowY: "auto",
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPreview(false); }}
        >
          <div style={{
            width: "min(860px, 100%)", background: "#fff",
            borderRadius: 10, overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.28)",
          }}>
            {/* Modal header bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 18px",
              background: "var(--surface)", borderBottom: "1px solid var(--border)",
              position: "sticky", top: 0, zIndex: 1,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>
                👁️ Preview — {resume.templateId.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-outline" style={{ fontSize: 12 }}
                  onClick={() => setShowPreview(false)}>
                  ← Back to Edit
                </button>
                <button className="btn btn-primary" style={{ fontSize: 12 }}
                  onClick={handleDownload} disabled={downloading}>
                  {downloading ? "⏳…" : "⬇️ Download PDF"}
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ background: "#f0f0f0", padding: "20px 24px" }}>
              {previewing ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#555" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
                  <p style={{ fontFamily: "sans-serif" }}>Generating preview…</p>
                </div>
              ) : previewHtml ? (
                <div ref={previewRef}
                  style={{
                    background: "#fff",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                    borderRadius: 4,
                    minHeight: 600,
                    overflow: "hidden",
                  }}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#555", fontFamily: "sans-serif" }}>
                  <p>No preview available. Try again.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section nav items
───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { key: "template",     label: "Template",     icon: "🎨" },
  { key: "personal",     label: "Personal Info", icon: "👤" },
  { key: "summary",      label: "Summary",       icon: "📝" },
  { key: "experience",   label: "Experience",    icon: "💼" },
  { key: "education",    label: "Education",     icon: "🎓" },
  { key: "skills",       label: "Skills",        icon: "⚡" },
  { key: "projects",     label: "Projects",      icon: "🚀" },
  { key: "certs",        label: "Certifications",icon: "🏅" },
  { key: "achievements", label: "Achievements",  icon: "🏆" },
];

const FALLBACK_TEMPLATES = [
  { id: "classic-professional", name: "Classic Professional",
    description: "Clean single-column ATS-friendly layout with timeless serif design.", previewStyle: "classic" },
  { id: "modern-minimal", name: "Modern Minimal",
    description: "Contemporary sans-serif design with accent colour highlights.", previewStyle: "modern" },
  { id: "executive-professional", name: "Executive Professional",
    description: "Corporate executive style with a dark header banner.", previewStyle: "executive" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────────────────────── */

function TemplateSelector({ templates, resume, setField }) {
  const list = templates.length > 0 ? templates : FALLBACK_TEMPLATES;
  return (
    <Card title="Choose Template" icon="🎨">
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {list.map((t) => {
          const style = TEMPLATE_STYLES[t.id] || TEMPLATE_STYLES["classic-professional"];
          const selected = resume.templateId === t.id;
          return (
            <div key={t.id} onClick={() => setField("templateId", t.id)}
              style={{
                flex: "1 1 180px", cursor: "pointer", border: `2px solid ${selected ? "var(--primary)" : "var(--border)"}`,
                borderRadius: "var(--radius-md)", overflow: "hidden",
                boxShadow: selected ? "0 0 0 3px var(--primary-soft)" : "none",
                transition: "all .15s",
              }}>
              {/* Mini preview thumbnail */}
              <div style={{
                height: 100, background: style.dark ? style.accent : "#f8f9fa",
                borderBottom: `3px solid ${style.accent}`, display: "flex", flexDirection: "column",
                justifyContent: "center", padding: 10, gap: 5
              }}>
                <div style={{ height: 10, borderRadius: 2, background: style.accent, width: "60%", opacity: 0.8 }} />
                <div style={{ height: 6, borderRadius: 2, background: style.accent, width: "40%", opacity: 0.5 }} />
                <div style={{ height: 4, borderRadius: 2, background: "#ccc", width: "90%", marginTop: 6 }} />
                <div style={{ height: 4, borderRadius: 2, background: "#ccc", width: "75%" }} />
                <div style={{ height: 4, borderRadius: 2, background: "#ccc", width: "80%" }} />
              </div>
              <div style={{ padding: "8px 10px" }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 3, lineHeight: 1.4 }}>{t.description}</div>
                {selected && <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600, marginTop: 6 }}>✓ Selected</div>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function PersonalSection({ resume, setField }) {
  return (
    <Card title="Personal Information" icon="👤">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Row>
          <Field label="Full Name *" value={resume.fullName} onChange={(v) => setField("fullName", v)} placeholder="Jane Smith" />
          <Field label="Professional Headline" value={resume.headline} onChange={(v) => setField("headline", v)} placeholder="Full Stack Developer | React & Spring Boot" />
        </Row>
        <Row>
          <Field label="Email *" value={resume.email} onChange={(v) => setField("email", v)} placeholder="jane@example.com" type="email" />
          <Field label="Phone" value={resume.phone} onChange={(v) => setField("phone", v)} placeholder="+1 (555) 000-0000" />
        </Row>
        <Row>
          <Field label="Location" value={resume.location} onChange={(v) => setField("location", v)} placeholder="Bengaluru, India" />
          <Field label="LinkedIn URL" value={resume.linkedIn} onChange={(v) => setField("linkedIn", v)} placeholder="linkedin.com/in/yourprofile" />
        </Row>
        <Field label="Portfolio / GitHub URL" value={resume.portfolio} onChange={(v) => setField("portfolio", v)} placeholder="github.com/yourusername" />
      </div>
    </Card>
  );
}

function SummarySection({ resume, setField, onGenerate, onImprove, aiLoading }) {
  return (
    <Card title="Professional Summary" icon="📝">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <AiButton label="✨ Generate with AI" onClick={onGenerate} loading={aiLoading["generate_summary"]} />
          <AiButton label="💡 Improve Grammar" onClick={onImprove} loading={aiLoading["improve_grammar"]} variant="outline" />
        </div>
        <p style={{ fontSize: 12, color: "var(--text-subtle)" }}>
          AI generates suggestions based on your name, headline, and experience. Always review before using.
        </p>
        <textarea
          className="input-field" rows={5}
          value={resume.summary}
          onChange={(e) => setField("summary", e.target.value)}
          placeholder="Results-driven software engineer with X years of experience building…"
          style={{ resize: "vertical" }}
        />
      </div>
    </Card>
  );
}

function ExperienceSection({ resume, addListItem, removeListItem, updateListItem, addBullet, removeBullet, updateBullet, onImprove, aiLoading }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>💼 Work Experience</h3>
        <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => addListItem("experience", { ...BLANK_EXPERIENCE })}>
          + Add Experience
        </button>
      </div>
      {resume.experience.length === 0 && (
        <EmptyState text="No experience added yet. Click 'Add Experience' to start." />
      )}
      {resume.experience.map((exp, i) => (
        <Card key={i} title={`Experience ${i + 1}: ${exp.title || "Untitled"}`} icon="💼">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Row>
              <Field label="Job Title *" value={exp.title} onChange={(v) => updateListItem("experience", i, "title", v)} placeholder="Software Engineer" />
              <Field label="Company *" value={exp.company} onChange={(v) => updateListItem("experience", i, "company", v)} placeholder="Acme Corp" />
            </Row>
            <Row>
              <Field label="Location" value={exp.location} onChange={(v) => updateListItem("experience", i, "location", v)} placeholder="Bengaluru, India" />
              <Field label="Start Date" value={exp.startDate} onChange={(v) => updateListItem("experience", i, "startDate", v)} placeholder="Jan 2022" />
              <Field label="End Date" value={exp.endDate} onChange={(v) => updateListItem("experience", i, "endDate", v)} placeholder="Present" />
            </Row>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Bullet Points</div>
              {(exp.bullets || []).map((b, bi) => (
                <div key={bi} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
                  <input className="input-field" value={b}
                    onChange={(e) => updateBullet("experience", i, bi, e.target.value)}
                    placeholder="Developed and maintained REST APIs serving 10k+ daily users"
                    style={{ flex: 1, fontSize: 13 }} />
                  <button onClick={() => removeBullet("experience", i, bi)}
                    style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", fontSize: 16 }}>×</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => addBullet("experience", i)}>
                  + Add Bullet
                </button>
                <AiButton label="✨ Improve with AI" onClick={() => onImprove(i)}
                  loading={aiLoading[`improve_bullets_exp_${i}`] || aiLoading["improve_bullets"]}
                  variant="outline" />
              </div>
            </div>
            {exp.bullets?.length === 0 && (
              <TextArea label="Description (or use bullets above)" value={exp.description}
                onChange={(v) => updateListItem("experience", i, "description", v)}
                placeholder="Describe your responsibilities and achievements…" />
            )}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-danger" style={{ fontSize: 12 }} onClick={() => removeListItem("experience", i)}>
                🗑 Remove
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function EducationSection({ resume, addListItem, removeListItem, updateListItem }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>🎓 Education</h3>
        <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => addListItem("education", { ...BLANK_EDUCATION })}>
          + Add Education
        </button>
      </div>
      {resume.education.length === 0 && <EmptyState text="No education added yet." />}
      {resume.education.map((edu, i) => (
        <Card key={i} title={`Education ${i + 1}: ${edu.degree || "Untitled"}`} icon="🎓">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Row>
              <Field label="Degree *" value={edu.degree} onChange={(v) => updateListItem("education", i, "degree", v)} placeholder="Bachelor of Technology" />
              <Field label="Field of Study" value={edu.field} onChange={(v) => updateListItem("education", i, "field", v)} placeholder="Computer Science" />
            </Row>
            <Row>
              <Field label="Institution *" value={edu.institution} onChange={(v) => updateListItem("education", i, "institution", v)} placeholder="CHARUSAT University" />
              <Field label="Location" value={edu.location} onChange={(v) => updateListItem("education", i, "location", v)} placeholder="Anand, Gujarat" />
            </Row>
            <Row>
              <Field label="Start Date" value={edu.startDate} onChange={(v) => updateListItem("education", i, "startDate", v)} placeholder="Aug 2020" />
              <Field label="End Date" value={edu.endDate} onChange={(v) => updateListItem("education", i, "endDate", v)} placeholder="May 2024" />
              <Field label="GPA / Percentage" value={edu.gpa} onChange={(v) => updateListItem("education", i, "gpa", v)} placeholder="8.5 / 10" />
            </Row>
            <Field label="Honors / Awards (optional)" value={edu.honors} onChange={(v) => updateListItem("education", i, "honors", v)} placeholder="Dean's List, Gold Medal…" />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-danger" style={{ fontSize: 12 }} onClick={() => removeListItem("education", i)}>🗑 Remove</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SkillsSection({ resume, skillInput, setSkillInput, addSkill, removeSkill, onSuggest, aiLoading }) {
  return (
    <Card title="Skills" icon="⚡">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <AiButton label="✨ Suggest Skills with AI" onClick={onSuggest} loading={aiLoading["suggest_skills"]} />
        </div>
        <p style={{ fontSize: 12, color: "var(--text-subtle)" }}>
          Type a skill and press Enter or comma to add. AI suggestions are based on your headline — review and remove any that don't apply.
        </p>
        <input
          className="input-field"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={addSkill}
          placeholder="e.g. React, Java, Spring Boot (press Enter)"
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {resume.skills.map((s, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "var(--primary-soft)", color: "var(--primary)",
              borderRadius: 20, padding: "4px 10px", fontSize: 13, fontWeight: 500
            }}>
              {s}
              <button onClick={() => removeSkill(i)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", fontWeight: 700, lineHeight: 1 }}>×</button>
            </span>
          ))}
          {resume.skills.length === 0 && <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>No skills added yet.</span>}
        </div>
      </div>
    </Card>
  );
}

function ProjectsSection({ resume, addListItem, removeListItem, updateListItem, addBullet, removeBullet, updateBullet, onImprove, aiLoading }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>🚀 Projects</h3>
        <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => addListItem("projects", { ...BLANK_PROJECT })}>
          + Add Project
        </button>
      </div>
      {resume.projects.length === 0 && <EmptyState text="No projects added yet." />}
      {resume.projects.map((proj, i) => (
        <Card key={i} title={`Project ${i + 1}: ${proj.name || "Untitled"}`} icon="🚀">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Row>
              <Field label="Project Name *" value={proj.name} onChange={(v) => updateListItem("projects", i, "name", v)} placeholder="JobNest Portal" />
              <Field label="Date / Period" value={proj.date} onChange={(v) => updateListItem("projects", i, "date", v)} placeholder="Jan 2024 – Present" />
            </Row>
            <Field label="Tech Stack" value={proj.techStack} onChange={(v) => updateListItem("projects", i, "techStack", v)}
              placeholder="React, Spring Boot, MySQL, AWS" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Bullet Points</div>
              {(proj.bullets || []).map((b, bi) => (
                <div key={bi} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
                  <input className="input-field" value={b}
                    onChange={(e) => updateBullet("projects", i, bi, e.target.value)}
                    placeholder="Built a feature that improved…"
                    style={{ flex: 1, fontSize: 13 }} />
                  <button onClick={() => removeBullet("projects", i, bi)}
                    style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", fontSize: 16 }}>×</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => addBullet("projects", i)}>
                  + Add Bullet
                </button>
                <AiButton label="✨ Improve with AI" onClick={() => onImprove("projects", i)}
                  loading={aiLoading["improve_bullets"]} variant="outline" />
              </div>
            </div>
            {proj.bullets?.length === 0 && (
              <TextArea label="Description" value={proj.description}
                onChange={(v) => updateListItem("projects", i, "description", v)}
                placeholder="Describe the project, your role, and the impact…" />
            )}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-danger" style={{ fontSize: 12 }} onClick={() => removeListItem("projects", i)}>🗑 Remove</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function CertsSection({ resume, addListItem, removeListItem, updateListItem }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>🏅 Certifications</h3>
        <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => addListItem("certifications", { ...BLANK_CERT })}>
          + Add Certification
        </button>
      </div>
      {resume.certifications.length === 0 && <EmptyState text="No certifications added yet." />}
      {resume.certifications.map((cert, i) => (
        <Card key={i} title={`Cert ${i + 1}: ${cert.name || "Untitled"}`} icon="🏅">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Field label="Certificate Name *" value={cert.name} onChange={(v) => updateListItem("certifications", i, "name", v)} placeholder="AWS Certified Developer" />
            <Row>
              <Field label="Issuing Organization" value={cert.issuer} onChange={(v) => updateListItem("certifications", i, "issuer", v)} placeholder="Amazon Web Services" />
              <Field label="Date" value={cert.date} onChange={(v) => updateListItem("certifications", i, "date", v)} placeholder="Dec 2023" />
            </Row>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-danger" style={{ fontSize: 12 }} onClick={() => removeListItem("certifications", i)}>🗑 Remove</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AchievementsSection({ resume, setField, achInput, setAchInput, addAchievement }) {
  return (
    <Card title="Achievements & Awards" icon="🏆">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: 12, color: "var(--text-subtle)" }}>
          Type an achievement and press Enter to add it.
        </p>
        <input
          className="input-field" value={achInput}
          onChange={(e) => setAchInput(e.target.value)}
          onKeyDown={addAchievement}
          placeholder="e.g. 1st Place, National Hackathon 2023 (press Enter)"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {resume.achievements.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--surface)", borderRadius: "var(--radius-sm)", fontSize: 13 }}>
              <span style={{ flex: 1 }}>🏆 {a}</span>
              <button onClick={() => setField("achievements", resume.achievements.filter((_, idx) => idx !== i))}
                style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", fontWeight: 700 }}>×</button>
            </div>
          ))}
          {resume.achievements.length === 0 && <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>No achievements added yet.</span>}
        </div>
      </div>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Shared micro-components
───────────────────────────────────────────────────────────────────────────── */

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="input-group" style={{ flex: 1 }}>
      <label style={{ fontSize: 12, fontWeight: 600 }}>{label}</label>
      <input className="input-field" type={type} value={value || ""} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} style={{ fontSize: 13 }} />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div className="input-group">
      <label style={{ fontSize: 12, fontWeight: 600 }}>{label}</label>
      <textarea className="input-field" rows={rows} value={value || ""} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} style={{ resize: "vertical", fontSize: 13 }} />
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{children}</div>;
}

function AiButton({ label, onClick, loading, variant = "primary" }) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={loading}
      style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
      {loading ? "⏳ AI working…" : label}
    </button>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{
      textAlign: "center", padding: "24px 16px", borderRadius: "var(--radius-md)",
      background: "var(--surface)", border: "1px dashed var(--border)", color: "var(--text-subtle)", fontSize: 13
    }}>
      {text}
    </div>
  );
}
