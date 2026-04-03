package com.cts.repo;
import com.cts.model.UserSkill;
import com.cts.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface UserSkillRepo extends JpaRepository<UserSkill, Integer> {
    // Supports US_15: Get specific user's swap list
    List<UserSkill> findByUserId(Integer userId);
}
