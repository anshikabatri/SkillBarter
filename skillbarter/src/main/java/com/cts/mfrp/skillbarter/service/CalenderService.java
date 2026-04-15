package com.cts.mfrp.skillbarter.service;

import com.cts.mfrp.skillbarter.model.Calender;
import com.cts.mfrp.skillbarter.model.User;
import com.cts.mfrp.skillbarter.repo.CalenderRepo;
import com.cts.mfrp.skillbarter.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CalenderService {

    private final CalenderRepo calenderRepo;
    private final UserRepo userRepo;

    public Calender createEvent(Calender event) {
        User user = userRepo.findById(event.getUser().getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        event.setUser(user);
        return calenderRepo.save(event);
    }

    @Transactional(readOnly = true)
    public Calender getEventById(Integer id) {
        return findOrThrow(id);
    }

    @Transactional(readOnly = true)
    public List<Calender> getEventsByUser(Integer userId) {
        return calenderRepo.findByUser_UserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Calender> getUpcomingEvents(Integer userId) {
        return calenderRepo.findUpcomingByUser(userId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<Calender> getEventsByUserAndDateRange(Integer userId,
                                                       LocalDateTime from,
                                                       LocalDateTime to) {
        return calenderRepo.findByUserAndDateRange(userId, from, to);
    }

    public Calender updateEvent(Integer id, Calender updated) {
        Calender event = findOrThrow(id);
        event.setEventDate(updated.getEventDate());
        event.setDescription(updated.getDescription());
        return calenderRepo.save(event);
    }

    public void deleteEvent(Integer id) {
        if (!calenderRepo.existsById(id))
            throw new RuntimeException("Calendar event not found: " + id);
        calenderRepo.deleteById(id);
    }

    private Calender findOrThrow(Integer id) {
        return calenderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Calendar event not found: " + id));
    }
}