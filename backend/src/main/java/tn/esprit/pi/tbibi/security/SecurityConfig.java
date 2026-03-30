package tn.esprit.pi.tbibi.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
<<<<<<< HEAD
import org.springframework.security.config.http.SessionCreationPolicy;
=======
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import tn.esprit.pi.tbibi.security.jwt.JwtAuthFilter;

import java.util.List;

@Configuration
<<<<<<< HEAD
=======
@EnableWebSecurity
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
<<<<<<< HEAD
    private final PasswordEncoder passwordEncoder;
    private final JwtAuthFilter jwtAuthFilter;
=======
    private final JwtAuthFilter jwtAuthFilter;
    private final PasswordEncoder passwordEncoder;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6

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
<<<<<<< HEAD
                .csrf(csrf -> csrf.disable())
=======
                .csrf(AbstractHttpConfigurer::disable)
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authProvider())
                .authorizeHttpRequests(auth -> auth
<<<<<<< HEAD
                        // Public routes - no authentication needed
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/medical-records/**").authenticated()
                        .requestMatchers("/prescriptions/**").authenticated()

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
=======
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

>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
<<<<<<< HEAD
        // ✅ SOLUTION: Utiliser allowedOriginPatterns pour accepter tous les ports
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
=======
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}