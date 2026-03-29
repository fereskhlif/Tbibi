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

        // ✅ Temporarily allow all users to login (including PENDING)
        // TODO: Re-enable status check after admin approves users
        boolean isEnabled = u.isEnabled();
        // tn.esprit.pi.tbibi.entities.UserStatus status = u.getAccountStatus();
        // if (status != null && status != tn.esprit.pi.tbibi.entities.UserStatus.ACTIVE) {
        //     isEnabled = false;
        // }

        return org.springframework.security.core.userdetails.User
                .withUsername(u.getEmail())
                .password(u.getPassword())
                .authorities(authorities)
                .disabled(!isEnabled)
                .build();
    }
}