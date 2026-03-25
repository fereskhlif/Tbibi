package tn.esprit.pi.tbibi.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import tn.esprit.pi.tbibi.security.jwt.JwtAuthFilter;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public DaoAuthenticationProvider authProvider() {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider();
        p.setUserDetailsService(userDetailsService);
        p.setPasswordEncoder(passwordEncoder);
        return p;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authProvider())
                .authorizeHttpRequests(auth -> auth
                        // Permettre le forward vers /error par Spring MVC
                        .dispatcherTypeMatchers(jakarta.servlet.DispatcherType.FORWARD, jakarta.servlet.DispatcherType.ERROR).permitAll()

                        // Public routes - no authentication needed
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // Serve uploaded images publicly
                        .requestMatchers("/uploads/**").permitAll()

                        // Allow doctor to append history and search patients without blocking on JwtAuthFilter missing auth
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/medical-records/*/history").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/medical-records/patients/search").permitAll()

                        // Patient self-service: view, upload, update, delete image
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/medical-records/my").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/medical-records/my/upload-image").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/medical-records/my").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/medical-records/my/image").authenticated()

                        .requestMatchers("/medical-records/**").permitAll()
                        //.requestMatchers("/prescriptions/**").authenticated()
                        .requestMatchers("/prescriptions/**").permitAll()
                        // TEMPORAIRE: On permet l'accès libre aux actes pour voir la VRAIE ERREUR cachée derrière le 403
                        .requestMatchers("/actes/**").permitAll()

                        // Patient routes
                        .requestMatchers("/patient/**").hasRole("PATIENT")

                        // Kine routes
                        .requestMatchers("/kine/**").hasRole("KINE")

                        // Doctor routes
                        .requestMatchers("/docteur/**").hasRole("DOCTEUR")

                        // Pharmacist routes
                        .requestMatchers("/pharmasis/**").hasRole("PHARMASIS")

                        // Laboratory routes
                        .requestMatchers("/laboratory/**").hasRole("LABORATORY")

                        // Any other request must be authenticated
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
