package tn.esprit.pi.tbibi.security.jwt;

<<<<<<< HEAD
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
=======
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
<<<<<<< HEAD
=======
import lombok.extern.slf4j.Slf4j;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6

@Slf4j
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
<<<<<<< HEAD
            @Value("${app.jwt.expiration-ms}") long expirationMs
    ) {
=======
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(UserDetails userDetails) {
        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_USER");

        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

<<<<<<< HEAD
        // ✅ Créer les claims correctement
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", userDetails.getUsername());  // L'email
        claims.put("role", role);                      // Le rôle
        claims.put("iat", now.getTime());
        claims.put("exp", exp.getTime());

        log.info("=== GÉNÉRATION TOKEN ===");
        log.info("Username: {}", userDetails.getUsername());
        log.info("Role: {}", role);
        log.info("Claims: {}", claims);

        String token = Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        log.info("Token généré: {}", token);

        // Décoder pour vérifier
        try {
            String[] parts = token.split("\\.");
            String payload = new String(java.util.Base64.getDecoder().decode(parts[1]));
            log.info("Payload décodé: {}", payload);
        } catch (Exception e) {
            log.error("Erreur décodage: {}", e.getMessage());
        }

        return token;
    }
    public String extractEmail(String token) {
        try {
            Claims claims = parseClaims(token);
            String email = claims.getSubject();

            // Si le subject est null, essayer de récupérer depuis les claims
            if (email == null) {
                email = claims.get("sub", String.class);
            }

            log.info("Email extrait du token: {}", email);
            return email;
        } catch (Exception e) {
            log.error("Erreur extraction email: {}", e.getMessage());
            return null;
        }
=======
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claims(Map.of("role", role))
                .issuedAt(now)
                .expiration(exp)
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            String email = extractEmail(token);
<<<<<<< HEAD
            boolean isValid = email != null &&
                    email.equals(userDetails.getUsername()) &&
                    !isTokenExpired(token);

            log.info("Token valide? {} pour {}", isValid, email);
            return isValid;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Token validation error: {}", e.getMessage());
=======
            return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
<<<<<<< HEAD
        try {
            Date exp = parseClaims(token).getExpiration();
            boolean expired = exp.before(new Date());
            if (expired) {
                log.warn("Token expiré le: {}", exp);
            }
            return expired;
        } catch (Exception e) {
            log.error("Erreur vérification expiration: {}", e.getMessage());
            return true;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
=======
        Date exp = parseClaims(token).getExpiration();
        return exp.before(new Date());
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    }
}