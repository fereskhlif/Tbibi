package tn.esprit.pi.tbibi.security;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

        private final UserRepo userRepository;

        @Override
        @Transactional
        public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
                User u = userRepository.findByEmail(email)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().getRoleName()));

                boolean isEnabled = u.getEnabled() != null ? u.getEnabled() : true;
                tn.esprit.pi.tbibi.entities.UserStatus status = u.getAccountStatus();

                // Block login if status is not ACTIVE (for old rows, assume ACTIVE if null)
                if (status != null && status != tn.esprit.pi.tbibi.entities.UserStatus.ACTIVE) {
                        isEnabled = false;
                }

                return org.springframework.security.core.userdetails.User
                                .withUsername(u.getEmail())
                                .password(u.getPassword())
                                .authorities(authorities)
                                .disabled(!u.isEnabled())
                                .build();
        }
}