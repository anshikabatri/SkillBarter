package com.cts.mfrp.skillbarter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.cts.mfrp.skillbarter", "com.cts.controller","com.cts.service",    // Add this for SkillService
        "com.cts.repo"}) // Add this line
@EnableJpaRepositories(basePackages = "com.cts.repo") // Add this
@EntityScan(basePackages = "com.cts.model")
public class SkillbarterApplication {

    public static void main(String[] args) {
        SpringApplication.run(SkillbarterApplication.class, args);
    }
}