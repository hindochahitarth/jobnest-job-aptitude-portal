package org.miniproject.jobnestjobaptitudeportal.service.resume;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.miniproject.jobnestjobaptitudeportal.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service class responsible for storing uploaded resume files.
 */
@Service
public class ResumeStorageService {

    // Directory where uploaded resume files will be stored.
    // The path is converted to an absolute and normalized path.
    private final Path uploadDir =
            Paths.get("uploads/resumes").toAbsolutePath().normalize();

    /**
     * Constructor creates the resume upload directory
     * if it does not already exist.
     */
    public ResumeStorageService() {
        try {
            // Creates the directory along with any missing parent directories.
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            // If the directory cannot be created, stop application initialization.
            throw new RuntimeException(
                    "Could not initialize resume upload directory", e);
        }
    }

    /**
     * Stores the uploaded resume file in the upload directory.
     *
     * @param file resume file uploaded by the user
     * @return complete path of the stored file
     */
    public String storeFile(MultipartFile file) {

        // Check whether the file is missing or empty.
        if (file == null || file.isEmpty()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "File is empty or missing"
            );
        }

        // Get the original name of the uploaded file.
        String originalFilename = file.getOriginalFilename();

        // Variable to store the file extension, such as .pdf or .docx.
        String fileExtension = "";

        // Extract the file extension from the original filename.
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension =
                    originalFilename.substring(
                            originalFilename.lastIndexOf(".")
                    );
        }

        // Generate a unique filename using UUID.
        // This prevents filename conflicts between different users/files.
        String storedFilename = UUID.randomUUID() + fileExtension;

        // Create the complete target path for the uploaded file.
        Path targetPath = this.uploadDir.resolve(storedFilename);

        try {
            // Copy the uploaded file to the target location.
            // REPLACE_EXISTING replaces the file if a file with the same
            // generated name already exists.
            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // Return the path where the file has been stored.
            return targetPath.toString();

        } catch (IOException e) {
            // Handle errors that occur while saving the file.
            throw new ApiException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to store resume file"
            );
        }
    }
}