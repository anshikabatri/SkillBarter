package com.cts.service;
import com.cts.model.*;
import com.cts.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class UserSkillService {
    @Autowired
    private UserSkillRepo userSkillRepo;

    public UserSkill saveUserSkill(UserSkill userSkill) {
        return userSkillRepo.save(userSkill);
    }

    public List<UserSkill> getUserProfileSkills(Integer userId) {
        return userSkillRepo.findByUserId(userId);
    }
}