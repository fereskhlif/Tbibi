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
                        // Public routes
                        .requestMatchers(new AntPathRequestMatcher("/auth/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/public/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/appointement/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/appointement")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/appointment/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/appointment")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/doctor/schedules/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/doctor/schedules")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/chronic/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/chronic")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/notifications/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/notifications")).permitAll()

                        // *** DIAGNOSTIC: allow everything to confirm security is the root cause ***
                        // Role-based routes (keep these AFTER the public routes above)
                        .requestMatchers(new AntPathRequestMatcher("/patient/**")).hasRole("PATIENT")
                        .requestMatchers(new AntPathRequestMatcher("/kine/**")).hasRole("KINE")
                        .requestMatchers(new AntPathRequestMatcher("/doctor/**")).hasAnyRole("DOCTOR", "DOCTEUR")
                        .requestMatchers(new AntPathRequestMatcher("/pharmasis/**")).hasRole("PHARMASIS")
                        .requestMatchers(new AntPathRequestMatcher("/laboratory/**")).hasRole("LABORATORY")

                        .anyRequest().authenticated())
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