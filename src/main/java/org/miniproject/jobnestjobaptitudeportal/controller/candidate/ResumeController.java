package org.miniproject.jobnestjobaptitudeportal.controller.candidate;

import org.miniproject.jobnestjobaptitudeportal.dto.request.ResumeAiRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.ResumeDataRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.ParsedResumeResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.ResumeAiResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.ResumeTemplateInfo;
import org.miniproject.jobnestjobaptitudeportal.entity.User;
import org.miniproject.jobnestjobaptitudeportal.exception.ApiException;
import org.miniproject.jobnestjobaptitudeportal.repository.UserRepository;
import org.miniproject.jobnestjobaptitudeportal.security.JwtUtil;
import org.miniproject.jobnestjobaptitudeportal.service.resume.GroqResumeService;
import org.miniproject.jobnestjobaptitudeportal.service.resume.ResumeService;
import org.miniproject.jobnestjobaptitudeportal.service.resume.ResumeTemplateService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidate/resume")
public class ResumeController {

    private final ResumeService resumeService;
    private final ResumeTemplateService templateService;
    private final GroqResumeService groqResumeService;
    private final UserRepository userRepository;

    public ResumeController(ResumeService resumeService,
                            ResumeTemplateService templateService,
                            GroqResumeService groqResumeService,
                            UserRepository userRepository) {
        this.resumeService = resumeService;
        this.templateService = templateService;
        this.groqResumeService = groqResumeService;
        this.userRepository = userRepository;
    }

    // -------------------------------------------------------------------------
    // Existing resume upload/parse endpoints
    // -------------------------------------------------------------------------

    @PostMapping("/upload")
    public ParsedResumeResponse uploadResume(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        Long userId = resolveUserId(authentication);
        return resumeService.uploadAndParseResume(userId, file);
    }

    @GetMapping("/latest")
    public ParsedResumeResponse getLatestResume(Authentication authentication) {
        Long userId = resolveUserId(authentication);
        return resumeService.getLatestResume(userId);
    }

    // -------------------------------------------------------------------------
    // Resume Builder — templates
    // -------------------------------------------------------------------------

    /**
     * GET /api/candidate/resume/templates
     * Returns metadata for all 3 available resume templates.
     */
    @GetMapping("/templates")
    public ResponseEntity<List<ResumeTemplateInfo>> getTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    // -------------------------------------------------------------------------
    // Resume Builder — preview
    // -------------------------------------------------------------------------

    /**
     * POST /api/candidate/resume/preview
     * Accepts resume data + templateId, returns a fully rendered HTML string.
     */
    @PostMapping("/preview")
    public ResponseEntity<Map<String, String>> previewResume(
            @RequestBody ResumeDataRequest data
    ) {
        String html = templateService.generatePreviewHtml(data);
        return ResponseEntity.ok(Map.of("html", html));
    }

    // -------------------------------------------------------------------------
    // Resume Builder — PDF download
    // -------------------------------------------------------------------------

    /**
     * POST /api/candidate/resume/download
     * Generates and returns a PDF of the resume.
     */
    @PostMapping("/download")
    public ResponseEntity<byte[]> downloadResume(
            @RequestBody ResumeDataRequest data
    ) {
        byte[] pdfBytes = templateService.generatePdf(data);

        String fileName = sanitizeFileName(data.fullName()) + "_Resume.pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment().filename(fileName).build()
        );
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // -------------------------------------------------------------------------
    // Resume Builder — AI assistance
    // -------------------------------------------------------------------------

    /**
     * POST /api/candidate/resume/ai-assist
     * Uses Groq AI to generate, improve, or suggest resume content.
     * Actions: generate_summary | improve_experience | suggest_skills | improve_bullets | improve_grammar
     */
    @PostMapping("/ai-assist")
    public ResponseEntity<ResumeAiResponse> aiAssist(
            @RequestBody ResumeAiRequest request
    ) {
        ResumeAiResponse response = groqResumeService.assist(request);
        return ResponseEntity.ok(response);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Long resolveUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof JwtUtil.JwtUser jwtUser) {
            return jwtUser.userId();
        }

        if (authentication != null && authentication.getName() != null) {
            String name = authentication.getName();
            return userRepository.findByEmail(name.trim())
                    .map(User::getId)
                    .orElseGet(() -> userRepository.findAll().stream().findFirst().map(User::getId).orElse(1L));
        }

        return userRepository.findAll().stream().findFirst().map(User::getId).orElse(1L);
    }

    private static String sanitizeFileName(String name) {
        if (name == null || name.isBlank()) return "Resume";
        return name.trim().replaceAll("[^a-zA-Z0-9_\\- ]", "").replaceAll("\\s+", "_");
    }
}
