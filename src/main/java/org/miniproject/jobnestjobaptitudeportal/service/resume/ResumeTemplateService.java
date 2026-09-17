package org.miniproject.jobnestjobaptitudeportal.service.resume;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;

import java.awt.Color;
import org.miniproject.jobnestjobaptitudeportal.dto.request.ResumeDataRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.ResumeDataRequest.CertificationEntry;
import org.miniproject.jobnestjobaptitudeportal.dto.request.ResumeDataRequest.EducationEntry;
import org.miniproject.jobnestjobaptitudeportal.dto.request.ResumeDataRequest.ExperienceEntry;
import org.miniproject.jobnestjobaptitudeportal.dto.request.ResumeDataRequest.ProjectEntry;
import org.miniproject.jobnestjobaptitudeportal.dto.request.ResumeDataRequest.SkillCategory;
import org.miniproject.jobnestjobaptitudeportal.dto.response.ResumeTemplateInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Handles template listing, HTML preview generation, and PDF download.
 */
@Service
public class ResumeTemplateService {

    private static final Logger log = LoggerFactory.getLogger(ResumeTemplateService.class);

    private static final String TEMPLATE_BASE = "templates/resume/";

    // -------------------------------------------------------------------------
    // Template catalogue
    // -------------------------------------------------------------------------

    public List<ResumeTemplateInfo> getAllTemplates() {
        return List.of(
                new ResumeTemplateInfo(
                        "classic-professional",
                        "Classic Professional",
                        "Clean single-column ATS-friendly layout with a timeless serif design, ideal for traditional industries.",
                        "classic"
                ),
                new ResumeTemplateInfo(
                        "modern-minimal",
                        "Modern Minimal",
                        "Contemporary sans-serif design with accent colour highlights and an organised two-section layout.",
                        "modern"
                ),
                new ResumeTemplateInfo(
                        "executive-professional",
                        "Executive Professional",
                        "Corporate executive style with a dark header banner, suited for senior and leadership positions.",
                        "executive"
                )
        );
    }

    // -------------------------------------------------------------------------
    // HTML preview
    // -------------------------------------------------------------------------

    /**
     * Loads an HTML template and replaces all {{placeholders}} with live data.
     */
    public String generatePreviewHtml(ResumeDataRequest data) {
        String templateId = nvl(data.templateId(), "classic-professional");
        String html = loadTemplate(templateId);
        return substituteTemplate(html, data);
    }

    // -------------------------------------------------------------------------
    // PDF generation — template-aware
    // -------------------------------------------------------------------------

    /**
     * Generates a PDF using the selected template's visual identity.
     *
     * classic-professional : Times New Roman serif, black section titles with a thin rule
     * modern-minimal        : Helvetica, blue (#3b5bdb) accent section titles, left border rule
     * executive-professional: Helvetica, dark navy (#1a2744) header banner block, white name text
     */
    public byte[] generatePdf(ResumeDataRequest data) {
        String templateId = nvl(data.templateId(), "classic-professional");
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        // Theme colours
        Color accentColor = switch (templateId) {
            case "modern-minimal"       -> new Color(59, 91, 219);   // #3b5bdb blue
            case "executive-professional" -> new Color(26, 39, 68);  // #1a2744 navy
            default                     -> new Color(26, 26, 26);    // #1a1a1a near-black
        };

        // Base font family
        boolean isSerif = !templateId.equals("modern-minimal");
        String baseFamily  = isSerif ? FontFactory.TIMES      : FontFactory.HELVETICA;
        String boldFamily  = isSerif ? FontFactory.TIMES_BOLD : FontFactory.HELVETICA_BOLD;
        String oblFamily   = isSerif ? FontFactory.TIMES_ITALIC : FontFactory.HELVETICA_OBLIQUE;

        // Page margins (executive has a banner header so top margin is set to 0 initially)
        float leftMargin  = 54f;
        float rightMargin = 54f;
        float topMargin   = templateId.equals("executive-professional") ? 0f : 50f;
        float bottomMargin = 45f;

        Document doc = new Document(PageSize.LETTER, leftMargin, rightMargin, topMargin, bottomMargin);

        try {
            PdfWriter writer = PdfWriter.getInstance(doc, baos);
            doc.open();

            // ── Fonts ──
            Font nameFont      = FontFactory.getFont(boldFamily, isSerif ? 20f : 18f, accentColor);
            Font headlineFont  = FontFactory.getFont(oblFamily, 11f, accentColor);
            Font contactFont   = FontFactory.getFont(baseFamily, 9.5f, Color.DARK_GRAY);
            Font sectionFont   = FontFactory.getFont(boldFamily, 9.5f, accentColor);
            Font bodyFont      = FontFactory.getFont(baseFamily, 10f, Color.BLACK);
            Font smallFont     = FontFactory.getFont(baseFamily, 9f, Color.DARK_GRAY);
            Font boldBody      = FontFactory.getFont(boldFamily, 10f, Color.BLACK);
            Font techFont      = FontFactory.getFont(oblFamily, 9f, accentColor);

            // ─────────────────────────────────────────────────────────────
            // EXECUTIVE: dark banner header
            // ─────────────────────────────────────────────────────────────
            if (templateId.equals("executive-professional")) {
                // Draw a filled navy rectangle spanning full page width as a banner
                PdfContentByte canvas = writer.getDirectContentUnder();
                float pageWidth  = PageSize.LETTER.getWidth();
                float bannerH    = 90f;
                float bannerY    = PageSize.LETTER.getHeight() - bannerH;
                canvas.setColorFill(accentColor);
                canvas.rectangle(0, bannerY, pageWidth, bannerH);
                canvas.fill();

                // Name in white on the banner
                Font whiteName = FontFactory.getFont(boldFamily, 20f, Color.WHITE);
                Font whiteHeadline = FontFactory.getFont(oblFamily, 11f, new Color(168, 184, 216)); // #a8b8d8
                Font whiteContact  = FontFactory.getFont(baseFamily, 9f, new Color(197, 208, 232));

                // Add top spacing so text sits inside the banner (doc starts at top of page)
                addSpacing(doc, 18);
                addParagraph(doc, nvl(data.fullName(), ""), whiteName, Paragraph.ALIGN_CENTER, 0, 2);
                if (notBlank(data.headline())) {
                    addParagraph(doc, data.headline(), whiteHeadline, Paragraph.ALIGN_CENTER, 0, 4);
                }
                String contactLine = buildContactLine(data);
                if (!contactLine.isBlank()) {
                    addParagraph(doc, contactLine, whiteContact, Paragraph.ALIGN_CENTER, 0, 0);
                }
                addSpacing(doc, 14); // gap below banner before body content
            } else {
                // ── Classic / Modern header ──
                int nameAlign = Paragraph.ALIGN_CENTER;
                addParagraph(doc, nvl(data.fullName(), ""), nameFont, nameAlign, 0, 2);
                if (notBlank(data.headline())) {
                    addParagraph(doc, data.headline(), headlineFont, nameAlign, 0, 4);
                }
                String contactLine = buildContactLine(data);
                if (!contactLine.isBlank()) {
                    addParagraph(doc, contactLine, contactFont, nameAlign, 0, 10);
                }
            }

            // ─────────────────────────────────────────────────────────────
            // BODY SECTIONS — shared across all themes with themed fonts
            // ─────────────────────────────────────────────────────────────

            // Summary
            if (notBlank(data.summary())) {
                String label = templateId.equals("executive-professional")
                        ? "EXECUTIVE SUMMARY" : "PROFESSIONAL SUMMARY";
                addThemedSection(doc, label, sectionFont, accentColor, templateId);
                addParagraph(doc, data.summary(), bodyFont, Paragraph.ALIGN_JUSTIFIED, 0, 8);
            }

            // Experience
            if (notEmpty(data.experience())) {
                String label = templateId.equals("executive-professional")
                        ? "PROFESSIONAL EXPERIENCE" : "WORK EXPERIENCE";
                addThemedSection(doc, label, sectionFont, accentColor, templateId);
                for (ExperienceEntry exp : data.experience()) {
                    addEntryHeader(doc, nvl(exp.title(), ""), buildDateRange(exp.startDate(), exp.endDate()), boldBody, smallFont);
                    String sub = buildSubLine(exp.company(), exp.location());
                    if (!sub.isBlank()) addParagraph(doc, sub, smallFont, Paragraph.ALIGN_LEFT, 0, 2);
                    addBulletsOrDescription(doc, exp.bullets(), exp.description(), bodyFont);
                    addSpacing(doc, 5);
                }
            }

            // Education
            if (notEmpty(data.education())) {
                addThemedSection(doc, "EDUCATION", sectionFont, accentColor, templateId);
                for (EducationEntry edu : data.education()) {
                    String degreeTitle = nvl(edu.degree(), "") + (notBlank(edu.field()) ? " in " + edu.field() : "");
                    addEntryHeader(doc, degreeTitle, buildDateRange(edu.startDate(), edu.endDate()), boldBody, smallFont);
                    String sub = buildSubLine(edu.institution(), edu.location());
                    if (notBlank(edu.gpa())) sub += (sub.isBlank() ? "" : " | ") + "GPA: " + edu.gpa();
                    if (!sub.isBlank()) addParagraph(doc, sub, smallFont, Paragraph.ALIGN_LEFT, 0, 2);
                    if (notBlank(edu.honors())) addParagraph(doc, edu.honors(), smallFont, Paragraph.ALIGN_LEFT, 0, 2);
                    addSpacing(doc, 4);
                }
            }

            // Skills
            String skillsLabel = templateId.equals("executive-professional")
                    ? "CORE COMPETENCIES & SKILLS" : "SKILLS";
            if (notEmpty(data.skillCategories())) {
                addThemedSection(doc, skillsLabel, sectionFont, accentColor, templateId);
                for (SkillCategory cat : data.skillCategories()) {
                    Paragraph catPara = new Paragraph();
                    catPara.add(new Chunk(nvl(cat.category(), "") + ": ", boldBody));
                    String items = notBlank(cat.items()) ? cat.items()
                            : (notEmpty(cat.itemList()) ? String.join(", ", cat.itemList()) : "");
                    catPara.add(new Chunk(items, bodyFont));
                    catPara.setSpacingAfter(3);
                    doc.add(catPara);
                }
            } else if (notEmpty(data.skills())) {
                addThemedSection(doc, skillsLabel, sectionFont, accentColor, templateId);
                addParagraph(doc, String.join(", ", data.skills()), bodyFont, Paragraph.ALIGN_LEFT, 0, 8);
            }

            // Projects
            if (notEmpty(data.projects())) {
                String projLabel = templateId.equals("executive-professional") ? "KEY PROJECTS" : "PROJECTS";
                addThemedSection(doc, projLabel, sectionFont, accentColor, templateId);
                for (ProjectEntry proj : data.projects()) {
                    addEntryHeader(doc, nvl(proj.name(), ""), nvl(proj.date(), ""), boldBody, smallFont);
                    if (notBlank(proj.techStack())) addParagraph(doc, proj.techStack(), techFont, Paragraph.ALIGN_LEFT, 0, 2);
                    addBulletsOrDescription(doc, proj.bullets(), proj.description(), bodyFont);
                    addSpacing(doc, 5);
                }
            }

            // Certifications
            if (notEmpty(data.certifications())) {
                String certLabel = templateId.equals("executive-professional")
                        ? "CERTIFICATIONS & CREDENTIALS" : "CERTIFICATIONS";
                addThemedSection(doc, certLabel, sectionFont, accentColor, templateId);
                for (CertificationEntry cert : data.certifications()) {
                    String line = nvl(cert.name(), "");
                    if (notBlank(cert.issuer())) line += " — " + cert.issuer();
                    if (notBlank(cert.date())) line += "  (" + cert.date() + ")";
                    addParagraph(doc, line, bodyFont, Paragraph.ALIGN_LEFT, 0, 3);
                }
            }

            // Achievements
            if (notEmpty(data.achievements())) {
                String achLabel = templateId.equals("executive-professional")
                        ? "HONORS & ACHIEVEMENTS" : "ACHIEVEMENTS";
                addThemedSection(doc, achLabel, sectionFont, accentColor, templateId);
                for (String ach : data.achievements()) {
                    if (notBlank(ach)) addParagraph(doc, "• " + ach, bodyFont, Paragraph.ALIGN_LEFT, 10, 2);
                }
            }

        } catch (Exception ex) {
            log.error("PDF generation failed: {}", ex.getMessage());
            throw new RuntimeException("Failed to generate PDF: " + ex.getMessage(), ex);
        } finally {
            if (doc.isOpen()) doc.close();
        }

        return baos.toByteArray();
    }

    // -------------------------------------------------------------------------
    // Template loading & substitution
    // -------------------------------------------------------------------------

    private String loadTemplate(String templateId) {
        String fileName = TEMPLATE_BASE + templateId + ".html";
        try {
            ClassPathResource resource = new ClassPathResource(fileName);
            try (InputStream is = resource.getInputStream()) {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (IOException ex) {
            log.warn("Template not found: {} — using classic fallback", fileName);
            try {
                ClassPathResource fallback = new ClassPathResource(TEMPLATE_BASE + "classic-professional.html");
                try (InputStream is = fallback.getInputStream()) {
                    return new String(is.readAllBytes(), StandardCharsets.UTF_8);
                }
            } catch (IOException e) {
                return "<html><body><p>Template unavailable.</p></body></html>";
            }
        }
    }

    /**
     * Simple Mustache-style template substitution.
     * Handles {{field}}, {{#field}}...{{/field}} (truthy blocks), and {{^field}}...{{/field}} (falsy blocks).
     * Also handles {{#list}}...{{/list}} iteration with {{.}} for scalar lists.
     */
    private String substituteTemplate(String html, ResumeDataRequest d) {
        // Scalar fields
        html = replace(html, "fullName", nvl(d.fullName(), ""));
        html = replace(html, "email", nvl(d.email(), ""));
        html = replace(html, "phone", nvl(d.phone(), ""));
        html = replace(html, "location", nvl(d.location(), ""));
        html = replace(html, "linkedIn", nvl(d.linkedIn(), ""));
        html = replace(html, "portfolio", nvl(d.portfolio(), ""));
        html = replace(html, "headline", nvl(d.headline(), ""));
        html = replace(html, "summary", nl2br(nvl(d.summary(), "")));

        // Conditional blocks for optional scalars
        html = conditionalBlock(html, "phone", notBlank(d.phone()));
        html = conditionalBlock(html, "location", notBlank(d.location()));
        html = conditionalBlock(html, "linkedIn", notBlank(d.linkedIn()));
        html = conditionalBlock(html, "portfolio", notBlank(d.portfolio()));
        html = conditionalBlock(html, "headline", notBlank(d.headline()));
        html = conditionalBlock(html, "summary", notBlank(d.summary()));

        // hasXxx flags
        html = conditionalBlock(html, "hasExperience", notEmpty(d.experience()));
        html = conditionalBlock(html, "hasEducation", notEmpty(d.education()));
        html = conditionalBlock(html, "hasSkills", notEmpty(d.skills()) || notEmpty(d.skillCategories()));
        html = conditionalBlock(html, "hasProjects", notEmpty(d.projects()));
        html = conditionalBlock(html, "hasCertifications", notEmpty(d.certifications()));
        html = conditionalBlock(html, "hasAchievements", notEmpty(d.achievements()));

        // Flat skills
        html = replace(html, "skills", notEmpty(d.skills()) ? String.join(", ", d.skills()) : "");

        // Experience iteration
        html = iterateBlock(html, "experience", buildExperienceHtml(d.experience()));

        // Education iteration
        html = iterateBlock(html, "education", buildEducationHtml(d.education()));

        // Skill categories — handle conditional + iteration together:
        // If categories exist: render them and remove the {{^skillCategories}} fallback block.
        // If categories don't exist: remove the {{#skillCategories}} block and expose the fallback block.
        boolean hasSkillCats = notEmpty(d.skillCategories());
        if (hasSkillCats) {
            html = iterateBlock(html, "skillCategories", buildSkillCategoriesHtml(d.skillCategories()));
            html = removeBlock(html, "{{^skillCategories}}", "{{/skillCategories}}");
        } else {
            html = removeBlock(html, "{{#skillCategories}}", "{{/skillCategories}}");
            // remove the invert markers but keep the content
            html = html.replace("{{^skillCategories}}", "").replace("{{/skillCategories}}", "");
        }

        // Projects
        html = iterateBlock(html, "projects", buildProjectsHtml(d.projects()));

        // Certifications
        html = iterateBlock(html, "certifications", buildCertificationsHtml(d.certifications()));

        // Achievements (scalar list)
        html = iterateBlock(html, "achievements", buildAchievementsHtml(d.achievements()));

        // Skill list (individual tags)
        html = iterateBlock(html, "skillList", buildSkillListHtml(d.skills()));

        // Remove any remaining unresolved {{tags}}
        html = html.replaceAll("\\{\\{[^}]+\\}\\}", "");
        return html;
    }

    // -------------------------------------------------------------------------
    // Block renderers
    // -------------------------------------------------------------------------

    private String buildExperienceHtml(List<ExperienceEntry> list) {
        if (list == null || list.isEmpty()) return "";
        var sb = new StringBuilder();
        for (ExperienceEntry e : list) {
            sb.append("<div style=\"margin-bottom:10px;\">");
            sb.append("<div class=\"entry-header\"><span class=\"entry-title\">").append(esc(e.title())).append("</span>");
            sb.append("<span class=\"entry-date\">").append(esc(buildDateRange(e.startDate(), e.endDate()))).append("</span></div>");
            String sub = buildSubLine(e.company(), e.location());
            if (!sub.isBlank()) sb.append("<div class=\"entry-subtitle\">").append(esc(sub)).append("</div>");
            appendBulletsOrDesc(sb, e.bullets(), e.description());
            sb.append("</div>");
        }
        return sb.toString();
    }

    private String buildEducationHtml(List<EducationEntry> list) {
        if (list == null || list.isEmpty()) return "";
        var sb = new StringBuilder();
        for (EducationEntry e : list) {
            sb.append("<div style=\"margin-bottom:8px;\">");
            String degree = nvl(e.degree(), "") + (notBlank(e.field()) ? " in " + e.field() : "");
            sb.append("<div class=\"entry-header\"><span class=\"entry-title\">").append(esc(degree)).append("</span>");
            sb.append("<span class=\"entry-date\">").append(esc(buildDateRange(e.startDate(), e.endDate()))).append("</span></div>");
            String sub = buildSubLine(e.institution(), e.location());
            if (notBlank(e.gpa())) sub += (sub.isBlank() ? "" : ", ") + "GPA: " + e.gpa();
            if (!sub.isBlank()) sb.append("<div class=\"entry-subtitle\">").append(esc(sub)).append("</div>");
            if (notBlank(e.honors())) sb.append("<div style=\"font-size:10pt;font-style:italic;\">").append(esc(e.honors())).append("</div>");
            sb.append("</div>");
        }
        return sb.toString();
    }

    private String buildSkillCategoriesHtml(List<SkillCategory> list) {
        if (list == null || list.isEmpty()) return "";
        var sb = new StringBuilder();
        for (SkillCategory sc : list) {
            sb.append("<div class=\"skill-row\"><span class=\"skill-category\">").append(esc(nvl(sc.category(), ""))).append(": </span>");
            String items = notBlank(sc.items()) ? sc.items() : (notEmpty(sc.itemList()) ? String.join(", ", sc.itemList()) : "");
            sb.append("<span>").append(esc(items)).append("</span></div>");
        }
        return sb.toString();
    }

    private String buildProjectsHtml(List<ProjectEntry> list) {
        if (list == null || list.isEmpty()) return "";
        var sb = new StringBuilder();
        for (ProjectEntry p : list) {
            sb.append("<div style=\"margin-bottom:8px;\">");
            sb.append("<div class=\"entry-header\"><span class=\"entry-title\">").append(esc(nvl(p.name(), ""))).append("</span>");
            if (notBlank(p.date())) sb.append("<span class=\"entry-date\">").append(esc(p.date())).append("</span>");
            sb.append("</div>");
            if (notBlank(p.techStack())) sb.append("<div style=\"font-size:10pt;font-style:italic;\">").append(esc(p.techStack())).append("</div>");
            appendBulletsOrDesc(sb, p.bullets(), p.description());
            sb.append("</div>");
        }
        return sb.toString();
    }

    private String buildCertificationsHtml(List<CertificationEntry> list) {
        if (list == null || list.isEmpty()) return "";
        var sb = new StringBuilder();
        for (CertificationEntry c : list) {
            sb.append("<div class=\"cert-row\"><span><strong>").append(esc(nvl(c.name(), ""))).append("</strong>");
            if (notBlank(c.issuer())) sb.append(" — ").append(esc(c.issuer()));
            sb.append("</span>");
            if (notBlank(c.date())) sb.append("<span>").append(esc(c.date())).append("</span>");
            sb.append("</div>");
        }
        return sb.toString();
    }

    private String buildAchievementsHtml(List<String> list) {
        if (list == null || list.isEmpty()) return "";
        var sb = new StringBuilder();
        for (String a : list) {
            if (notBlank(a)) sb.append("<li>").append(esc(a)).append("</li>");
        }
        return sb.toString();
    }

    private String buildSkillListHtml(List<String> list) {
        if (list == null || list.isEmpty()) return "";
        var sb = new StringBuilder();
        for (String s : list) {
            if (notBlank(s)) sb.append("<span class=\"skill-tag\">").append(esc(s)).append("</span>");
        }
        return sb.toString();
    }

    private void appendBulletsOrDesc(StringBuilder sb, List<String> bullets, String description) {
        if (notEmpty(bullets)) {
            sb.append("<ul style=\"margin-top:4px;\">");
            for (String b : bullets) {
                if (notBlank(b)) sb.append("<li>").append(esc(b)).append("</li>");
            }
            sb.append("</ul>");
        } else if (notBlank(description)) {
            sb.append("<p style=\"margin-top:4px;font-size:10.5pt;\">").append(esc(description)).append("</p>");
        }
    }

    // -------------------------------------------------------------------------
    // Template string operations
    // -------------------------------------------------------------------------

    private static String replace(String html, String key, String value) {
        return html.replace("{{" + key + "}}", value);
    }

    /**
     * Handles {{#key}}...{{/key}} (show if true) and {{^key}}...{{/key}} (show if false).
     */
    private static String conditionalBlock(String html, String key, boolean show) {
        String startTag = "{{#" + key + "}}";
        String endTag = "{{/" + key + "}}";
        String invertStartTag = "{{^" + key + "}}";
        String invertEndTag = "{{/" + key + "}}";

        if (show) {
            // Keep content of {{#key}}...{{/key}}, remove markers
            html = html.replace(startTag, "").replace(endTag, "");
            // Remove content of {{^key}}...{{/key}}
            html = removeBlock(html, invertStartTag, "{{/" + key + "}}");
        } else {
            // Remove content of {{#key}}...{{/key}}
            html = removeBlock(html, startTag, endTag);
            // Keep content of {{^key}}...{{/key}}, remove markers
            html = html.replace(invertStartTag, "").replace(invertEndTag, "");
        }
        return html;
    }

    private static String removeBlock(String html, String startTag, String endTag) {
        int start = html.indexOf(startTag);
        while (start >= 0) {
            int end = html.indexOf(endTag, start);
            if (end < 0) break;
            html = html.substring(0, start) + html.substring(end + endTag.length());
            start = html.indexOf(startTag);
        }
        return html;
    }

    /**
     * Replaces {{#key}}...{{/key}} block with pre-rendered HTML content.
     */
    private static String iterateBlock(String html, String key, String renderedContent) {
        String startTag = "{{#" + key + "}}";
        String endTag = "{{/" + key + "}}";
        int start = html.indexOf(startTag);
        if (start < 0) return html;
        int end = html.indexOf(endTag, start);
        if (end < 0) return html;
        return html.substring(0, start) + renderedContent + html.substring(end + endTag.length());
    }

    // -------------------------------------------------------------------------
    // PDF helpers
    // -------------------------------------------------------------------------

    /**
     * Draws a section title with a styled rule per template using LineSeparator.
     * classic-professional: thin black rule above the title
     * modern-minimal:       title then thin accent-coloured rule below
     * executive-professional: title then thick navy rule below
     */
    private void addThemedSection(Document doc, String title, Font font,
                                  Color accentColor, String templateId) throws Exception {
        switch (templateId) {
            case "modern-minimal" -> {
                Paragraph p = new Paragraph(title, font);
                p.setSpacingBefore(10);
                p.setSpacingAfter(2);
                doc.add(p);
                LineSeparator line = new LineSeparator(0.8f, 100f, accentColor,
                        com.lowagie.text.Element.ALIGN_LEFT, -2f);
                doc.add(new Chunk(line));
                addSpacing(doc, 4);
            }
            case "executive-professional" -> {
                Paragraph p = new Paragraph(title, font);
                p.setSpacingBefore(10);
                p.setSpacingAfter(2);
                doc.add(p);
                LineSeparator line = new LineSeparator(1.5f, 100f, accentColor,
                        com.lowagie.text.Element.ALIGN_LEFT, -2f);
                doc.add(new Chunk(line));
                addSpacing(doc, 4);
            }
            default -> {
                // classic: thin black rule above title
                LineSeparator line = new LineSeparator(0.8f, 100f, Color.BLACK,
                        com.lowagie.text.Element.ALIGN_LEFT, 0f);
                Paragraph rulePara = new Paragraph();
                rulePara.setSpacingBefore(8);
                rulePara.add(new Chunk(line));
                doc.add(rulePara);
                Paragraph p = new Paragraph(title, font);
                p.setSpacingBefore(3);
                p.setSpacingAfter(4);
                doc.add(p);
            }
        }
    }

    private void addEntryHeader(Document doc, String title, String date, Font titleFont, Font dateFont) throws Exception {
        Paragraph p = new Paragraph();
        p.add(new Chunk(title, titleFont));
        if (notBlank(date)) {
            p.add(new Chunk("  " + date, dateFont));
        }
        p.setSpacingBefore(2);
        doc.add(p);
    }

    private void addParagraph(Document doc, String text, Font font, int align, float indentLeft, float spacingAfter) throws Exception {
        Paragraph p = new Paragraph(text, font);
        p.setAlignment(align);
        p.setIndentationLeft(indentLeft);
        p.setSpacingAfter(spacingAfter);
        doc.add(p);
    }

    private void addBulletsOrDescription(Document doc, List<String> bullets, String description, Font font) throws Exception {
        if (notEmpty(bullets)) {
            for (String bullet : bullets) {
                if (notBlank(bullet)) {
                    String b = bullet.trim().startsWith("-") ? bullet.trim().substring(1).trim() : bullet.trim();
                    addParagraph(doc, "• " + b, font, Paragraph.ALIGN_LEFT, 12, 2);
                }
            }
        } else if (notBlank(description)) {
            addParagraph(doc, description, font, Paragraph.ALIGN_JUSTIFIED, 0, 4);
        }
    }

    private void addSpacing(Document doc, float points) throws Exception {
        Paragraph p = new Paragraph(" ");
        p.setSpacingAfter(points);
        doc.add(p);
    }

    // -------------------------------------------------------------------------
    // Utility helpers
    // -------------------------------------------------------------------------

    private static String buildContactLine(ResumeDataRequest d) {
        var parts = new java.util.ArrayList<String>();
        if (notBlank(d.email())) parts.add(d.email());
        if (notBlank(d.phone())) parts.add(d.phone());
        if (notBlank(d.location())) parts.add(d.location());
        if (notBlank(d.linkedIn())) parts.add("LinkedIn: " + d.linkedIn());
        if (notBlank(d.portfolio())) parts.add("Portfolio: " + d.portfolio());
        return String.join("  |  ", parts);
    }

    private static String buildDateRange(String start, String end) {
        if (notBlank(start) && notBlank(end)) return start + " – " + end;
        if (notBlank(start)) return start + " – Present";
        if (notBlank(end)) return end;
        return "";
    }

    private static String buildSubLine(String company, String location) {
        if (notBlank(company) && notBlank(location)) return company + ", " + location;
        if (notBlank(company)) return company;
        if (notBlank(location)) return location;
        return "";
    }

    private static String nvl(String value, String fallback) {
        return (value != null && !value.isBlank()) ? value : fallback;
    }

    private static boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }

    private static <T> boolean notEmpty(List<T> list) {
        return list != null && !list.isEmpty();
    }

    /** HTML-escapes user content for safe template injection. */
    private static String esc(String value) {
        if (value == null) return "";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    private static String nl2br(String value) {
        if (value == null) return "";
        return value.replace("\n", "<br/>");
    }
}
