package com.cts.mfrp.skillbarter.websocket;

import com.cts.mfrp.skillbarter.model.Message;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;

import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final Map<Integer, Set<WebSocketSession>> sessionsByRoom = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        removeSession(session);
        super.afterConnectionClosed(session, status);
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = mapper.readValue(message.getPayload(), Map.class);
            String type = (String) payload.get("type");
            if ("subscribe".equals(type)) {
                Integer sessionId = (payload.get("sessionId") instanceof Number) ? ((Number) payload.get("sessionId")).intValue() : null;
                if (sessionId != null) {
                    sessionsByRoom.computeIfAbsent(sessionId, k -> Collections.newSetFromMap(new ConcurrentHashMap<>())).add(session);
                    // attach attribute for cleanup
                    session.getAttributes().put("subscribedSessionId", sessionId);
                }
            } else if ("unsubscribe".equals(type)) {
                Integer sessionId = (payload.get("sessionId") instanceof Number) ? ((Number) payload.get("sessionId")).intValue() : null;
                if (sessionId != null) {
                    Set<WebSocketSession> set = sessionsByRoom.get(sessionId);
                    if (set != null) set.remove(session);
                    session.getAttributes().remove("subscribedSessionId");
                }
            }
        } catch (Exception ex) {
            // ignore malformed messages
        }
    }

    private void removeSession(WebSocketSession session) {
        Object sid = session.getAttributes().get("subscribedSessionId");
        if (sid instanceof Number) {
            Integer sessionId = ((Number) sid).intValue();
            Set<WebSocketSession> set = sessionsByRoom.get(sessionId);
            if (set != null) set.remove(session);
        } else {
            // remove from all rooms just in case
            sessionsByRoom.values().forEach(set -> set.remove(session));
        }
    }

    public void broadcastToSession(Integer sessionId, Message message) {
        try {
            Set<WebSocketSession> set = sessionsByRoom.get(sessionId);
            if (set == null || set.isEmpty()) return;
            String payload = mapper.writeValueAsString(Map.of("type", "message", "sessionId", sessionId, "message", message));
            TextMessage tm = new TextMessage(payload);
            for (WebSocketSession ws : set) {
                if (ws.isOpen()) {
                    try { ws.sendMessage(tm); } catch (Exception e) { /* ignore per-socket errors */ }
                }
            }
        } catch (Exception ignored) {}
    }
}
