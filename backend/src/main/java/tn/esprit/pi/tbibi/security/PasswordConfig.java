package tn.esprit.pi.tbibi.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
<<<<<<< HEAD
=======
import org.springframework.context.annotation.Primary;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {
    @Bean
<<<<<<< HEAD
=======
    @Primary
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
