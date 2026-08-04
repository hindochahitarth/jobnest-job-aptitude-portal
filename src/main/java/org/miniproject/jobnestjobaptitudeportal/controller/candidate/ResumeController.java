package org.miniproject.jobnestjobaptitudeportal.controller.candidate;

import org.miniproject.jobnestjobaptitudeportal.dto.response.ParsedResumeResponse;
import org.miniproject.jobnestjobaptitudeportal.entity.User;
import org.miniproject.jobnestjobaptitudeportal.exception.ApiException;
import org.miniproject.jobnestjobaptitudeportal.repository.UserRepository;
import org.miniproject.jobnestjobaptitudeportal.security.JwtUtil;
import org.miniproject.jobnestjobaptitudeportal.service.resume.ResumeService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/candidate/resume")
public class ResumeController {

    private final ResumeService resumeService;
    private final UserRepository userRepository;

    public ResumeController(ResumeService resumeService, UserRepository userRepository) {
        this.resumeService = resumeService;
        this.userRepository = userRepository;
    }

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

        // Fallback default user ID if unauthenticated dev request
        return userRepository.findAll().stream().findFirst().map(User::getId).orElse(1L);
    }
}
