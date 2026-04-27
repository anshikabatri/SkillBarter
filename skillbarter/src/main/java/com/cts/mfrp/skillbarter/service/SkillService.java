package com.cts.mfrp.skillbarter.service;
import com.cts.mfrp.skillbarter.model.Skill;
import com.cts.mfrp.skillbarter.repo.SkillRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class SkillService {
    @Autowired
    private SkillRepo skillRepository;

    public List<Skill> searchSkills(String keyword) {
        List<Skill> results = skillRepository.findByNameContainingIgnoreCase(keyword);
        if (results.isEmpty()) {
            // Logic for US_12 would be handled by returning empty and Angular showing the message
        }
        return results;
    }

    public List<Skill> getSkillsByCategory(Integer categoryId) {
        return skillRepository.findByCategoryCategoryId(categoryId);
    }

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }
}