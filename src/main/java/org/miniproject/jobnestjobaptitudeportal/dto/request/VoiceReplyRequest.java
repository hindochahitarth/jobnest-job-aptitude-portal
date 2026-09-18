package org.miniproject.jobnestjobaptitudeportal.dto.request;

/**
 * Request body for the conversational AI spoken-feedback endpoint.
 * The backend receives the question + spoken transcript and returns
 * a short spoken reply PLUS the full structured evaluation.
 */
public record VoiceReplyRequest(
        Long sessionId,
        int questionIndex,
        String questionText,
        String spokenTranscript,
        int elapsedSeconds
) {
}
