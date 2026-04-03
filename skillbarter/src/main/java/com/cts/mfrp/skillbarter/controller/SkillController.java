package com.cts.controller;
import com.cts.model.*;
import com.cts.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class SkillController {

    @Autowired
    private SkillService skillService;

    @Autowired
    private UserSkillService userSkillService;

    // US_08 & US_12: Search skills
    @GetMapping("/skills/search")
    public ResponseEntity<List<Skill>> search(@RequestParam String query) {
        return ResponseEntity.ok(skillService.searchSkills(query));
    }

    // US_10: Filter by Category
    @GetMapping("/skills/category/{id}")
    public ResponseEntity<List<Skill>> filterByCategory(@PathVariable Integer id) {
        return ResponseEntity.ok(skillService.getSkillsByCategory(id));
    }

    // US_07 & US_15: Register User Skills
    @PostMapping("/user-skills")
    public ResponseEntity<UserSkill> addSkillToUser(@RequestBody UserSkill userSkill) {
        return ResponseEntity.ok(userSkillService.saveUserSkill(userSkill));
    }

    // US_15: View Skills Offered/Wanted for a specific profile
    @GetMapping("/user-skills/{userId}")
    public ResponseEntity<List<UserSkill>> getUserSkills(@PathVariable Integer userId) {
        return ResponseEntity.ok(userSkillService.getUserProfileSkills(userId));
    }
}