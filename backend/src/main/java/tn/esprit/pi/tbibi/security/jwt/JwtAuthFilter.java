package tn.esprit.pi.tbibi.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tn.esprit.pi.tbibi.security.CustomUserDetailsService;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    // Liste des chemins publics qui ne nécessitent pas de token JWT
    private static final List<String> PUBLIC_PATHS = Arrays.asList(
            "/auth/register",
            "/auth/login",
            "/auth/test"
    );

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        log.debug("JwtAuthFilter - Processing request: {} {}", method, path);
        if (path.startsWith("/auth/")) {
            log.debug("🔴 Public path, skipping filter");
            filterChain.doFilter(request, response);
            return;
        }

        // Ne pas appliquer le filtre aux endpoints publics
        if (isPublicPath(path)) {
            log.debug("JwtAuthFilter - Public path: {}, skipping filter", path);
            filterChain.doFilter(request, response);
            return;
        }

        // 🟢 MODIFIÉ: Pour les requêtes GET, on tente tout de même de décoder le JWT si présent
        // afin de remplir le SecurityContext (nécessaire pour /prescriptions/my par exemple).
        // Si aucun token n'est présent, on laisse passer normalement (routes publiques).

        String authHeader = request.getHeader("Authorization");
        log.debug("🔴 Auth Header: {}", authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("JwtAuthFilter - No valid Bearer token found for protected path: {}", path);
            // Ne pas bloquer, laisser Spring Security gérer l'accès
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            // Essayer de décoder le token pour voir s'il est valide
            String[] parts = token.split("\\.");
            if (parts.length >= 2) {
                String header = new String(java.util.Base64.getDecoder().decode(parts[0]));
                String payload = new String(java.util.Base64.getDecoder().decode(parts[1]));
                log.debug("🔴 Header décodé: {}", header);
                log.debug("🔴 Payload décodé: {}", payload);
            }
        } catch (Exception e) {
            log.error("🔴 ERREUR décodage token: {}", e.getMessage());
        }
        String email;

        try {
            email = jwtService.extractEmail(token);
            log.debug("JwtAuthFilter - Extracted email from token: {}", email);
        } catch (Exception e) {
            log.error("JwtAuthFilter - Failed to extract email from token: {}", e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }
        log.debug("🔴 Authentication existante: {}", SecurityContextHolder.getContext().getAuthentication());

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            log.debug("JwtAuthFilter - Loading user details for email: {}", email);

            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (jwtService.isTokenValid(token, userDetails)) {
                    log.debug("JwtAuthFilter - Token is valid, setting authentication for user: {}", email);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    log.debug("🔴 AVANT setAuthentication - authToken: {}", authToken);

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("🔴 APRÈS setAuthentication - Présent: {}",
                            SecurityContextHolder.getContext().getAuthentication() != null);
                    log.debug("🔴 APRÈS setAuthentication - Authorities: {}",
                            SecurityContextHolder.getContext().getAuthentication().getAuthorities());

                } else {
                    log.warn("JwtAuthFilter - Token is invalid for user: {}", email);
                    log.warn("🔴🔴🔴 TOKEN INVALIDE pour: {}", email);
                }
            } catch (Exception e) {
                log.error("JwtAuthFilter - Error loading user details: {}", e.getMessage());
                log.error("🔴🔴🔴 EXCEPTION pendant l'authentification: {}", e.getMessage(), e);
            }
        }
        else {
            log.debug("🔴 Condition NON satisfaite - email null ou déjà authentifié");
            log.debug("🔴 email != null? {}", email != null);
            log.debug("🔴 Authentication == null? {}", SecurityContextHolder.getContext().getAuthentication() == null);
        }
        
        // Correction: Il y avait un double appel à filterChain.doFilter() ici qui a été retiré
        filterChain.doFilter(request, response);
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }
}
