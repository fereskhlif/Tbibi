package tn.esprit.pi.tbibi.DTO;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank(message = "Invalid name") @Size(min = 2, max = 100, message = "Invalid name") @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\s'\\-]{2,100}$", message = "Invalid name") String name,

        @NotBlank(message = "Invalid email") @Email(message = "Invalid email") @Size(max = 254, message = "Invalid email") @Pattern(regexp = "^[a-zA-Z0-9_+&*\\-]+(?:\\.[a-zA-Z0-9_+&*\\-]+)*@(?:[a-zA-Z0-9\\-]+\\.)+[a-zA-Z]{2,7}$", message = "Invalid email") String email,

        @NotBlank(message = "Invalid password") @Size(min = 8, max = 64, message = "Invalid password") @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\\\\|,.<>/?]).{8,64}$", message = "Invalid password") String password,
        @NotBlank(message = "Invalid role") String roleName,

        @Past(message = "Invalid date of birth") LocalDate dateOfBirth,

        String gender,
        @Size(max = 200, message = "Invalid address") @Pattern(regexp = "^[a-zA-ZÀ-ÿ0-9\\s,.'\\-]{0,200}$", message = "Invalid address") String adresse,
        String specialty,
        String documentBase64,
        String documentName,

        @Size(max = 150, message = "Invalid pharmacy name") @Pattern(regexp = "^[a-zA-ZÀ-ÿ0-9\\s'\\-]{0,150}$", message = "Invalid pharmacy name") String pharmacyName,

        @Size(max = 200, message = "Invalid pharmacy address") @Pattern(regexp = "^[a-zA-ZÀ-ÿ0-9\\s,.'\\-]{0,200}$", message = "Invalid pharmacy address") String pharmacyAddress,
        @NotBlank(message = "Invalid phone number") String phone,
        String profilePictureBase64,
        String profilePictureName) {
}