// Import necessary Angular modules and services
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';

// Component decorator with metadata
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  styleUrl: './login.component.css',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  // Form group for login form with validation
  loginForm: FormGroup;
  // Error message to display to user
  errorMessage: string = '';

  // Constructor with dependency injection
  constructor(
    private fb: FormBuilder,          // Form builder service
    private userService: UserService, // User management service
    private router: Router           // Navigation service
  ) {
    // Initialize login form with validators
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  // Handle form submission
  async onSubmit() {
    this.errorMessage = '';
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      // Attempt to login user
      if (await this.userService.login(email, password)) {
        this.router.navigate(['/products']); // Navigate to products page on success
      } else {
        this.errorMessage = 'Invalid email or password';
      }
    }
  }

  // Form control getters for template access
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
