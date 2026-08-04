package org.miniproject.jobnestjobaptitudeportal.service.resume;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.miniproject.jobnestjobaptitudeportal.dto.response.ParsedResumeResponse;
import org.miniproject.jobnestjobaptitudeportal.entity.Resume;
import org.miniproject.jobnestjobaptitudeportal.exception.ApiException;
import org.miniproject.jobnestjobaptitudeportal.repository.ResumeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ResumeService {
    private final ResumeRepository resumeRepository;
    private final ResumeStorageService storageService;
    private final ResumeParsingService parsingService;
    private final ObjectMapper objectMapper;

    public ResumeService(ResumeRepository resumeRepository,
                         ResumeStorageService storageService,
                         ResumeParsingService parsingService,
                         ObjectMapper objectMapper) {
        this.resumeRepository = resumeRepository;
        this.storageService = storageService;
        this.parsingService = parsingService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ParsedResumeResponse uploadAndParseResume(Long userId, MultipartFile file) {
        String storedPath = storageService.storeFile(file);

        Resume resume = new Resume(
                userId,
                storedPath,
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "Resume.pdf",
                "{}"
        );
        Resume savedResume = resumeRepository.save(resume);

        ParsedResumeResponse parsed = parsingService.parseResume(file, savedResume.getId(), storedPath);

        try {
            String json = objectMapper.writeValueAsString(parsed);
            savedResume.setParsedJson(json);
            resumeRepository.save(savedResume);
        } catch (Exception e) {
            // fallback
        }

        return parsed;
    }

    public ParsedResumeResponse getLatestResume(Long userId) {
        Resume resume = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No uploaded resume found for candidate"));

        try {
            return objectMapper.readValue(resume.getParsedJson(), ParsedResumeResponse.class);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to parse stored resume JSON");
        }
    }
}
