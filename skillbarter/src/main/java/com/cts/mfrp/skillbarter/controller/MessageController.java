package com.cts.mfrp.skillbarter.controller;

import com.cts.mfrp.skillbarter.model.Message;
import com.cts.mfrp.skillbarter.service.MessageService;
import com.cts.mfrp.skillbarter.util.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping
    public ResponseEntity<ApiResponse<Message>> sendMessage(@RequestBody Map<String, Object> request) {
        Integer sessionId = request.get("sessionId") != null ? ((Number) request.get("sessionId")).intValue() : null;
        Integer senderId = request.get("senderId") != null ? ((Number) request.get("senderId")).intValue() : null;
        String content = request.get("content") != null ? String.valueOf(request.get("content")) : null;

        if (sessionId == null || senderId == null || content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("sessionId, senderId and non-empty content are required"));
        }

        Message message = messageService.sendMessage(sessionId, senderId, content);
        messagingTemplate.convertAndSend("/topic/sessions/" + sessionId, message);
        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", message));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Message>> sendFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("sessionId") Integer sessionId,
            @RequestParam("senderId") Integer senderId) {

        try {
            // Create uploads directory if not exists
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) uploadDir.mkdirs();

            // Generate unique filename
            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String extension = originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            Files.write(filePath, file.getBytes());

            // Determine file type
            String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
            String fileType = contentType.startsWith("image/") ? "image" : "file";

            // File URL
            String fileUrl = "/uploads/" + filename;

            // Save message with file info
            String content = fileType.equals("image") ? "📷 Image" : "📎 " + originalFilename;
            Message message = messageService.sendMessageWithFile(sessionId, senderId, content, fileUrl, fileType);
            messagingTemplate.convertAndSend("/topic/sessions/" + sessionId, message);

            return ResponseEntity.ok(ApiResponse.success("File sent successfully", message));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to upload file: " + e.getMessage()));
        }
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<List<Message>>> getMessagesBySession(@PathVariable Integer sessionId) {
        List<Message> messages = messageService.getMessagesBySession(sessionId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @GetMapping("/sender/{senderId}")
    public ResponseEntity<ApiResponse<List<Message>>> getMessagesBySender(@PathVariable Integer senderId) {
        List<Message> messages = messageService.getMessagesBySender(senderId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @GetMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Message>> getMessageById(@PathVariable Integer messageId) {
        return messageService.getMessageById(messageId)
                .map(msg -> ResponseEntity.ok(ApiResponse.success(msg)))
                .orElse(ResponseEntity.ok(ApiResponse.error("Message not found")));
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable Integer messageId) {
        messageService.deleteMessage(messageId);
        return ResponseEntity.ok(ApiResponse.success("Message deleted successfully", null));
    }
}