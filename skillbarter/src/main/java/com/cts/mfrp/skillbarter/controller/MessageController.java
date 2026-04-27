package com.cts.mfrp.skillbarter.controller;

import com.cts.mfrp.skillbarter.model.Message;
import com.cts.mfrp.skillbarter.service.MessageService;
import com.cts.mfrp.skillbarter.util.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // POST /api/messages
    // Body: { "sessionId": 1, "senderId": 2, "content": "Hello!" }
    @PostMapping
    public ResponseEntity<ApiResponse<Message>> sendMessage(@RequestBody Map<String, Object> request) {
        Integer sessionId = request.get("sessionId") != null ? ((Number) request.get("sessionId")).intValue() : null;
        Integer senderId = request.get("senderId") != null ? ((Number) request.get("senderId")).intValue() : null;
        String content = request.get("content") != null ? String.valueOf(request.get("content")) : null;

        if (sessionId == null || senderId == null || content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("sessionId, senderId and non-empty content are required"));
        }

        Message message = messageService.sendMessage(sessionId, senderId, content);
        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", message));
    }

    // GET /api/messages/session/{sessionId}
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<List<Message>>> getMessagesBySession(@PathVariable Integer sessionId) {
        List<Message> messages = messageService.getMessagesBySession(sessionId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    // GET /api/messages/sender/{senderId}
    @GetMapping("/sender/{senderId}")
    public ResponseEntity<ApiResponse<List<Message>>> getMessagesBySender(@PathVariable Integer senderId) {
        List<Message> messages = messageService.getMessagesBySender(senderId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    // GET /api/messages/{messageId}
    @GetMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Message>> getMessageById(@PathVariable Integer messageId) {
        return messageService.getMessageById(messageId)
                .map(msg -> ResponseEntity.ok(ApiResponse.success(msg)))
                .orElse(ResponseEntity.ok(ApiResponse.error("Message not found")));
    }

    // DELETE /api/messages/{messageId}
    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable Integer messageId) {
        messageService.deleteMessage(messageId);
        return ResponseEntity.ok(ApiResponse.success("Message deleted successfully", null));
    }
}
