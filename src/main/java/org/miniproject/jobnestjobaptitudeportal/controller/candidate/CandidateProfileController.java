package org.miniproject.jobnestjobaptitudeportal.controller.candidate;

import org.miniproject.jobnestjobaptitudeportal.dto.request.ProfileUpdateRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.CandidateProfileResponse;
import org.miniproject.jobnestjobaptitudeportal.entity.User;
import org.miniproject.jobnestjobaptitudeportal.exception.ApiException;
import org.miniproject.jobnestjobaptitudeportal.repository.UserRepository;
import org.miniproject.jobnestjobaptitudeportal.security.JwtUtil;
import org.miniproject.jobnestjobaptitudeportal.service.profile.CandidateProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/candidate/profile")
public class CandidateProfileController {

    private final CandidateProfileService profileService;
    private final UserRepository userRepository;

    public CandidateProfileController(CandidateProfileService profileService, UserRepository userRepository) {
        this.profileService = profileService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public CandidateProfileResponse getProfile(Authentication authentication) {
        Long userId = resolveUserId(authentication);
        return profileService.getProfile(userId);
    }

    @PutMapping
    public CandidateProfileResponse updateProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request
    ) {
        Long userId = resolveUserId(authentication);
        return profileService.updateProfile(userId, request);
    }

    @PostMapping("/image")
    public CandidateProfileResponse uploadProfileImage(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        Long userId = resolveUserId(authentication);
        return profileService.uploadProfileImage(userId, file);
    }

    @PostMapping("/resume")
    public CandidateProfileResponse uploadResume(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        Long userId = resolveUserId(authentication);
        return profileService.uploadResume(userId, file);
    }

    private Long resolveUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof JwtUtil.JwtUser jwtUser) {
            return jwtUser.userId();
        }

        if (authentication != null && authentication.getName() != null) {
            String name = authentication.getName();
            return userRepository.findByEmail(name.trim())
                    .map(User::getId)
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        }

        throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
    }
}
