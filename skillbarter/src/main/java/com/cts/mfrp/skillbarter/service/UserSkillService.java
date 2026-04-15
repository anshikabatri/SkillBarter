package com.cts.mfrp.skillbarter.service;
import com.cts.mfrp.skillbarter.model.UserSkill;
import com.cts.mfrp.skillbarter.repo.UserSkillRepo;
import com.cts.mfrp.skillbarter.model.*;
import com.cts.mfrp.skillbarter.repo.*;
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