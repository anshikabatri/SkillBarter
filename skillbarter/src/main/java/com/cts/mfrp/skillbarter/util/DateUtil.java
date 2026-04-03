package com.cts.mfrp.skillbarter.util;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class DateUtil {

    private static final String DEFAULT_FORMAT = "yyyy-MM-dd HH:mm:ss";

    // Format LocalDateTime to String
    public String formatDateTime(LocalDateTime dateTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DEFAULT_FORMAT);
        return dateTime.format(formatter);
    }

    // Check if a session date is in the future
    public boolean isFutureDate(LocalDateTime dateTime) {
        return dateTime.isAfter(LocalDateTime.now());
    }

    // Check if a session date is in the past
    public boolean isPastDate(LocalDateTime dateTime) {
        return dateTime.isBefore(LocalDateTime.now());
    }
}