package com.cts.mfrp.skillbarter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@ComponentScan(basePackages = {
        "com.cts.mfrp.skillbarter",
        "com.cts.mfrp.skillbarter.controller",
        "com.cts.mfrp.skillbarter.service",
        "com.cts.mfrp.skillbarter.repo",
        "com.cts.mfrp.skillbarter.util"          // ← THIS was missing — BeansConfig & SecurityConfig live here
})
@EnableJpaRepositories(basePackages = "com.cts.mfrp.skillbarter.repo")
@EntityScan(basePackages = "com.cts.mfrp.skillbarter.model")
public class SkillbarterApplication {

    public static void main(String[] args) {
        SpringApplication.run(SkillbarterApplication.class, args);
        System.out.println("App running successfully on port 8082");
    }
}