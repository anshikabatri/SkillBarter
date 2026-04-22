package com.cts.mfrp.skillbarter.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String frontendUrl = System.getenv("FRONTEND_URL");
        
        registry.addMapping("/api/**")
            .allowedOriginPatterns(
                "http://localhost:4200",
                "http://localhost:3000",
                "https://localhost:4200",
                "https://*.vercel.app",
                frontendUrl != null && !frontendUrl.isBlank() ? frontendUrl : "http://localhost:4200"
            )
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "X-Total-Count")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath.toUri().toString());
    }
}