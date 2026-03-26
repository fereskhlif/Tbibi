package tn.esprit.pi.tbibi.services;

<<<<<<< HEAD
=======
import jakarta.mail.MessagingException;
>>>>>>> backend-spring-security
import tn.esprit.pi.tbibi.DTO.AuthResponse;
import tn.esprit.pi.tbibi.DTO.LoginRequest;
import tn.esprit.pi.tbibi.DTO.RegisterRequest;
import tn.esprit.pi.tbibi.entities.User;

public interface IAuthService {

    User register(RegisterRequest req);

    AuthResponse login(LoginRequest req);
    void register(RegisterRequest req) throws MessagingException;

    AuthResponse login(LoginRequest req);

    void activateAccount(String token) throws MessagingException;
}