package tn.esprit.pi.tbibi.services;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.AuthResponse;
import tn.esprit.pi.tbibi.entities.Role;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.entities.UserStatus;
import tn.esprit.pi.tbibi.repositories.RoleRepo;
import tn.esprit.pi.tbibi.repositories.UserRepository;
import tn.esprit.pi.tbibi.security.jwt.JwtService;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final RoleRepo roleRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Value("${google.client.id:YOUR_GOOGLE_CLIENT_ID}")
    private String googleClientId;

    public AuthResponse authenticateWithGoogle(String idToken, String roleName) {
        try {
            // Vérifier le token Google
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);
            
            if (googleIdToken == null) {
                throw new RuntimeException("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            log.info("Google authentication for email: {}", email);

            // Chercher ou créer l'utilisateur
            Optional<User> existingUser = userRepository.findByEmail(email);
            User user;

            if (existingUser.isPresent()) {
                user = existingUser.get();
                log.info("Existing user found: {}", email);
            } else {
                // Créer un nouvel utilisateur
                Role role = roleRepo.findByRoleName(roleName);
                if (role == null) {
                    throw new RuntimeException("Role not found: " + roleName);
                }

                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setProfilePicture(pictureUrl);
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Mot de passe aléatoire
                user.setRole(role);
                user.setEnabled(true);
                user.setAccountStatus(UserStatus.ACTIVE); // Auto-approuver les comptes Google

                user = userRepository.save(user);
                log.info("New user created from Google: {}", email);
            }

            // Générer le JWT
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String jwt = jwtService.generateToken(userDetails);

            // Récupérer le rôle
            String roleStr = user.getRole() != null ? user.getRole().getRoleName() : "ROLE_PATIENT";

            return new AuthResponse(
                jwt, 
                email, 
                roleStr, 
                user.getUserId(),
                user.getName(),
                user.getProfilePicture(),
                user.getAccountStatus() != null ? user.getAccountStatus().toString() : "ACTIVE"
            );

        } catch (Exception e) {
            log.error("Error during Google authentication", e);
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }
}
