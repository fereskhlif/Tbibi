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
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
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
                .csrf(AbstractHttpConfigurer::disable)
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
                        .requestMatchers("/api/public/**").permitAll()

                        // Serve uploaded images publicly
                        .requestMatchers("/uploads/**").permitAll()

                        // Appointment routes
                        .requestMatchers("/appointement/**").permitAll()
                        .requestMatchers("/appointment/**").permitAll()

                        // Schedule routes
                        .requestMatchers("/api/doctor/schedules/**").permitAll()

                        // Chronic disease routes
                        .requestMatchers("/api/chronic/**").permitAll()

                        // Websocket chat
                        .requestMatchers("/ws-chat/**").permitAll()

                        // Health goals routes
                        .requestMatchers("/api/health-goals", "/api/health-goals/**").permitAll()

                        // Notification routes
                        .requestMatchers("/notifications/**").permitAll()

                        // Allow doctor to append history and search patients without blocking on JwtAuthFilter missing auth
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/medical-records/*/history").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/medical-records/patients/search").permitAll()

                        // Patient self-service: view, upload, update, delete image
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/medical-records/my").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/medical-records/my/upload-image").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/medical-records/my").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/medical-records/my/image").authenticated()

                        .requestMatchers("/medical-records/**").permitAll()
                        .requestMatchers("/prescriptions/**").permitAll()
                        .requestMatchers("/actes/**").permitAll()

                        // Patient routes
                        .requestMatchers("/patient/**").hasRole("PATIENT")

                        // Kine routes
                        .requestMatchers("/kine/**").hasRole("KINE")

                        // Doctor routes
                        .requestMatchers("/doctor/**").hasAnyRole("DOCTOR", "DOCTEUR")
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
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
