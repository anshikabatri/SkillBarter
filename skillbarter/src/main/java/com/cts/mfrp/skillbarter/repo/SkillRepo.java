package com.cts.mfrp.skillbarter.repo;
import com.cts.mfrp.skillbarter.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface SkillRepo extends JpaRepository<Skill, Integer> {
    // Supports US_08: Search by keyword
    List<Skill> findByNameContainingIgnoreCase(String keyword);

    // Supports US_10: Filter by Category
    List<Skill> findByCategoryCategoryId(Integer categoryId);
}