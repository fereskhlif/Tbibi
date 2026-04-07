package tn.esprit.pi.tbibi.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Provides shared HTTP client and JSON mapper beans for Terra API integration.
 */
@Configuration
public class TerraConfig {

    /**
     * RestTemplate used by TerraService to call the Terra REST API.
     * A shared singleton is sufficient for our polling frequency.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * ObjectMapper configured to ignore unknown JSON fields —  
     * Terra may add new fields to their payloads at any time.
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.findAndRegisterModules();
        return mapper;
    }
}
