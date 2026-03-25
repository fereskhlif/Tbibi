package tn.esprit.pi.tbibi;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Serves files from the local "uploads/" directory at /uploads/** so
 * the frontend can load patient images without authentication.
 */
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadsDir = Paths.get("uploads").toAbsolutePath();
        String uploadsPath = uploadsDir.toUri().toString();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadsPath + "/");
    }
}
