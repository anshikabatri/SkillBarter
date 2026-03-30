package com.cts.controller;

import com.cts.model.Message;
import com.cts.service.MessageService;
import com.cts.util.ApiResponse;
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
        Integer sessionId = (Integer) request.get("sessionId");
        Integer senderId = (Integer) request.get("senderId");
        String content = (String) request.get("content");
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
