package com.cts.repo;
import com.cts.model.Skill;
import com.cts.model.UserSkill;
import com.cts.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface CategoryRepo extends JpaRepository<Category, Integer> {
}
