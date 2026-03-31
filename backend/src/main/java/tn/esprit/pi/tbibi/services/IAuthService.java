package tn.esprit.pi.tbibi.services;

import jakarta.mail.MessagingException;
import tn.esprit.pi.tbibi.DTO.AuthResponse;
import tn.esprit.pi.tbibi.DTO.LoginRequest;
import tn.esprit.pi.tbibi.DTO.RegisterRequest;

public interface IAuthService {

    void register(RegisterRequest req) throws MessagingException;

    AuthResponse login(LoginRequest req);

    void activateAccount(String token) throws MessagingException;
    
    void forgotPassword(String email) throws MessagingException;
    
    void resetPassword(String token, String newPassword);
}