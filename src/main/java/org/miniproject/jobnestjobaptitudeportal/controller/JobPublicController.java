package org.miniproject.jobnestjobaptitudeportal.controller;

import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.dto.response.JobResponse;
import org.miniproject.jobnestjobaptitudeportal.service.job.JobService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jobs")
public class JobPublicController {

    private final JobService jobService;

    public JobPublicController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public List<JobResponse> getPublicJobs(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "location", required = false) String location
    ) {
        return jobService.getAllJobs(search, location, null);
    }

    @GetMapping("/{id}")
    public JobResponse getJobById(@PathVariable Long id) {
        return jobService.getJobById(id, null);
    }
}
