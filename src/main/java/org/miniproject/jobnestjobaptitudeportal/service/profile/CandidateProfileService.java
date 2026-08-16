package org.miniproject.jobnestjobaptitudeportal.service.profile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.miniproject.jobnestjobaptitudeportal.dto.request.ProfileUpdateRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.CandidateProfileResponse;
import org.miniproject.jobnestjobaptitudeportal.entity.CandidateProfile;
import org.miniproject.jobnestjobaptitudeportal.entity.User;
import org.miniproject.jobnestjobaptitudeportal.exception.ApiException;
import org.miniproject.jobnestjobaptitudeportal.repository.CandidateProfileRepository;
import org.miniproject.jobnestjobaptitudeportal.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CandidateProfileService {

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final long MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final String UPLOADS_DIR = "uploads";
    private static final String PROFILES_DIR = "profiles";
    private static final String RESUMES_DIR = "resumes";

    private final CandidateProfileRepository profileRepository;
    private final UserRepository userRepository;

    public CandidateProfileService(CandidateProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    public CandidateProfileResponse getProfile(Long userId) {
        User user = findUser(userId);
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile(userId);
                    return profileRepository.save(newProfile);
                });
        return CandidateProfileResponse.from(profile, user);
    }

    @Transactional
    public CandidateProfileResponse updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = findUser(userId);
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile(userId);
                    return profileRepository.save(newProfile);
                });

        if (request.headline() != null) {
            profile.setHeadline(request.headline().trim());
        }
        if (request.location() != null) {
            profile.setLocation(request.location().trim());
        }
        if (request.bio() != null) {
            profile.setBio(request.bio().trim());
        }
        if (request.techStack() != null) {
            String joined = String.join(",", request.techStack().stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList());
            profile.setTechStack(joined);
        }
        if (request.experienceLevel() != null) {
            String level = request.experienceLevel().trim().toUpperCase();
            if (!level.isEmpty() && !level.equals("ENTRY") && !level.equals("MID") && !level.equals("SENIOR")) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Experience level must be ENTRY, MID, or SENIOR");
            }
            profile.setExperienceLevel(level);
        }
        if (request.githubUrl() != null) {
            String url = request.githubUrl().trim();
            if (!url.isEmpty() && !url.startsWith("http://") && !url.startsWith("https://")) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "GitHub URL must start with http:// or https://");
            }
            profile.setGithubUrl(url);
        }
        if (request.linkedinUrl() != null) {
            String url = request.linkedinUrl().trim();
            if (!url.isEmpty() && !url.startsWith("http://") && !url.startsWith("https://")) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "LinkedIn URL must start with http:// or https://");
            }
            profile.setLinkedinUrl(url);
        }

        // Mark profile as completed if essential fields are filled
        boolean hasEssentials = profile.getHeadline() != null && !profile.getHeadline().isBlank()
                && profile.getTechStack() != null && !profile.getTechStack().isBlank()
                && profile.getExperienceLevel() != null && !profile.getExperienceLevel().isBlank();
        profile.setProfileCompleted(hasEssentials);

        CandidateProfile saved = profileRepository.save(profile);
        return CandidateProfileResponse.from(saved, user);
    }

    @Transactional
    public CandidateProfileResponse uploadProfileImage(Long userId, MultipartFile file) {
        User user = findUser(userId);
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile(userId);
                    return profileRepository.save(newProfile);
                });

        validateImageFile(file);

        String fileName = saveFile(file, PROFILES_DIR, userId);
        profile.setProfileImageUrl("/uploads/" + PROFILES_DIR + "/" + fileName);

        CandidateProfile saved = profileRepository.save(profile);
        return CandidateProfileResponse.from(saved, user);
    }

    @Transactional
    public CandidateProfileResponse uploadResume(Long userId, MultipartFile file) {
        User user = findUser(userId);
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile(userId);
                    return profileRepository.save(newProfile);
                });

        validateResumeFile(file);

        String fileName = saveFile(file, RESUMES_DIR, userId);
        profile.setResumeFileName(file.getOriginalFilename());

        CandidateProfile saved = profileRepository.save(profile);
        return CandidateProfileResponse.from(saved, user);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Image file is required");
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Image file size must be less than 5 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/"))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File must be an image (JPEG, PNG, GIF, or WebP)");
        }
    }

    private void validateResumeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Resume file is required");
        }
        if (file.getSize() > MAX_RESUME_SIZE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Resume file size must be less than 10 MB");
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.toLowerCase().endsWith(".pdf")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Resume must be a PDF file");
        }
    }

    private String saveFile(MultipartFile file, String subDir, Long userId) {
        try {
            Path uploadPath = Paths.get(UPLOADS_DIR, subDir);
            Files.createDirectories(uploadPath);

            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String fileName = "user_" + userId + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save file: " + e.getMessage());
        }
    }
}
