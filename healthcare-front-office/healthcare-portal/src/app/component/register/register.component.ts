import { Component } from '@angular/core';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {

  email = '';
  password = '';
  selectedRole = '';
  uploadedDocument: string | null = null;  // 👈 AJOUTEZ CETTE LIGNE
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService) { }

  // Méthode pour gérer l'upload de document
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedDocument = file.name;  // 👈 Stocke le nom du fichier
    }
  }

  onSubmit(): void {
    if (!this.email || !this.password || !this.selectedRole) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    this.isLoading = true;

    const registerData: RegisterRequest = {
      name: "User",
      email: this.email,
      password: this.password,
      roleName: this.selectedRole,
      phone: '', // Added to fix TS2741 compilation error
      documentName: this.uploadedDocument || undefined
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        alert('Registration successful!');
        // Redirection ou autre action
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error || 'Registration failed';
      }
    });
  }
}