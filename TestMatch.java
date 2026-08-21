import java.util.*;

public class TestMatch {
    public static void main(String[] args) {
        List<String> candidateSkills = Arrays.asList("java", "react", "frontend", "backend", "spring", "springboot", "mysql");
        String jobSkills = "Java, React, SQL";
        
        List<String> requiredSkills = Arrays.stream(jobSkills.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String req : requiredSkills) {
            if (isSkillMatched(req, candidateSkills)) {
                matched.add(req);
            } else {
                missing.add(req);
            }
        }
        
        System.out.println("Matched: " + matched);
        System.out.println("Missing: " + missing);
    }
    
    private static boolean isSkillMatched(String requiredSkill, List<String> candidateSkills) {
        String reqNorm = normalizeSkill(requiredSkill);
        for (String candidateSkill : candidateSkills) {
            String candNorm = normalizeSkill(candidateSkill);
            if (reqNorm.equals(candNorm) || reqNorm.contains(candNorm) || candNorm.contains(reqNorm)) {
                return true;
            }
        }
        return false;
    }

    private static String normalizeSkill(String skill) {
        return skill.toLowerCase(Locale.ROOT)
                .replaceAll("\\.js$", "")
                .replaceAll("[^a-z0-9+#]", "")
                .trim();
    }
}
