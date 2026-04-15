package com.cts.mfrp.skillbarter.repo;
import com.cts.mfrp.skillbarter.model.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface UserSkillRepo extends JpaRepository<UserSkill, Integer> {
    // Supports US_15: Get specific user's swap list
    List<UserSkill> findByUserId(Integer userId);
}
