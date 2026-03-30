package tn.esprit.pi.tbibi.services;

<<<<<<< HEAD
import tn.esprit.pi.tbibi.DTO.AuthResponse;
import tn.esprit.pi.tbibi.DTO.LoginRequest;
import tn.esprit.pi.tbibi.DTO.RegisterRequest;
import tn.esprit.pi.tbibi.entities.User;

public interface IAuthService {

    User register(RegisterRequest req);

    AuthResponse login(LoginRequest req);
=======
import jakarta.mail.MessagingException;
import tn.esprit.pi.tbibi.DTO.AuthResponse;
import tn.esprit.pi.tbibi.DTO.LoginRequest;
import tn.esprit.pi.tbibi.DTO.RegisterRequest;

public interface IAuthService {

    void register(RegisterRequest req) throws MessagingException;

    AuthResponse login(LoginRequest req);

    void activateAccount(String token) throws MessagingException;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
}