package tn.esprit.pi.tbibi.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import tn.esprit.pi.tbibi.security.jwt.JwtAuthFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;
    private final PasswordEncoder passwordEncoder;

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
                        .dispatcherTypeMatchers(jakarta.servlet.DispatcherType.FORWARD, jakarta.servlet.DispatcherType.ERROR).permitAll()

                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                        // Auth routes
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/api/auth/forgot-password", "/api/auth/reset-password").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/public/**").permitAll()

                        // Uploads
                        .requestMatchers("/uploads/**").permitAll()

                        // Appointment routes
                        .requestMatchers("/appointement/**").permitAll()
                        .requestMatchers("/appointment/**").permitAll()

                        // Schedule routes
                        .requestMatchers("/api/doctor/schedules/**").permitAll()

                        // Chronic disease routes
                        .requestMatchers("/api/chronic/**").permitAll()

                        // Websocket chat
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/ws-chat/**").permitAll()

                        // Health goals routes
                        .requestMatchers("/api/health-goals", "/api/health-goals/**").permitAll()

                        // Notification routes
                        .requestMatchers("/notifications/**").permitAll()
                        .requestMatchers("/api/notifications/**").permitAll()

                        // Medical records
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/medical-records/*/history").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/medical-records/patients/search").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/medical-records/my").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/medical-records/my/upload-image").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/medical-records/my").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/medical-records/my/image").authenticated()
                        .requestMatchers("/medical-records/**").permitAll()
                        .requestMatchers("/prescriptions/**").permitAll()
                        .requestMatchers("/actes/**").permitAll()

                        // Role-based routes
                        .requestMatchers("/patient/**").hasRole("PATIENT")
                        .requestMatchers("/kine/**").hasRole("KINE")
                        .requestMatchers("/doctor/**").hasAnyRole("DOCTOR", "DOCTEUR")
                        .requestMatchers("/docteur/**").hasRole("DOCTEUR")
                        .requestMatchers("/pharmasis/**").hasRole("PHARMASIS")
                        .requestMatchers("/laboratory/**").hasRole("LABORATORY")

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