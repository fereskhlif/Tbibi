package tn.esprit.pi.tbibi.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestTemplate;

/**
 * Provides shared HTTP client and JSON mapper beans.
 */
@Configuration
public class TerraConfig {

    /**
     * Primary RestTemplate used by TerraService, GemmaService, etc.
     */
    @Bean
    @Primary
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * Dedicated RestTemplate for the Python AI segmentation service.
     * Qualified as "segmentRestTemplate" to avoid ambiguity.
     */
    @Bean("segmentRestTemplate")
    public RestTemplate segmentRestTemplate() {
        return new RestTemplate();
    }

    /**
     * ObjectMapper configured to ignore unknown JSON fields.
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.findAndRegisterModules();
        return mapper;
    }
}

