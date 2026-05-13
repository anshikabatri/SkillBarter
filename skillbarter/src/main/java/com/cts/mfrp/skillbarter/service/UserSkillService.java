package com.cts.mfrp.skillbarter.service;
import com.cts.mfrp.skillbarter.model.UserSkill;
import com.cts.mfrp.skillbarter.repo.UserSkillRepo;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
@Service
public class UserSkillService {
    @Autowired
    private UserSkillRepo userSkillRepo;

    public UserSkill saveUserSkill(UserSkill userSkill) {
        if (userSkill == null || userSkill.getUserId() == null || userSkill.getSkill() == null || userSkill.getSkill().getSkillId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId and skill.skillId are required");
        }

        List<UserSkill> existingSkills = userSkillRepo.findByUserIdAndSkill_SkillId(userSkill.getUserId(), userSkill.getSkill().getSkillId());
        if (!existingSkills.isEmpty()) {
            UserSkill existing = existingSkills.get(0);
            boolean teach = Boolean.TRUE.equals(userSkill.getIsTeach());
            boolean learn = Boolean.TRUE.equals(userSkill.getIsLearn());

            for (UserSkill current : existingSkills) {
                teach = teach || Boolean.TRUE.equals(current.getIsTeach());
                learn = learn || Boolean.TRUE.equals(current.getIsLearn());
            }

            boolean changed = !Boolean.valueOf(teach).equals(existing.getIsTeach()) || !Boolean.valueOf(learn).equals(existing.getIsLearn());
            existing.setIsTeach(teach);
            existing.setIsLearn(learn);

            if (existingSkills.size() > 1) {
                userSkillRepo.deleteAll(new ArrayList<>(existingSkills.subList(1, existingSkills.size())));
                changed = true;
            }

            return changed ? userSkillRepo.save(existing) : existing;
        }

        return userSkillRepo.save(userSkill);
    }

    public List<UserSkill> getUserProfileSkills(Integer userId) {
        return userSkillRepo.findByUserId(userId);
    }
    public void deleteUserSkill(Integer userSkillId) {
        userSkillRepo.deleteById(userSkillId);
    }
}